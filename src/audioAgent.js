export class AudioAgent {
  constructor() {
    this.ctx = null;
    this.unlocked = false;
  }

  unlock() {
    if (this.unlocked) return;
    this.ctx = this.ctx || new AudioContext();
    // A tiny silent buffer to satisfy iOS autoplay rules.
    const buffer = this.ctx.createBuffer(1, 1, 22050);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    source.start(0);
    this.unlocked = true;
  }

  play(type = "success") {
    if (!this.unlocked) return;
    const ctx = this.ctx || new AudioContext();
    this.ctx = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";

    const now = ctx.currentTime;
    if (type === "success") {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    } else if (type === "fail") {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
    } else if (type === "timer-low") {
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}
