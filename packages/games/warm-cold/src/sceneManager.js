import { MainScene } from "./mainScene.js";

const getLevelTuning = (levelNumber, totalLevels) => {
  const isLastLevel = levelNumber === totalLevels;
  let timerScale = 1;
  let carrotScale = 1;
  let rabbitScale = 1;

  if (levelNumber <= 3) {
    carrotScale = 3;
    rabbitScale = 2;
  } else if (levelNumber <= 6) {
    timerScale = 2;
    carrotScale = 2;
    rabbitScale = 2;
  } else if (levelNumber === 7) {
    timerScale = 2;
    carrotScale = 1;
    rabbitScale = 2;
  } else {
    timerScale = 1;
    carrotScale = 1;
    rabbitScale = 2;
  }

  if (isLastLevel) {
    rabbitScale = 1;
    timerScale = 1;
    carrotScale = 1;
  }

  return { timerScale, carrotScale, rabbitScale, isLastLevel };
};

const getDifficultyModifiers = (levelNumber) => {
  if (levelNumber >= 3) {
    return {
      timeMultiplier: 1.4,
      rabbitSpeedMultiplier: 0.85,
      targetCarrots: 2,
      carrotPickupPadding: 10,
      mistakeSpeedPenalty: 1.05,
    };
  }
  return {
    timeMultiplier: 1,
    rabbitSpeedMultiplier: 1,
    targetCarrots: 3,
    carrotPickupPadding: 0,
    mistakeSpeedPenalty: 1.1,
  };
};

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
    const levelNumber = this.currentLevel + 1;
    const totalLevels = this.levels.length;
    const tuning = getLevelTuning(levelNumber, totalLevels);
    const difficulty = getDifficultyModifiers(levelNumber);
    const baseConfig = this.levels[this.currentLevel];
    const config = {
      ...baseConfig,
      timerMs: Math.round(baseConfig.timerMs * tuning.timerScale * difficulty.timeMultiplier),
      carrotScale: tuning.carrotScale,
      rabbitScale: tuning.rabbitScale,
      isLastLevel: tuning.isLastLevel,
      rabbitSpeed: baseConfig.rabbitSpeed * difficulty.rabbitSpeedMultiplier,
      targetCarrots: difficulty.targetCarrots,
      carrotPickupPadding: difficulty.carrotPickupPadding,
      mistakeSpeedPenalty: difficulty.mistakeSpeedPenalty,
    };
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
