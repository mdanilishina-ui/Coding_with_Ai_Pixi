import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.mjs";
import { getTexture } from "./assetLoader.js";
import { ObjectPlacementAgent } from "./objectPlacementAgent.js";
import { InteractionAgent } from "./interactionAgent.js";
import { WarmColdAgent } from "./warmColdAgent.js";
import { TimerAgent } from "./timerAgent.js";
import { GameStateAgent } from "./gameStateAgent.js";
import { UIAgent } from "./uiAgent.js";
import { PerformanceAgent } from "./performanceAgent.js";
import { AudioAgent } from "./audioAgent.js";

export class MainScene {
  constructor(app, callbacks = {}, config = {}) {
    this.app = app;
    this.callbacks = callbacks;
    this.config = {
      timerMs: config.timerMs ?? 5000,
      carrotPadding: config.carrotPadding ?? 40,
      rabbitSpeed: config.rabbitSpeed ?? 70,
      inventorySpacing: config.inventorySpacing ?? 38,
      isLastLevel: config.isLastLevel ?? false,
    };

    this.container = new PIXI.Container();
    this.screenSize = { width: app.screen.width, height: app.screen.height };

    this.gameState = new GameStateAgent();
    this.timer = new TimerAgent(this.config.timerMs);
    this.ui = new UIAgent(app);
    this.warmCold = new WarmColdAgent();
    this.performance = new PerformanceAgent(app);
    this.audio = new AudioAgent();
    this.audio.setBackground("./assets/audio/bg.music.mp3");
    this.audio.setSfx("win", "./assets/audio/win.mp3");
    this.audio.setSfx("fail", "./assets/audio/gameover.mp3");
    this.audio.setSfx("pickup", "./assets/audio/pickup.mp3");
    this.timerLowPlayed = false;
    this.isFalling = false;
    this.fallVelocity = 0;
    this.isJumping = false;
    this.jumpElapsed = 0;
    this.jumpDuration = 500;
    this.rabbitSpeed = this.config.rabbitSpeed;
    this.rabbitDirection = new PIXI.Point(1, 0);
    this.carrotsCollected = 0;
    this.targetCarrots = 3;
    this.carrots = [];
    this.inventoryCarrots = [];

    this.background = this.createBackground();
    this.flowerLayer = new PIXI.Container();
    this.hiddenObject = this.createHiddenObject();
    this.interaction = new InteractionAgent(this.container, this.app);

    this.container.addChild(this.background, this.flowerLayer, this.hiddenObject, this.ui.container);
    this.background.filters = [this.warmCold.filter];
    this.scatterFlowerField();
    this.ui.setAudioMuted(this.audio.muted);

    this.registerInteractions();
    this.timer.onTimeout = () => this.onFail();
    this.gameState.setState("running");
    this.timer.start();
    this.spawnInitialCarrots();
    this.rabbitCaught = false;
    this.ui.setMessage("Collect 3 carrots, then catch the rabbit");
    // Seed initial warmth state (cold start).
    this.warmCold.update(
      { x: this.app.screen.width / 2, y: this.app.screen.height / 2 },
      this.hiddenObject.position
    );
    this.app.ticker.add(this.update, this);
  }

  createBackground() {
    const bg = new PIXI.Sprite(getTexture("background_main"));
    bg.width = this.app.screen.width;
    bg.height = this.app.screen.height;
    bg.tint = 0xffffff;
    bg.eventMode = "static";
    bg.cursor = "pointer";
    return bg;
  }

  createHiddenObject() {
    const hidden = new PIXI.Sprite(getTexture("hidden_object"));
    hidden.anchor.set(0.5);
    hidden.scale.set(0.4);
    this.placeHiddenObject(hidden);
    this.randomizeRabbitDirection();
    return hidden;
  }

