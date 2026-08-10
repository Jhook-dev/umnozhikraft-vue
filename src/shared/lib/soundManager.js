/* ================================================================
   🔊 ЗВУКОВЫЕ ЭФФЕКТЫ. Сейчас — бипы WebAudio. 
   ЧТОБЫ ВСТАВИТЬ ЗВУКИ MINECRAFT:
   пропишите пути к .ogg в Sound.FILES ниже.
   ================================================================ */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.FILES = {
      dig: null,     // 'sounds/dig_stone.ogg'
      breakB: null,  // 'sounds/break_stone.ogg'
      correct: null, // 'sounds/orb.ogg'
      wrong: null,   // 'sounds/pop.ogg'
      diamond: null, // 'sounds/levelup.ogg'
      levelup: null, // 'sounds/levelup.ogg'
      mob: null,     // 'sounds/zombie_say.ogg'
      hit: null,     // 'sounds/damage.ogg'
      buy: null,     // 'sounds/chest.ogg'
    };
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // 🔊 Разблокируем AudioContext после жеста пользователя (требование браузеров)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(value) {
    this.muted = value;
  }

  play(name) {
    if (this.muted) return;
    this.init();
    const file = this.FILES[name];
    if (file) {
      new Audio(file).play().catch(() => {});
      return;
    }
    this._beep(name);
  }

  _tone(freq, dur, type, delay, vol) {
    const c = this.ctx;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(c.destination);
    const t = c.currentTime + (delay || 0);
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t);
    o.stop(t + dur);
  }

  _beep(name) {
    const B = {
      dig: () => {
        this._tone(160, 0.06, 'square');
        this._tone(120, 0.06, 'square', 0.06);
      },
      breakB: () => {
        [300, 220, 140].forEach((f, i) => this._tone(f, 0.08, 'sawtooth', i * 0.05));
      },
      correct: () => {
        this._tone(523, 0.09, 'triangle');
        this._tone(659, 0.12, 'triangle', 0.09);
      },
      wrong: () => {
        this._tone(210, 0.12, 'sine');
        this._tone(160, 0.16, 'sine', 0.11, 0.09);
      },
      diamond: () => {
        this._tone(1175, 0.07, 'sine', 0, 0.1);
        this._tone(1568, 0.16, 'sine', 0.07, 0.1);
      },
      levelup: () => {
        [392, 523, 659, 784].forEach((f, i) => this._tone(f, 0.13, 'triangle', i * 0.11));
      },
      mob: () => {
        this._tone(95, 0.25, 'sawtooth', 0, 0.14);
        this._tone(80, 0.25, 'sawtooth', 0.2, 0.14);
      },
      hit: () => {
        this._tone(180, 0.08, 'square');
        this._tone(140, 0.08, 'square', 0.08);
      },
      buy: () => {
        this._tone(440, 0.06, 'sine');
        this._tone(554, 0.06, 'sine', 0.06);
        this._tone(659, 0.1, 'sine', 0.12);
      },
    };
    if (B[name]) B[name]();
  }
}

// Экспортируем единственный экземпляр
export const soundManager = new SoundManager();
