export class AudioAgent {
  constructor() {
    this.ctx = null;
    this.unlocked = false;
    this.bg = null;
    this.bgStarted = false;
    this.sfx = {};
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

    // Start background loop if configured.
    this.playBackground();
  }

  play(type = "success") {
    if (!this.unlocked) return;
    const clip = this.sfx[type];
    if (clip) {
      clip.currentTime = 0;
      const playPromise = clip.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
      return;
    }

    // Fallback beep if no clip provided.
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

  setBackground(src) {
    if (this.bg) return;
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";
    this.bg = audio;
  }

  playBackground() {
    if (!this.bg || this.bgStarted) return;
    this.bgStarted = true;
    const play = this.bg.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        this.bgStarted = false;
      });
    }
  }

  setSfx(type, src) {
    if (this.sfx[type]) return;
    const audio = new Audio(src);
    audio.preload = "auto";
    this.sfx[type] = audio;
  }
}
