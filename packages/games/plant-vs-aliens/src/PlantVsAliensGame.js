import {
  GRID_COLS,
  GRID_ROWS,
  MONEY_DROP_LIFETIME,
  PLANT_TYPES,
  ALIEN_TYPES,
  STARTING_MONEY,
} from "./constants.js";
import { Grid } from "./Grid.js";
import { PlantBar } from "./PlantBar.js";
import { RoundManager } from "./RoundManager.js";
import { uid, clamp, pickByWeight } from "./utils.js";
import { createPlantSprite, createAlienSprite } from "./spriteFactory.js";
import { LayoutManager } from "./LayoutManager.js";

const PROJECTILE_SPEED = 6; // tiles per second
const ALIEN_WIDTH = 0.85; // tiles
const ROUND_SPAWN_INTERVAL = 1100; // ms
const MAX_ACTIVE_ALIENS = 3;
const QUEUE_SPACING = 0.12; // tiles between queued aliens
const DEBUG_COIN_SPAWN = false;
const BOSS_ROUNDS = new Map([
  [
    5,
    {
      kind: "boss5",
      label: "Mini-boss",
      hpMultiplier: 1.6,
      rewardMultiplier: 2.2,
      speedMultiplier: 0.5,
      triggerFront: GRID_COLS - 0.1,
      telegraphFront: GRID_COLS + 0.4,
      patterns: {
        front: 0.4,
        walls: 0.2,
        sun: 0.2,
        frontWalls: 0.2,
      },
    },
  ],
  [
    10,
    {
      kind: "boss10",
      label: "Boss",
      hpMultiplier: 2.6,
      rewardMultiplier: 3.2,
      speedMultiplier: 0.45,
      triggerFront: GRID_COLS - 0.1,
      telegraphFront: GRID_COLS + 0.4,
      ultimates: {
        half: 1,
      },
    },
  ],
]);

export class PlantVsAliensGame {
  constructor(ui) {
    this.ui = ui;
    this.boardElement = ui.board;
    this.gridState = [];
    this.plants = new Map();
    this.aliens = [];
    this.projectiles = [];
    this.moneyDrops = new Map();
    this.selectedPlant = null;
    this.money = STARTING_MONEY;
    this.lastTime = 0;
    this.running = false;
    this.gameEnded = false;
    this.statusMessage = "";

    this.grid = new Grid(this.boardElement, {
      onTileClick: (row, col) => this.placePlant(row, col),
      onTileHover: (row, col, active) => this.handleTileHover(row, col, active),
    });

    this.plantBar = new PlantBar(ui.plantBar, {
      onSelect: (type) => this.setSelectedPlant(type),
    });

    this.roundManager = new RoundManager();
    this.roundActive = false;
    this.remainingToSpawn = 0;
    this.spawnTimer = 0;
    this.currentSpawnWeights = { basic: 1 };
    this.bossBannerTimer = 0;

    this.resetGridState();
    this.bindRestart();
    this.bindRoundButton();
    this.layoutManager = new LayoutManager({
      container: ui.layoutRoot,
      boardWrapper: ui.boardWrapper,
      board: ui.board,
      rows: GRID_ROWS,
      cols: GRID_COLS,
      onResize: () => this.handleResize(),
    });
  }

  bindRestart() {
    this.ui.restartButton?.addEventListener("click", () => this.restart());
  }

  bindRoundButton() {
    this.ui.roundButton?.addEventListener("click", () => this.beginRound());
  }

  resetGridState() {
    this.gridState = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
  }

  start() {
    if (this.running) return;
    this.restart();
  }

