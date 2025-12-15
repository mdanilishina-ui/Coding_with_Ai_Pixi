import { MainScene } from "./mainScene.js";

export class SceneManagerAgent {
  constructor(app) {
    this.app = app;
    this.currentScene = null;
  }

  start() {
    this.replaceScene();
  }

  restartGame() {
    this.replaceScene();
  }

  replaceScene() {
    if (this.currentScene) {
      this.currentScene.destroy();
      this.currentScene = null;
    }
    const nextScene = new MainScene(this.app, () => this.restartGame());
    this.currentScene = nextScene;
    this.app.stage.addChild(nextScene.container);
  }
}
