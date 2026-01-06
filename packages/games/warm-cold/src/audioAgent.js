export class AudioAgent {
  constructor() {
    this.ctx = null;
    this.unlocked = false;
    this.bg = null;
    this.bgStarted = false;
    this.sfx = {};
    this.muted = false;
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
    if (!this.muted) {
      this.playBackground();
    }
  }

  play(type = "success") {
    if (!this.unlocked || this.muted) return;
    const clip = this.sfx[type];
    if (clip) {
      this.stopSfx(type);
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
    audio.volume = 0.18;
    audio.preload = "auto";
    this.bg = audio;
  }

  playBackground() {
    if (!this.bg || this.bgStarted || this.muted) return;
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
    if (type === "win") {
      audio.volume = 0.65;
    }
    this.sfx[type] = audio;
  }

  stopBackground() {
    if (this.bg) {
      this.bg.pause();
      this.bg.currentTime = 0;
      this.bgStarted = false;
    }
  }

  stopSfx(type) {
    if (type && this.sfx[type]) {
      this.sfx[type].pause();
      this.sfx[type].currentTime = 0;
      return;
    }
    Object.values(this.sfx).forEach((clip) => {
      clip.pause();
      clip.currentTime = 0;
    });
  }

  stopAll() {
    this.stopBackground();
    this.stopSfx();
  }

  setMuted(muted) {
    const next = Boolean(muted);
    if (this.muted === next) return this.muted;
    this.muted = next;
    if (this.muted) {
      this.stopAll();
    } else if (this.unlocked) {
      this.playBackground();
    }
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  destroy() {
    this.stopAll();
    this.bg = null;
    this.sfx = {};
    this.unlocked = false;
    this.bgStarted = false;
  }
}