  restart() {
    this.stop();
    this.clearEntities();
    this.resetGridState();
    this.money = STARTING_MONEY;
    this.plants.clear();
    this.aliens = [];
    this.projectiles = [];
    this.moneyDrops.clear();
    this.gameEnded = false;
    this.selectedPlant = null;
    this.roundManager.reset();
    this.roundActive = false;
    this.remainingToSpawn = 0;
    this.spawnTimer = 0;
    this.currentSpawnWeights = { basic: 1 };
    this.bossBannerTimer = 0;
    this.hideBossBanner();
    if (this.ui.endOverlay) {
      this.ui.endOverlay.hidden = true;
    }
    if (this.ui.roundOverlay) {
      this.ui.roundOverlay.hidden = true;
    }
    this.setStatus("Prepare your defense.");
    this.setMessage("Place plants, collect drops, then start the round.");
    this.updateMoneyDisplay();
    this.updateRoundDisplay(0, this.roundManager.getTotalRounds());
    this.enterBuildPhase();
    this.plantBar.updateAvailability(this.money);
    this.plantBar.setSelected(null);
    this.lastTime = 0;
    this.running = true;
    this.loopHandle = requestAnimationFrame((time) => this.loop(time));
  }

  handleResize() {
    this.grid.refreshTileSize();
    this.plants.forEach((plant) => this.positionPlantElement(plant));
    this.aliens.forEach((alien) => this.positionAlien(alien));
    this.projectiles.forEach((projectile) => this.positionProjectile(projectile));
    this.moneyDrops.forEach((drop) => this.positionMoneyDrop(drop));
  }

  enterBuildPhase() {
    if (this.gameEnded) return;
    const nextInfo = this.roundManager.getNextRoundInfo();
    if (!nextInfo) return;
    const bonus = this.roundManager.getRoundBonus();
    if (this.ui.roundOverlay) {
      this.ui.roundOverlay.hidden = false;
    }
    if (this.ui.roundTitle) {
      this.ui.roundTitle.textContent = `Prepare for Round ${nextInfo.round}`;
    }
    if (this.ui.roundSubtitle) {
      this.ui.roundSubtitle.textContent = `${nextInfo.totalAliens} aliens are queued. Clear the round for +${bonus} money.`;
    }
    if (this.ui.roundButton) {
      this.ui.roundButton.textContent = `Start Round ${nextInfo.round}`;
    }
    this.setStatus("Build phase");
    this.updateRoundDisplay(this.roundManager.getCurrentRoundNumber(), this.roundManager.getTotalRounds());
  }

  beginRound() {
    if (this.gameEnded || this.roundActive) return;
    const info = this.roundManager.startNextRound();
    if (!info) return;
    this.roundActive = true;
    this.remainingToSpawn = info.totalAliens;
    this.spawnTimer = ROUND_SPAWN_INTERVAL;
    this.currentSpawnWeights = info.weights;
    if (this.spawnBossForRound(info.round)) {
      this.remainingToSpawn = 0;
      this.currentSpawnWeights = {};
    }
    if (this.ui.roundOverlay) {
      this.ui.roundOverlay.hidden = true;
    }
    this.setStatus(`Round ${info.round} in progress`);
    this.setMessage(`${info.totalAliens} aliens approaching. Hold the line!`);
    this.updateRoundDisplay(info.round, this.roundManager.getTotalRounds());
    this.updateRoundSpawns(0);
  }

  updateRoundSpawns(deltaMs) {
    if (!this.roundActive || this.remainingToSpawn <= 0) return;
    this.spawnTimer += deltaMs;
    while (this.spawnTimer >= ROUND_SPAWN_INTERVAL && this.remainingToSpawn > 0) {
      if (!this.spawnFromCurrentRound()) {
        this.spawnTimer = ROUND_SPAWN_INTERVAL;
        break;
      }
      this.spawnTimer -= ROUND_SPAWN_INTERVAL;
    }
  }

  spawnFromCurrentRound() {
    if (this.remainingToSpawn <= 0) return false;
    if (this.aliens.length >= MAX_ACTIVE_ALIENS) return false;
    const type = pickByWeight(this.currentSpawnWeights) || "basic";
    this.spawnAlien(type);
    this.remainingToSpawn -= 1;
    return true;
  }

  checkRoundCompletion() {
    if (!this.roundActive) return;
    if (this.remainingToSpawn === 0 && this.aliens.length === 0) {
      this.handleRoundComplete();
    }
  }

