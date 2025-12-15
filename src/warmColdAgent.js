import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.1.5/dist/pixi.mjs";

export class WarmColdAgent {
  constructor() {
    this.filter = new PIXI.ColorMatrixFilter();
    this.useLightweightMode = false;
    this.inLossMode = false;
    this.inWinMode = false;
  }

  update(pointer, target) {
    const distance = Math.hypot(pointer.x - target.x, pointer.y - target.y);
    const maxDistance = 600;
    const warmFactor = Math.max(0, Math.min(1, 1 - distance / maxDistance));
    this.applyWarmth(warmFactor);
    return warmFactor;
  }

  applyWarmth(warmFactor) {
    if (this.inWinMode) {
      // Bright yellow wash for a win.
      this.filter.matrix = [
        1.6, 0.1, 0, 0, 0.05,
        0.05, 1.4, 0, 0, 0.02,
        0, 0, 0.8, 0, 0,
        0, 0, 0, 1, 0,
      ];
      return;
    }

    if (this.inLossMode) {
      // Force a full red wash when the player loses.
      this.filter.matrix = [
        1.8, 0.1, 0.1, 0, 0.1,
        0.05, 0.4, 0.05, 0, 0,
        0.05, 0.05, 0.2, 0, 0,
        0, 0, 0, 1, 0,
      ];
      return;
    }

    // Cold = blue bias, Warm = red/orange bias.
    const mix = (a, b, t) => a + (b - a) * t;
    const cold = { r: 1.0, g: 1.05, b: 1.2, bias: 0.05 };
    const warm = { r: 1.4, g: 0.95, b: 0.85, bias: 0.0 };

    const rScale = mix(cold.r, warm.r, warmFactor);
    const gScale = mix(cold.g, warm.g, warmFactor);
    const bScale = mix(cold.b, warm.b, warmFactor);
    const bias = mix(cold.bias, warm.bias, warmFactor);

    // Lightweight mode avoids heavier channel cross-talk for low FPS devices.
    if (this.useLightweightMode) {
      this.filter.matrix = [
        rScale, 0,      0,      0, bias,
        0,      gScale, 0,      0, bias,
        0,      0,      bScale, 0, bias,
        0,      0,      0,      1, 0,
      ];
      return;
    }

    this.filter.matrix = [
      rScale,                0.08 * warmFactor,   -0.08 * (1 - warmFactor), 0, bias,
      -0.05 * warmFactor,    gScale,              0.05 * (1 - warmFactor), 0, bias,
      -0.05 * warmFactor,   -0.05 * warmFactor,   bScale,                  0, bias,
      0,                     0,                   0,                       1, 0,
    ];
  }

  setLossMode(enabled) {
    this.inLossMode = enabled;
    if (enabled) {
      this.inWinMode = false;
    }
    if (enabled) {
      this.applyWarmth(1);
    }
  }

  setWinMode(enabled) {
    this.inWinMode = enabled;
    if (enabled) {
      this.inLossMode = false;
      this.applyWarmth(1);
    }
  }
}