  placeHiddenObject(sprite) {
    const placement = new ObjectPlacementAgent(
      { width: this.app.screen.width, height: this.app.screen.height },
      { width: sprite.width, height: sprite.height },
      40
    );
    const position = placement.randomPosition();
    sprite.position.copyFrom(position);
    this.baseRabbitY = position.y;
    sprite.rotation = 0;
    sprite.alpha = 1;
    this.isFalling = false;
    this.isJumping = false;
  }

  randomizeRabbitDirection() {
    const angle = Math.random() * Math.PI * 2;
    this.rabbitDirection.set(Math.cos(angle), Math.sin(angle));
  }

  registerInteractions() {
    this.interaction.onPointerMove = (position) => {
      this.audio.unlock();
      this.handlePointerMove(position);
    };
    this.interaction.onPointerTap = (position) => {
      this.audio.unlock();
      this.handleTap(position);
    };
    if (this.callbacks.onRestart) {
      this.ui.restartButton.on("pointertap", () => this.callbacks.onRestart());
    }
    if (this.ui.audioToggle) {
      this.ui.audioToggle.on("pointertap", () => {
        const muted = this.audio.toggleMute();
        this.ui.setAudioMuted(muted);
      });
    }
  }

  handlePointerMove(position) {
    if (this.gameState.state !== "running") return;
    this.warmCold.update(position, this.hiddenObject.position);
  }

  handleTap(position) {
    if (this.gameState.state !== "running") return;
    const tappedCarrot = this.carrots.find((c) => c && this.pointInBounds(position, c.getBounds()));
    if (tappedCarrot) {
      this.collectCarrot(tappedCarrot);
      return;
    }
    const bounds = this.hiddenObject.getBounds();
    if (this.pointInBounds(position, bounds)) {
      this.rabbitCaught = true;
      if (this.carrotsCollected >= this.targetCarrots) {
        this.onSuccess();
      } else {
        this.onHungerFail();
      }
    } else {
      // Wrong click: reposition carrots and speed up rabbit, leave flowers.
      this.relocateCarrots();
      this.boostRabbitSpeed();
    }
  }

  pointInBounds(point, bounds) {
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  }

  onSuccess() {
    if (!this.gameState.setState("success")) return;
    this.timer.stop();
    this.audio.stopBackground();
    this.ui.setMessage("Congratulations, ur pet is with u, full and happy", { centered: true });
    this.hiddenObject.texture = getTexture("hidden_object_win");
    this.hiddenObject.rotation = 0;
    this.hiddenObject.tint = 0xffffff;
    this.warmCold.setWinMode(true);
    this.audio.play("win");
    this.startJump();
    if (this.callbacks.onLevelComplete) {
      setTimeout(() => {
        if (!this.config.isLastLevel) {
          this.callbacks.onLevelComplete();
        } else {
          this.ui.setMessage("Win", { centered: true });
        }
      }, 900);
    }
  }

  onFail() {
    if (!this.gameState.setState("fail")) return;
    let message = "I see, u don't like animals";
    if (this.carrotsCollected >= this.targetCarrots && !this.rabbitCaught) {
      message = "Oh no, rabbit died from cold";
    }
    this.ui.setMessage(message, { centered: true });
    this.audio.stopBackground();
    this.hiddenObject.texture = getTexture("hidden_object_dead");
    this.hiddenObject.tint = 0xff0000;
    this.hiddenObject.rotation = 0;
    this.startFalling();
    this.audio.play("fail");
    this.warmCold.setLossMode(true);
    this.isJumping = false;
    if (this.callbacks.onFailReset) {
      setTimeout(() => this.callbacks.onFailReset(), 900);
    }
  }

  onHungerFail() {
    if (this.gameState.state !== "running") return;
    this.gameState.setState("fail");
    this.ui.setMessage("Rabbit died. He doesnt eat sunlight(.", { centered: true });
    this.audio.stopBackground();
    this.hiddenObject.texture = getTexture("hidden_object_dead");
    this.hiddenObject.tint = 0xff0000;
    this.startFalling();
    this.audio.play("fail");
    this.warmCold.setLossMode(true);
    this.isJumping = false;
    if (this.callbacks.onFailReset) {
      setTimeout(() => this.callbacks.onFailReset(), 900);
    }
  }