  handleRoundComplete() {
    this.roundActive = false;
    const clearedRound = this.roundManager.getCurrentRoundNumber();
    let bonus = 0;
    if (clearedRound <= 4) {
      bonus = this.roundManager.getRoundBonus();
      this.money += bonus;
      this.updateMoneyDisplay();
      this.setMessage(`Build phase unlocked. Bonus +${bonus} money.`);
    } else {
      this.setMessage("Build phase unlocked. No bonus after Round 4.");
    }
    this.setStatus(`Round ${clearedRound} cleared`);
    if (this.roundManager.isComplete()) {
      this.triggerWin();
    } else {
      this.enterBuildPhase();
    }
  }

  stop() {
    if (this.loopHandle) {
      cancelAnimationFrame(this.loopHandle);
      this.loopHandle = null;
    }
    this.running = false;
  }

  clearEntities() {
    this.boardElement.querySelectorAll(".entity, .projectile, .money-drop").forEach((node) => {
      node.remove();
    });
  }

  setSelectedPlant(type) {
    this.selectedPlant = type;
    this.setMessage(type ? `Placing ${PLANT_TYPES[type].name}` : "Select a plant to deploy.");
  }

  handleTileHover(row, col, active) {
    if (!this.selectedPlant) return;
    const canPlace = this.canPlacePlant(row, col);
    this.grid.highlightTile(row, col, active && canPlace);
  }

  canPlacePlant(row, col) {
    if (!this.selectedPlant) return false;
    if (this.gridState[row][col]) return false;
    const plantDef = PLANT_TYPES[this.selectedPlant];
    if (!plantDef) return false;
    return this.money >= plantDef.cost;
  }

  placePlant(row, col) {
    if (!this.running || this.gameEnded) return;
    if (!this.selectedPlant) {
      this.setMessage("Select a plant first.");
      return;
    }
    if (this.gridState[row][col]) {
      this.setMessage("That tile is already occupied.");
      return;
    }
    const plantDef = PLANT_TYPES[this.selectedPlant];
    if (!plantDef) return;
    if (this.money < plantDef.cost) {
      this.setMessage("Not enough money.");
      return;
    }
    this.money -= plantDef.cost;
    this.updateMoneyDisplay();

    const visuals = this.createPlantVisual(plantDef.key);
    const plant = {
      id: uid("plant"),
      type: this.selectedPlant,
      row,
      col,
      hp: plantDef.maxHP,
      lastShot: 0,
      nextGenerate: performance.now() + (plantDef.generateInterval || 0),
      element: visuals.element,
      animator: visuals.animator,
      engagedAlienId: null,
    };

    this.gridState[row][col] = plant.id;
    this.plants.set(plant.id, plant);
    this.positionPlantElement(plant);
    this.boardElement.appendChild(plant.element);
    this.setMessage(`${plantDef.name} planted.`);
    this.plantBar.updateAvailability(this.money);
  }

  createPlantVisual(type) {
    const element = document.createElement("div");
    const baseClass = {
      pea: "plant",
      sun: "plant plant--sun",
      wall: "plant plant--wall",
      ice: "plant plant--ice",
    }[type] || "plant";
    element.className = `entity ${baseClass}`;
    const sprite = createPlantSprite(type);
    element.appendChild(sprite.element);
    return { element, animator: sprite };
  }

  positionPlantElement(plant) {
    const { x, y } = this.grid.getPosition(plant.row, plant.col);
    const offset = this.grid.tileSize * 0.05;
    plant.element.style.transform = `translate(${x + offset}px, ${y + offset}px)`;
  }

  loop(timestamp) {
    if (!this.running) return;
    if (!this.lastTime) this.lastTime = timestamp;
    const deltaMs = timestamp - this.lastTime;
    const deltaSeconds = deltaMs / 1000;
    this.lastTime = timestamp;

    this.updateRoundSpawns(deltaMs);
    this.updatePlants(timestamp, deltaSeconds, deltaMs);
    this.updateAliens(deltaSeconds, deltaMs);
    this.updateBossAbilities(deltaMs);
    this.updateProjectiles(deltaSeconds);
    this.updateMoneyDrops(deltaMs);
    this.updateBossBanner(deltaMs);
    this.plantBar.updateAvailability(this.money);
    this.checkRoundCompletion();

    if (this.running) {
      this.loopHandle = requestAnimationFrame((time) => this.loop(time));
    }
  }

