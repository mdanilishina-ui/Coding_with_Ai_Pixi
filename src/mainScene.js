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
  constructor(app, onRestart) {
    this.app = app;
    this.onRestart = onRestart;
    this.container = new PIXI.Container();
    this.screenSize = { width: app.screen.width, height: app.screen.height };

    this.gameState = new GameStateAgent();
    this.timer = new TimerAgent();
    this.ui = new UIAgent(app);
    this.warmCold = new WarmColdAgent();
    this.performance = new PerformanceAgent(app);
    this.audio = new AudioAgent();
    this.timerLowPlayed = false;
    this.isFalling = false;
    this.fallVelocity = 0;
    this.isJumping = false;
    this.jumpElapsed = 0;
    this.jumpDuration = 500;

    this.background = this.createBackground();
    this.hiddenObject = this.createHiddenObject();
    this.interaction = new InteractionAgent(this.container, this.app);

    this.container.addChild(this.background, this.hiddenObject, this.ui.container);
    this.background.filters = [this.warmCold.filter];

    this.registerInteractions();
    this.timer.onTimeout = () => this.onFail();
    this.gameState.setState("running");
    this.timer.start();
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
    bg.tint = 0x0f3a24;
    bg.eventMode = "static";
    bg.cursor = "pointer";
    return bg;
  }

  createHiddenObject() {
    const hidden = new PIXI.Sprite(getTexture("hidden_object"));
    hidden.anchor.set(0.5);
    hidden.scale.set(0.4);
    this.placeHiddenObject(hidden);
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

  registerInteractions() {
    this.interaction.onPointerMove = (position) => {
      this.audio.unlock();
      this.handlePointerMove(position);
    };
    this.interaction.onPointerTap = (position) => {
      this.audio.unlock();
      this.handleTap(position);
    };
    if (this.onRestart) {
      this.ui.restartButton.on("pointertap", () => this.onRestart());
    }
  }

  handlePointerMove(position) {
    if (this.gameState.state !== "running") return;
    this.warmCold.update(position, this.hiddenObject.position);
  }

  handleTap(position) {
    if (this.gameState.state !== "running") return;
    const bounds = this.hiddenObject.getBounds();
    if (this.pointInBounds(position, bounds)) {
      this.onSuccess();
    } else {
      // Wrong click: rabbit jumps to a new random spot.
      this.placeHiddenObject(this.hiddenObject);
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
    this.ui.setMessage("U won - ur favourite pet is with u");
    this.hiddenObject.texture = getTexture("hidden_object_win");
    this.hiddenObject.rotation = 0;
    this.warmCold.setWinMode(true);
    this.audio.play("success");
    this.startJump();
  }

  onFail() {
    if (!this.gameState.setState("fail")) return;
    this.ui.setMessage("You lost — time's up!");
    this.hiddenObject.texture = getTexture("hidden_object_dead");
    this.hiddenObject.tint = 0xffffff;
    this.hiddenObject.rotation = 0;
    this.startFalling();
    this.audio.play("fail");
    this.warmCold.setLossMode(true);
    this.isJumping = false;
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
  }

  updateJump(deltaMs) {
    if (!this.isJumping) return;
    this.jumpElapsed += deltaMs;
    const t = Math.min(1, this.jumpElapsed / this.jumpDuration);
    const height = 40;
    // Simple parabola for hop.
    const offset = height * 4 * t * (1 - t);
    this.hiddenObject.y = this.baseRabbitY - offset;
    if (t >= 1) {
      this.isJumping = false;
      this.hiddenObject.y = this.baseRabbitY;
    }
  }
}