  update(tickerTime) {
    this.syncToResize();
    this.performance.update();
    this.warmCold.useLightweightMode = this.performance.lowPerformance;
    const deltaMs =
      typeof tickerTime === "number"
        ? (1000 / 60) * tickerTime
        : tickerTime?.deltaMS ?? 0;
    this.timer.update(deltaMs);
    const duration = this.timer.durationMs || 1;
    const remaining = Math.max(0, this.timer.remainingMs);
    const progress = remaining / duration;
    this.ui.updateTimer(progress, remaining, duration);
    this.maybeWarnTimer(progress);
    // Continuously update warmth with the last known pointer position.
    this.warmCold.update(this.interaction.pointerPosition, this.hiddenObject.position);
    this.updateRabbit(deltaMs);
    this.updateCarrotVisibility();
    this.updateFall(deltaMs);
    this.updateJump(deltaMs);
    this.ui.layout();
  }

  syncToResize() {
    const { width, height } = this.app.screen;
    if (width === this.screenSize.width && height === this.screenSize.height) {
      return;
    }

    this.screenSize = { width, height };
    this.background.width = width;
    this.background.height = height;
    this.interaction.resize(this.app.screen);
    this.ui.layout();
    this.layoutInventory();
  }

  maybeWarnTimer(progress) {
    if (progress <= 0.2 && !this.timerLowPlayed && this.gameState.state === "running") {
      this.timerLowPlayed = true;
      this.audio.play("timer-low");
    }
    if (progress > 0.2) {
      this.timerLowPlayed = false;
    }
  }

  destroy() {
    this.app.ticker.remove(this.update, this);
    this.interaction.destroy();
    this.ui.destroy();
    this.audio.destroy();
    this.clearCarrots();
    this.container.removeAllListeners();
    this.container.removeFromParent();
    this.container.destroy({ children: true, texture: false, baseTexture: false });
  }

  startFalling() {
    this.isFalling = true;
    this.fallVelocity = 0;
  }

  updateFall(deltaMs) {
    if (!this.isFalling) return;
    const dt = deltaMs / 16.67;
    this.fallVelocity += 0.4 * dt;
    this.hiddenObject.y += this.fallVelocity;
    this.hiddenObject.rotation += 0.03 * dt;
    this.hiddenObject.alpha = Math.max(0, this.hiddenObject.alpha - 0.01 * dt);
  }

  startJump() {
    this.isJumping = true;
    this.jumpElapsed = 0;
    this.baseRabbitY = this.hiddenObject.y;
  }

  updateJump(deltaMs) {
    if (!this.isJumping) return;
    this.jumpElapsed += deltaMs;
    const period = 700;
    const t = (this.jumpElapsed % period) / period;
    const height = 30;
    // Looping hop using sine.
    const offset = Math.sin(t * Math.PI) * height;
    this.hiddenObject.y = this.baseRabbitY - offset;
  }

  updateRabbit(deltaMs) {
    if (this.isFalling) return;
    const dt = deltaMs / 1000;
    this.hiddenObject.x += this.rabbitDirection.x * this.rabbitSpeed * dt;
    this.hiddenObject.y += this.rabbitDirection.y * this.rabbitSpeed * dt;
    // Bounce on edges.
    const padding = 24;
    if (this.hiddenObject.x < padding || this.hiddenObject.x > this.app.screen.width - padding) {
      this.rabbitDirection.x *= -1;
      this.hiddenObject.x = Math.min(
        Math.max(this.hiddenObject.x, padding),
        this.app.screen.width - padding
      );
    }
    if (this.hiddenObject.y < padding || this.hiddenObject.y > this.app.screen.height - padding) {
      this.rabbitDirection.y *= -1;
      this.hiddenObject.y = Math.min(
        Math.max(this.hiddenObject.y, padding),
        this.app.screen.height - padding
      );
      this.baseRabbitY = this.hiddenObject.y;
    }
  }

