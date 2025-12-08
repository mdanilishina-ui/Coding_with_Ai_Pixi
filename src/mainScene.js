import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.mjs";
import { getTexture } from "./assetLoader.js";
import { ObjectPlacementAgent } from "./objectPlacementAgent.js";
import { InteractionAgent } from "./interactionAgent.js";
import { WarmColdAgent } from "./warmColdAgent.js";
import { TimerAgent } from "./timerAgent.js";
import { GameStateAgent } from "./gameStateAgent.js";
import { UIAgent } from "./uiAgent.js";

export class MainScene {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();

    this.gameState = new GameStateAgent();
    this.timer = new TimerAgent();
    this.ui = new UIAgent(app);
    this.warmCold = new WarmColdAgent();

    this.background = this.createBackground();
    this.hiddenObject = this.createHiddenObject();
    this.interaction = new InteractionAgent(this.container);

    this.container.addChild(this.background, this.hiddenObject, this.ui.container);
    this.background.filters = [this.warmCold.filter];

    this.registerInteractions();
    this.timer.onTimeout = () => this.onFail();
    this.gameState.setState("running");
    this.timer.start();
    this.app.ticker.add(this.update, this);
  }

  createBackground() {
    const bg = new PIXI.Sprite(getTexture("background_main"));
    bg.width = this.app.screen.width;
    bg.height = this.app.screen.height;
    bg.tint = 0x0d152d;
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
  }

  registerInteractions() {
    this.interaction.onPointerMove = (position) => this.handlePointerMove(position);
    this.interaction.onPointerTap = (position) => this.handleTap(position);
    this.ui.restartButton.on("pointertap", () => this.restart());
  }

  handlePointerMove(position) {
    if (this.gameState.state !== "running") return;
    this.warmCold.update(position, this.hiddenObject.position);
  }

  handleTap(position) {
    if (this.gameState.state !== "running") return;
    const bounds = this.hiddenObject.getBounds();
    if (bounds.contains(position.x, position.y)) {
      this.onSuccess();
    }
  }

  onSuccess() {
    if (!this.gameState.setState("success")) return;
    this.timer.stop();
    this.ui.setMessage("Success! You found it.");
    this.hiddenObject.tint = 0x7df0c4;
  }

  onFail() {
    if (!this.gameState.setState("fail")) return;
    this.ui.setMessage("Time's up!");
    this.hiddenObject.tint = 0xff8fa3;
  }

  restart() {
    this.gameState.setState("running");
    this.ui.setMessage("Find the object!");
    this.hiddenObject.tint = 0xffffff;
    this.placeHiddenObject(this.hiddenObject);
    this.timer.start();
  }

  update(delta) {
    const deltaMs = (1000 / 60) * delta;
    this.timer.update(deltaMs);
    const progress = this.timer.remainingMs / this.timer.durationMs;
    this.ui.updateTimer(progress);
    this.ui.layout();
  }
}