  updatePlants(now, deltaSeconds, deltaMs) {
    this.plants.forEach((plant) => {
      const def = PLANT_TYPES[plant.type];
      if (!def) return;
      plant.animator?.update(deltaMs);

      if (def.fireRate && def.damage) {
        const hasTargets = this.aliens.some((alien) => alien.row === plant.row);
        if (hasTargets && now - plant.lastShot >= def.fireRate) {
          plant.lastShot = now;
          this.spawnProjectile(plant, def);
        }
      }

      if (def.generateInterval && now >= plant.nextGenerate) {
        plant.nextGenerate = now + def.generateInterval;
        this.spawnMoneyDrop({
          amount: def.generateAmount || 25,
          x: plant.col + 0.5,
          y: plant.row + 0.5,
        });
      }
    });
  }

  spawnProjectile(plant, def) {
    const projectile = {
      id: uid("proj"),
      row: plant.row,
      x: plant.col + 0.5,
      speed: PROJECTILE_SPEED,
      damage: def.damage,
      element: this.createProjectileElement(def.key),
      slowPercent: def.slowPercent || 0,
      slowDuration: def.slowDuration || 0,
      sourcePlantType: plant.type,
    };
    this.projectiles.push(projectile);
    this.boardElement.appendChild(projectile.element);
    this.positionProjectile(projectile);
  }

  createProjectileElement(type) {
    const el = document.createElement("div");
    const extra = type === "ice" ? " projectile--ice" : "";
    el.className = `projectile${extra}`;
    return el;
  }

  positionProjectile(projectile) {
    const y = projectile.row * this.grid.tileSize + this.grid.tileSize * 0.45;
    const x = projectile.x * this.grid.tileSize;
    projectile.element.style.transform = `translate(${x}px, ${y}px)`;
  }

  updateProjectiles(deltaSeconds) {
    const survivors = [];
    for (const projectile of this.projectiles) {
      projectile.x += projectile.speed * deltaSeconds;
      const target = this.getFrontAlienInRow(projectile.row);
      if (!target || projectile.x < target.front) {
        if (projectile.x <= GRID_COLS + 1) {
          this.positionProjectile(projectile);
          survivors.push(projectile);
        } else {
          projectile.element.remove();
        }
        continue;
      }

      this.applyDamageToAlien(target, projectile.damage, projectile.sourcePlantType);
      if (projectile.slowPercent > 0) {
        target.slowUntil = performance.now() + projectile.slowDuration;
        target.slowPercent = projectile.slowPercent;
      }
      projectile.element.remove();
    }
    this.projectiles = survivors;
  }

  getFrontAlienInRow(row) {
    let candidate = null;
    for (const alien of this.aliens) {
      if (alien.row !== row) continue;
      if (!candidate || alien.front < candidate.front) {
        candidate = alien;
      }
    }
    return candidate;
  }

  spawnAlien(type) {
    if (!this.running || this.gameEnded) return;
    const def = ALIEN_TYPES[type] || ALIEN_TYPES.basic;
    const row = Math.floor(Math.random() * GRID_ROWS);
    const visuals = this.createAlienVisual(def.key);
    const alien = {
      id: uid("alien"),
      type: def.key,
      row,
      front: GRID_COLS + ALIEN_WIDTH,
      hp: def.hp,
      damagePerSecond: def.damagePerSecond,
      baseSpeed: def.speed,
      reward: def.reward,
      slowUntil: 0,
      slowPercent: 0,
      engagingPlantId: null,
      resistances: def.resistances || null,
      element: visuals.element,
      animator: visuals.animator,
    };
    this.aliens.push(alien);
    this.boardElement.appendChild(alien.element);
    this.positionAlien(alien);
    const currentRound = this.roundManager.getCurrentRoundNumber();
    this.setStatus(`Round ${currentRound}: contact in row ${row + 1}`);
  }

  createAlienVisual(type) {
    const el = document.createElement("div");
    const variant = (() => {
      if (type === "boss5" || type === "boss10") {
        return `alien alien--boss${type === "boss10" ? " alien--boss10" : ""}`;
      }
      if (type === "fast") return "alien alien--fast";
      if (type === "tank") return "alien alien--tank";
      return "alien";
    })();
    el.className = `entity ${variant}`;
    const sprite = createAlienSprite(type);
    el.appendChild(sprite.element);
    return { element: el, animator: sprite };
  }