  boostRabbitSpeed() {
    this.rabbitSpeed = Math.min(this.rabbitSpeed * 1.1, 240);
    this.randomizeRabbitDirection();
  }

  spawnInitialCarrots() {
    this.clearCarrots();
    for (let i = 0; i < this.targetCarrots; i++) {
      const carrot = new PIXI.Sprite(getTexture("carrot"));
      carrot.anchor.set(0.5);
      carrot.scale.set(0.6);
      this.carrots.push(carrot);
      this.container.addChild(carrot);
      this.placeCarrot(carrot);
    }
    this.layoutInventory();
  }

  placeCarrot(sprite) {
    const placement = new ObjectPlacementAgent(
      { width: this.app.screen.width, height: this.app.screen.height },
      { width: sprite.width, height: sprite.height },
      this.config.carrotPadding
    );
    const position = placement.randomPosition();
    sprite.position.copyFrom(position);
  }

  collectCarrot(carrot) {
    this.carrotsCollected += 1;
    this.addFlowerPatch(carrot.position);
    this.moveCarrotToInventory(carrot);
    this.ui.setMessage(
      this.carrotsCollected >= this.targetCarrots
        ? "Now catch the rabbit!"
        : `Carrots: ${this.carrotsCollected}/${this.targetCarrots}`
    );
    this.audio.play("pickup");
  }

  moveCarrotToInventory(carrot) {
    const idx = this.carrots.indexOf(carrot);
    if (idx !== -1) {
      this.carrots.splice(idx, 1);
    }
    this.container.removeChild(carrot);
    this.inventoryCarrots.push(carrot);
    this.container.addChild(carrot);
    this.layoutInventory();
  }

  layoutInventory() {
    const baseX = this.app.screen.width - 30;
    const baseY = 60;
    this.inventoryCarrots.forEach((carrot, idx) => {
      carrot.position.set(baseX, baseY + idx * this.config.inventorySpacing);
      carrot.scale.set(0.5);
    });
  }

  relocateCarrots() {
    this.carrots.forEach((carrot) => {
      if (carrot) {
        this.addFlowerPatch(carrot.position);
        this.placeCarrot(carrot);
      }
    });
  }

  updateCarrotVisibility() {
    this.carrots.forEach((carrot) => {
      if (carrot) {
        carrot.visible = this.gameState.state === "running";
      }
    });
    this.inventoryCarrots.forEach((carrot) => {
      carrot.visible = true;
    });
  }

  addFlowerPatch(position) {
    const g = this.createFlowerGraphic();
    g.position.copyFrom(position);
    this.flowerLayer.addChild(g);
  }

  clearCarrots() {
    [...this.carrots, ...this.inventoryCarrots].forEach((c) => {
      if (c && c.destroy) c.destroy();
    });
    this.carrots = [];
    this.inventoryCarrots = [];
  }

  scatterFlowerField() {
    const count = 25;
    for (let i = 0; i < count; i++) {
      const g = this.createFlowerGraphic();
      g.position.set(
        Math.random() * this.app.screen.width,
        Math.random() * this.app.screen.height
      );
      this.flowerLayer.addChild(g);
    }
  }

  createFlowerGraphic() {
    const g = new PIXI.Graphics();
    const petal = 6;
    g.circle(-petal, 0, 3).fill(0xf8fafc);
    g.circle(petal, 0, 3).fill(0xf8fafc);
    g.circle(0, -petal, 3).fill(0xf8fafc);
    g.circle(0, petal, 3).fill(0xf8fafc);
    g.circle(0, 0, 3).fill(0xffd166);
    g.alpha = 0.9;
    return g;
  }

  destroy() {
    this.app.ticker.remove(this.update, this);
    this.interaction.destroy();
    this.ui.destroy();
    this.audio.destroy();
    this.clearCarrots();
    this.container.removeAllListeners();
    this.container.removeFromParent();
    this.container.destroy({ children: true, texture: false, baseTexture: false });
  }
}
