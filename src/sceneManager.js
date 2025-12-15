import { MainScene } from "./mainScene.js";

export class SceneManagerAgent {
  constructor(app) {
    this.app = app;
    this.currentScene = null;
  }

  start() {
    this.replaceScene(this.createScene());
  }

  restartGame() {
    this.replaceScene(this.createScene());
  }

  createScene() {
    return new MainScene(this.app, () => this.restartGame());
  }

  replaceScene(scene) {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene.container);
      this.app.ticker.remove(this.currentScene.update, this.currentScene);
    }
    this.currentScene = scene;
    this.app.stage.addChild(scene.container);
  }
}