  positionAlien(alien) {
    const y = alien.row * this.grid.tileSize + this.grid.tileSize * 0.15;
    const leftUnits = alien.front - ALIEN_WIDTH;
    const x = leftUnits * this.grid.tileSize;
    alien.element.style.transform = `translate(${x}px, ${y}px)`;
  }

  updateAliens(deltaSeconds, deltaMs) {
    const now = performance.now();
    const aliensByRow = new Map();
    for (const alien of this.aliens) {
      if (alien.dead) continue;
      if (!aliensByRow.has(alien.row)) {
        aliensByRow.set(alien.row, []);
      }
      aliensByRow.get(alien.row).push(alien);
    }

    const survivors = [];
    for (const rowAliens of aliensByRow.values()) {
      rowAliens.sort((a, b) => a.front - b.front);
      let queueActive = false;
      let previousAlien = null;
      for (const alien of rowAliens) {
        alien.animator?.update(deltaMs);
        const speedModifier =
          alien.slowUntil > now ? 1 - (alien.slowPercent || 0) : 1;
        if (alien.slowUntil <= now) {
          alien.slowPercent = 0;
        }
        const speed = Math.max(alien.baseSpeed * speedModifier, 0.05);

        let blockingPlant = null;
        if (!queueActive) {
          blockingPlant = this.getBlockingPlant(alien);
        } else if (alien.engagingPlantId) {
          this.releaseAlienEngagement(alien);
        }

        if (blockingPlant) {
          blockingPlant.hp -= alien.damagePerSecond * deltaSeconds;
          if (blockingPlant.hp <= 0) {
            this.destroyPlant(blockingPlant);
            blockingPlant = null;
          }
        }

        if (!blockingPlant) {
          alien.front -= speed * deltaSeconds;
        }

        if (queueActive && previousAlien) {
          const minFront = previousAlien.front + ALIEN_WIDTH + QUEUE_SPACING;
          if (alien.front < minFront) {
            alien.front = minFront;
          }
        }

        this.positionAlien(alien);

        if (alien.front <= 0) {
          this.triggerLose();
          return;
        }

        if (this.isAlienEngagedWithWall(alien)) {
          queueActive = true;
        }

        previousAlien = alien;

        if (alien.hp > 0 && !alien.dead) {
          survivors.push(alien);
        }
      }
    }
    this.aliens = survivors;
  }

  getBlockingPlant(alien) {
    if (alien.front >= GRID_COLS) {
      this.releaseAlienEngagement(alien);
      return null;
    }
    const col = clamp(Math.floor(alien.front), 0, GRID_COLS - 1);
    const plantId = this.gridState[alien.row][col];
    if (!plantId) {
      this.releaseAlienEngagement(alien);
      return null;
    }
    const plant = this.plants.get(plantId);
    if (!plant) {
      this.releaseAlienEngagement(alien);
      return null;
    }
    if (plant.type === "wall") {
      if (!plant.engagedAlienId) {
        plant.engagedAlienId = alien.id;
        alien.engagingPlantId = plant.id;
      } else if (plant.engagedAlienId !== alien.id) {
        return null;
      }
    } else if (alien.engagingPlantId) {
      this.releaseAlienEngagement(alien);
    }
    return plant;
  }

  isAlienEngagedWithWall(alien) {
    if (!alien.engagingPlantId) return false;
    const plant = this.plants.get(alien.engagingPlantId);
    return Boolean(plant && plant.type === "wall" && plant.engagedAlienId === alien.id);
  }

  releaseAlienEngagement(alien) {
    if (!alien.engagingPlantId) return;
    const plant = this.plants.get(alien.engagingPlantId);
    if (plant && plant.engagedAlienId === alien.id) {
      plant.engagedAlienId = null;
    }
    alien.engagingPlantId = null;
  }

  releasePlantEngagement(plant) {
    if (!plant.engagedAlienId) return;
    const engagedAlien = this.aliens.find((alien) => alien.id === plant.engagedAlienId);
    if (engagedAlien && engagedAlien.engagingPlantId === plant.id) {
      engagedAlien.engagingPlantId = null;
    }
    plant.engagedAlienId = null;
  }

