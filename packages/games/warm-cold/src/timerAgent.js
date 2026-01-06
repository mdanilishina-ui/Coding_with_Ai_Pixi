export class TimerAgent {
  constructor(durationMs = 5000) {
    this.durationMs = durationMs;
    this.remainingMs = durationMs;
    this.running = false;
    this.onTimeout = () => {};
  }

  start() {
    this.remainingMs = this.durationMs;
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  update(deltaMs) {
    if (!this.running) return;
    this.remainingMs -= deltaMs;
    if (this.remainingMs <= 0) {
      this.remainingMs = 0;
      this.running = false;
      this.onTimeout();
    }
  }
}
