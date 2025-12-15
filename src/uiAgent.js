import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.mjs";
import { getTexture } from "./assetLoader.js";

export class UIAgent {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();
    this.label = this.createLabel();
    this.timerBar = this.createTimerBar();
    this.restartButton = this.createRestartButton();

    this.container.addChild(this.label, this.timerBar, this.restartButton);
    this.layout();
  }

  createLabel() {
    const text = new PIXI.Text({
      text: "Find the object!",
      style: new PIXI.TextStyle({
        fill: 0xffffff,
        fontSize: 20,
        fontWeight: "700",
        dropShadow: true,
        dropShadowDistance: 2,
        dropShadowBlur: 2,
        dropShadowAlpha: 0.4,
      }),
    });
    text.anchor.set(0, 0.5);
    text.position.set(24, 32);
    return text;
  }

  createTimerBar() {
    const bar = new PIXI.Sprite(getTexture("ui_timer_bar"));
    bar.anchor.set(0, 0.5);
    bar.position.set(24, 70);
    bar.scale.set(1, 0.35);
    bar.tint = 0x7df0c4;
    bar.alpha = 0.9;
    this.timerBaseWidth = bar.width;
    return bar;
  }

  createRestartButton() {
    const button = new PIXI.Sprite(getTexture("ui_restart"));
    button.anchor.set(1, 1);
    button.position.set(this.app.screen.width - 24, this.app.screen.height - 24);
    button.scale.set(0.35);
    button.alpha = 0.8;
    button.eventMode = "static";
    button.cursor = "pointer";
    this.restartButton = button;
    return button;
  }

  updateTimer(progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    this.timerBar.scale.x = clamped;
    if (clamped < 0.25) {
      this.timerBar.tint = 0xff8fa3;
    } else if (clamped < 0.5) {
      this.timerBar.tint = 0xffd166;
    } else {
      this.timerBar.tint = 0x7df0c4;
    }
  }

  setMessage(text) {
    this.label.text = text;
  }

  layout() {
    this.restartButton.position.set(this.app.screen.width - 24, this.app.screen.height - 24);
  }

  destroy() {
    this.restartButton.removeAllListeners();
    this.container.removeFromParent();
    this.container.destroy({ children: true, texture: false, baseTexture: false });
  }
}