  applyDamageToAlien(alien, damage, sourceType) {
    const modifier = this.getDamageModifier(alien, sourceType);
    const adjustedDamage = damage * modifier;
    alien.hp -= adjustedDamage;
    if (alien.hp <= 0) {
      this.handleAlienDeath(alien);
    }
  }

  getDamageModifier(alien, sourceType) {
    if (!sourceType || !alien.resistances) return 1;
    if (alien.resistances[sourceType] !== undefined) {
      return alien.resistances[sourceType];
    }
    if (alien.resistances.default !== undefined) {
      return alien.resistances.default;
    }
    return 1;
  }

  handleAlienDeath(alien) {
    alien.dead = true;
    this.releaseAlienEngagement(alien);
    alien.hp = 0;
    alien.element.remove();
    const leftUnits = Math.max(alien.front - ALIEN_WIDTH, 0);
    const centerUnits = leftUnits + ALIEN_WIDTH / 2;
    const deathX = clamp(centerUnits, 0.3, GRID_COLS - 0.3);
    const deathY = clamp(alien.row + 0.5, 0.3, GRID_ROWS - 0.3);
    this.spawnMoneyDrop({
      amount: alien.reward,
      x: deathX,
      y: deathY,
    });
  }

  destroyPlant(plant) {
    this.releasePlantEngagement(plant);
    this.gridState[plant.row][plant.col] = null;
    this.plants.delete(plant.id);
    plant.element.remove();
  }

  spawnBossForRound(round) {
    const bossConfig = BOSS_ROUNDS.get(round);
    if (!bossConfig) return false;
    this.clearAliens();
    const base = ALIEN_TYPES.tank;
    const row = Math.floor(Math.random() * GRID_ROWS);
    const visuals = this.createAlienVisual(bossConfig.kind);
    const boss = {
      id: uid("alien"),
      type: bossConfig.kind,
      row,
      front: GRID_COLS + ALIEN_WIDTH,
      hp: Math.round(base.hp * bossConfig.hpMultiplier),
      damagePerSecond: base.damagePerSecond,
      baseSpeed: base.speed,
      reward: Math.round(base.reward * bossConfig.rewardMultiplier),
      slowUntil: 0,
      slowPercent: 0,
      engagingPlantId: null,
      resistances: base.resistances || null,
      element: visuals.element,
      animator: visuals.animator,
      isBoss: true,
      bossAbility: {
        kind: bossConfig.kind,
        elapsedMs: 0,
        triggerFront: bossConfig.triggerFront,
        telegraphFront: bossConfig.telegraphFront,
        telegraphed: false,
        fired: false,
        pattern: bossConfig.patterns ? pickByWeight(bossConfig.patterns) : null,
        ultimate: bossConfig.ultimates ? pickByWeight(bossConfig.ultimates) : null,
      },
    };
    boss.baseSpeed = base.speed * (bossConfig.speedMultiplier ?? 1);
    this.aliens.push(boss);
    this.boardElement.appendChild(boss.element);
    this.positionAlien(boss);
    this.showBossBanner(`${bossConfig.label} approaching!`, 2200, "warning");
    this.setStatus(`${bossConfig.label} engaged`);
    return true;
  }

  updateBossAbilities(deltaMs) {
    for (const alien of this.aliens) {
      if (!alien.isBoss || !alien.bossAbility || alien.dead) continue;
      const ability = alien.bossAbility;
      if (ability.fired) continue;
      ability.elapsedMs += deltaMs;
      if (ability.triggerFront !== undefined) {
        if (!ability.telegraphed && alien.front <= ability.telegraphFront) {
          ability.telegraphed = true;
          this.showBossBanner("Boss ability incoming!", 900, "telegraph");
        }
        if (alien.front <= ability.triggerFront) {
          ability.fired = true;
          this.executeBossAbility(alien);
        }
        continue;
      }
    }
  }

