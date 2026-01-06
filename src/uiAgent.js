import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.mjs";
import { getTexture } from "./assetLoader.js";

export class UIAgent {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();
    this.messageCentered = false;
    this.label = this.createLabel();
    this.timerBar = this.createTimerBar();
    this.timerText = this.createTimerText();
    this.timerGroup = this.createTimerGroup();
    this.restartButton = this.createRestartButton();

    this.container.addChild(this.label, this.timerGroup, this.restartButton);
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
    bar.anchor.set(1, 0.5);
    bar.position.set(0, 24);
    bar.scale.set(1, 0.5);
    bar.tint = 0x7df0c4;
    bar.alpha = 0.9;
    this.timerBaseWidth = bar.width;
    return bar;
  }

  createTimerText() {
    const text = new PIXI.Text({
      text: "3.0s",
      style: new PIXI.TextStyle({
        fill: 0xf8fafc,
        fontSize: 18,
        fontWeight: "700",
        fontFamily: "Montserrat, 'Helvetica Neue', Arial, sans-serif",
        dropShadow: true,
        dropShadowDistance: 2,
        dropShadowBlur: 2,
        dropShadowAlpha: 0.35,
      }),
    });
    text.anchor.set(1, 0.5);
    text.position.set(0, -2);
    return text;
  }

  createTimerGroup() {
    const group = new PIXI.Container();
    group.addChild(this.timerBar, this.timerText);
    return group;
  }

  createRestartButton() {
    const container = new PIXI.Container();
    const bg = new PIXI.Graphics();
    const width = 100;
    const height = 42;
    bg.roundRect(0, 0, width, height, 10);
    bg.fill({ color: 0x8be9fd, alpha: 0.9 });
    bg.stroke({ color: 0x5bc0de, width: 2, alpha: 0.8 });

    const label = new PIXI.Text({
      text: "Restart",
      style: new PIXI.TextStyle({
        fill: 0x0b1224,
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "Montserrat, 'Helvetica Neue', Arial, sans-serif",
      }),
    });
    label.anchor.set(0.5);
    label.position.set(width / 2, height / 2);

    container.addChild(bg, label);
    container.eventMode = "static";
    container.cursor = "pointer";
    container.alpha = 0.92;
    this.restartButton = container;
    this.restartButtonBg = bg;
    this.restartButtonLabel = label;
    return container;
  }

  updateTimer(progress, remainingMs, durationMs) {
    const clamped = Math.max(0, Math.min(1, progress));
    this.timerBar.scale.x = clamped;
    if (clamped < 0.25) {
      this.timerBar.tint = 0xff8fa3;
    } else if (clamped < 0.5) {
      this.timerBar.tint = 0xffd166;
    } else {
      this.timerBar.tint = 0x7df0c4;
    }
    const seconds = Math.max(0, remainingMs) / 1000;
    this.timerText.text = `${seconds.toFixed(1)}s`;
    // Prevent tiny floating artifacts when timer restarts.
    if (seconds === durationMs / 1000) {
      this.timerBar.scale.x = 1;
    }
  }

  setMessage(text, { centered = false } = {}) {
    this.messageCentered = centered;
    if (centered) {
      this.label.anchor.set(0.5);
    } else {
      this.label.anchor.set(0, 0.5);
    }
    this.label.text = text;
    this.layout();
  }

  layout() {
    // Timer in the top-right corner.
    const padding = 28;
    this.timerGroup.position.set(this.app.screen.width - padding, padding);

    // Restart in the bottom-right corner.
    this.restartButton.position.set(
      this.app.screen.width - padding - this.restartButtonBg.width,
      this.app.screen.height - padding - this.restartButtonBg.height
    );

    if (this.messageCentered) {
      this.label.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    } else {
      this.label.position.set(24, 32);
    }
  }

  destroy() {
    this.restartButton.removeAllListeners();
    this.container.removeFromParent();
    this.container.destroy({ children: true, texture: false, baseTexture: false });
  }
}
