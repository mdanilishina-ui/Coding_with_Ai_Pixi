import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.mjs";

export class WarmColdAgent {
  constructor() {
    this.filter = new PIXI.ColorMatrixFilter();
  }

  update(pointer, target) {
    const distance = Math.hypot(pointer.x - target.x, pointer.y - target.y);
    const maxDistance = 600;
    const warmFactor = Math.max(0, Math.min(1, 1 - distance / maxDistance));
    this.applyWarmth(warmFactor);
    return warmFactor;
  }

  applyWarmth(warmFactor) {
    const tintShift = warmFactor * 0.6;
    this.filter.matrix = [
      1 + tintShift,
      tintShift * 0.15,
      -tintShift * 0.1,
      0,
      0,
      -tintShift * 0.05,
      1,
      tintShift * 0.05,
      0,
      0,
      -tintShift * 0.05,
      -tintShift * 0.05,
      1,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
    ];
  }
}