  executeBossAbility(alien) {
    this.triggerBoardBoom();
    if (alien.bossAbility.kind === "boss5") {
      this.executeRound5BossPattern(alien);
      return;
    }
    if (alien.bossAbility.kind === "boss10") {
      this.executeRound10BossPattern();
    }
  }

  executeRound5BossPattern(alien) {
    const pattern = alien.bossAbility.pattern || "front";
    if (pattern === "walls") {
      this.destroyPlantsOfType("wall", { ensureSurvivor: true, maxCount: 8 });
      this.setMessage("Boss crushed every wall plant!");
      return;
    }
    if (pattern === "sun") {
      this.destroyPlantsOfType("sun", { ensureSurvivor: true, maxCount: 8 });
      this.setMessage("Boss uprooted all sunflowers!");
      return;
    }
    if (pattern === "frontWalls") {
      this.destroyFrontColumns(alien, 2, { ensureSurvivor: true, maxCount: 8 });
      this.destroyPlantsOfType("wall", { ensureSurvivor: true, maxCount: 8 });
      this.setMessage("Boss smashed the front line and walls!");
      return;
    }
    this.destroyFrontColumns(alien, 2, { ensureSurvivor: true, maxCount: 8 });
    this.setMessage("Boss smashed the front line!");
  }

  executeRound10BossPattern() {
    const bossUltimate = pickByWeight(BOSS_ROUNDS.get(10).ultimates) || "half";
    const allPlants = Array.from(this.plants.values());
    const targetCount = Math.floor(allPlants.length / 2);
    const targets = this.pickRandomPlants(allPlants, targetCount);
    this.destroyPlants(targets, { ensureSurvivor: true, maxCount: targetCount });
    this.setMessage("Boss erased half your defenses!");
  }

  destroyFrontColumns(alien, columns, options = {}) {
    const colFront = clamp(Math.floor(alien.front - 0.01), 0, GRID_COLS - 1);
    const colStart = clamp(colFront - (columns - 1), 0, GRID_COLS - 1);
    this.destroyPlantsInLaneColumns(alien.row, colStart, colFront, options);
  }

  destroyPlantsInLaneColumns(row, colStart, colEnd, options = {}) {
    const targets = [];
    for (let col = colStart; col <= colEnd; col += 1) {
      const plantId = this.gridState[row][col];
      if (!plantId) continue;
      const plant = this.plants.get(plantId);
      if (plant) targets.push(plant);
    }
    this.destroyPlants(targets, options);
  }

  destroyPlantsOfType(type, options = {}) {
    const targets = Array.from(this.plants.values()).filter((plant) => plant.type === type);
    this.destroyPlants(targets, options);
  }

  destroyPlants(targets, { ensureSurvivor = false, maxCount = null } = {}) {
    if (!targets.length) return;
    const unique = new Map();
    targets.forEach((plant) => {
      if (plant) unique.set(plant.id, plant);
    });
    let list = Array.from(unique.values());
    if (maxCount !== null) {
      list = this.pickRandomPlants(list, Math.min(maxCount, list.length));
    }
    if (ensureSurvivor) {
      list = this.clampDestruction(list);
    }
    list.forEach((plant) => this.destroyPlant(plant));
  }

  clampDestruction(targets) {
    const totalPlants = this.plants.size;
    if (totalPlants <= 1) return [];
    if (targets.length < totalPlants) return targets;
    let keepPlant = Array.from(this.plants.values()).find((plant) => plant.type !== "wall");
    if (!keepPlant) {
      keepPlant = this.plants.values().next().value;
    }
    if (!keepPlant) return [];
    return targets.filter((plant) => plant.id !== keepPlant.id);
  }

