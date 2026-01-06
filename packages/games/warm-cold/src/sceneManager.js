import { MainScene } from "./mainScene.js";

export class SceneManagerAgent {
  constructor(app) {
    this.app = app;
    this.currentScene = null;
    this.currentLevel = 0;
    this.levels = [
      { timerMs: 5000, carrotPadding: 40, rabbitSpeed: 70, inventorySpacing: 44 },
      { timerMs: 3000, carrotPadding: 40, rabbitSpeed: 70, inventorySpacing: 44 },
      { timerMs: 3000, carrotPadding: 80, rabbitSpeed: 70, inventorySpacing: 50 },
      { timerMs: 3000, carrotPadding: 80, rabbitSpeed: 140, inventorySpacing: 50 },
    ];
  }

  start() {
    this.gotoLevel(0);
  }

  restartGame() {
    this.gotoLevel(0);
  }

  gotoLevel(index) {
    const clamped = Math.max(0, Math.min(this.levels.length - 1, index));
    this.currentLevel = clamped;
    this.replaceScene(this.createScene());
  }

  nextLevel() {
    if (this.currentLevel < this.levels.length - 1) {
      this.currentLevel += 1;
      this.gotoLevel(this.currentLevel);
    } else {
      // Already at final level; keep the win screen.
    }
  }

  createScene() {
    const config = { ...this.levels[this.currentLevel], isLastLevel: this.currentLevel === this.levels.length - 1 };
    return new MainScene(this.app, {
      onRestart: () => this.gotoLevel(this.currentLevel),
      onLevelComplete: () => this.nextLevel(),
      onFailReset: () => this.gotoLevel(0),
    }, config);
  }

  replaceScene(scene) {
    if (this.currentScene) {
      this.currentScene.destroy();
      this.currentScene = null;
    }
    this.currentScene = scene;
    this.app.stage.addChild(scene.container);
  }
}
