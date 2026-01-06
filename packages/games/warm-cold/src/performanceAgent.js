export class PerformanceAgent {
  constructor(app, { fpsThreshold = 45 } = {}) {
    this.app = app;
    this.fpsThreshold = fpsThreshold;
    this.lowPerformance = false;
  }

  update() {
    const fps = this.app.ticker.FPS || 60;
    const wasLow = this.lowPerformance;
    this.lowPerformance = fps < this.fpsThreshold;
    return this.lowPerformance !== wasLow;
  }
}