  pickRandomPlants(plants, count) {
    const pool = [...plants];
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.max(0, Math.min(count, pool.length)));
  }

  clearAliens() {
    this.aliens.forEach((alien) => alien.element?.remove());
    this.aliens = [];
  }

  triggerBoardBoom() {
    if (!this.boardElement) return;
    this.boardElement.classList.remove("board--boom");
    void this.boardElement.offsetWidth;
    this.boardElement.classList.add("board--boom");
    setTimeout(() => {
      this.boardElement?.classList.remove("board--boom");
    }, 500);
  }

  showBossBanner(text, durationMs = 2000, variant = "warning") {
    if (!this.ui.bossBanner || !this.ui.bossBannerText) return;
    this.ui.bossBanner.hidden = false;
    this.ui.bossBannerText.textContent = text;
    this.ui.bossBanner.classList.toggle("boss-banner--telegraph", variant === "telegraph");
    this.ui.bossBanner.classList.toggle("boss-banner--warning", variant !== "telegraph");
    this.bossBannerTimer = durationMs;
  }

  updateBossBanner(deltaMs) {
    if (!this.ui.bossBanner || this.bossBannerTimer <= 0) return;
    this.bossBannerTimer = Math.max(0, this.bossBannerTimer - deltaMs);
    if (this.bossBannerTimer === 0) {
      this.hideBossBanner();
    }
  }

  hideBossBanner() {
    if (!this.ui.bossBanner) return;
    this.ui.bossBanner.hidden = true;
  }

  spawnMoneyDrop({ amount, x, y }) {
    const drop = {
      id: uid("drop"),
      amount,
      x,
      y,
      expiresAt: performance.now() + MONEY_DROP_LIFETIME,
      element: this.createMoneyElement(amount),
    };
    if (DEBUG_COIN_SPAWN) {
      // eslint-disable-next-line no-console
      console.debug("[coin-spawn]", drop.id, "grid", { x, y });
    }
    drop.element.addEventListener("click", () => this.collectMoney(drop.id));
    this.moneyDrops.set(drop.id, drop);
    this.boardElement.appendChild(drop.element);
    this.positionMoneyDrop(drop);
  }

  createMoneyElement(amount) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "money-drop";
    el.title = `Collect +${amount}`;
    const inner = document.createElement("span");
    inner.className = "money-drop__inner";
    inner.textContent = `+${amount}`;
    el.appendChild(inner);
    return el;
  }

  positionMoneyDrop(drop) {
    const x = clamp(drop.x, 0.3, GRID_COLS - 0.3) * this.grid.tileSize;
    const y = clamp(drop.y, 0.3, GRID_ROWS - 0.3) * this.grid.tileSize;
    drop.element.style.transform = `translate(${x - 14}px, ${y - 14}px)`;
  }

  collectMoney(id) {
    const drop = this.moneyDrops.get(id);
    if (!drop) return;
    this.moneyDrops.delete(id);
    drop.element.remove();
    this.money += drop.amount;
    this.updateMoneyDisplay();
    this.setMessage(`+${drop.amount} money collected.`);
  }

  updateMoneyDrops(deltaMs) {
    const now = performance.now();
    for (const drop of Array.from(this.moneyDrops.values())) {
      if (now >= drop.expiresAt) {
        drop.element.remove();
        this.moneyDrops.delete(drop.id);
      }
    }
  }

  setMessage(text) {
    if (this.ui.message) {
      this.ui.message.textContent = text;
    }
  }

  updateMoneyDisplay() {
    if (this.ui.moneyDisplay) {
      this.ui.moneyDisplay.textContent = `${this.money}`;
    }
  }

  updateRoundDisplay(current, total) {
    if (this.ui.roundDisplay) {
      this.ui.roundDisplay.textContent = `${current} / ${total}`;
    }
  }

  setStatus(text) {
    if (this.ui.statusDisplay) {
      this.ui.statusDisplay.textContent = text;
    }
  }

  triggerWin() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.stop();
    this.setStatus("Garden secured!");
    this.showOverlay("Victory", "You survived the invasion.", "Play Again");
    if (this.ui.roundOverlay) {
      this.ui.roundOverlay.hidden = true;
    }
  }

  triggerLose() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.stop();
    this.setStatus("Aliens reached the base.");
    this.showOverlay("Defeat", "Aliens breached the left edge.", "Retry");
    if (this.ui.roundOverlay) {
      this.ui.roundOverlay.hidden = true;
    }
  }

  showOverlay(title, subtitle, buttonLabel) {
    this.ui.endOverlay.hidden = false;
    this.ui.endTitle.textContent = title;
    this.ui.endSubtitle.textContent = subtitle;
    if (buttonLabel && this.ui.restartButton) {
      this.ui.restartButton.textContent = buttonLabel;
    }
  }
}
