import { defineStore } from 'pinia';
import { CONFIG } from '@/shared/config/game';
import { randInt, pickOne, shuffle } from '@/shared/lib/utils';
import { soundManager } from '@/shared/lib/soundManager';

function freshState(baseTables) {
  const sorted = baseTables.slice().sort((a, b) => a - b);
  return {
    tables: sorted.slice(),
    progression: sorted.join(',') === '2,3',
    xp: 0,
    xpIntoLevel: 0,
    level: 1,
    diamonds: 0,
    depth: 0,
    streak: 0,
    sinceMob: 0,
    nextMobAt: 999,
    pick: 'wood',
    skin: 'classic',
    ownedPicks: ['wood'],
    ownedSkins: ['classic'],
    retry: [],
    muted: false,
  };
}

export const useGameStore = defineStore('game', {
  state: () => ({
    status: 'start', // 'start' | 'playing'
    selectedTables: new Set([2, 3]),
    state: null,
    block: null,
    problem: null,
    busy: false,
    mobActive: false,
    currentMob: null,
    wrongThisProblem: 0,
    showShop: false,
    showLevelUp: false,
    shopTab: 'picks',
    musicMuted: false,
    musicVolume: 0.5,
    currentTrack: 0,
    toasts: [],
  }),

  getters: {
    hasSave: (state) => {
      try {
        const raw = localStorage.getItem(CONFIG.saveKey);
        return !!raw && JSON.parse(raw);
      } catch {
        return false;
      }
    },
    savedProgress: (state) => {
      try {
        const raw = localStorage.getItem(CONFIG.saveKey);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!('progression' in s)) s.progression = true;
        return s;
      } catch {
        return null;
      }
    },
  },

  actions: {
    toggleTable(t) {
      if (this.selectedTables.has(t)) {
        if (this.selectedTables.size === 1) return;
        this.selectedTables.delete(t);
      } else {
        this.selectedTables.add(t);
      }
    },

    setPreset(tables) {
      this.selectedTables = new Set(tables);
    },

    startNewGame() {
      this.state = freshState([...this.selectedTables]);
      this.state.nextMobAt = randInt(CONFIG.mobEveryMin, CONFIG.mobEveryMax);
      this.status = 'playing';
      this.save();
      this.spawnBlock();
      this.generateProblem();
    },

    continueGame() {
      this.state = this.savedProgress;
      this.status = 'playing';
      this.spawnBlock();
      this.generateProblem();
    },

    save() {
      if (this.state) {
        localStorage.setItem(CONFIG.saveKey, JSON.stringify(this.state));
      }
    },

    spawnBlock() {
      const avail = CONFIG.blocks.filter((b) => b.minDepth <= this.state.depth);
      const blockData = Math.random() < 0.65 ? avail[avail.length - 1] : pickOne(avail);
      this.block = { ...blockData, maxHp: blockData.hp, currentHp: blockData.hp, stage: 0 };
    },

    generateProblem() {
      let a, b, guard = 0;
      do {
        if (this.state.retry.length && Math.random() < 0.45) {
          [a, b] = pickOne(this.state.retry).split('x').map(Number);
        } else {
          a = pickOne(this.state.tables);
          b = randInt(2, 10);
        }
        guard++;
      } while (this.problem && a === this.problem.a && b === this.problem.b && guard < 5);

      const correct = a * b;
      const distractors = shuffle([correct + a, correct - a, correct + b, correct - b, (a + 1) * b, (a - 1) * b, a * (b + 1), a * (b - 1), correct + 10, correct - 10, correct + 2, correct - 2].filter(v => v > 0 && v !== correct));
      const options = shuffle([correct, ...distractors.slice(0, 3)]);

      this.problem = { a, b, correct, options };
      this.wrongThisProblem = 0;
    },

    answer(value) {
      if (this.busy) return;

      if (value === this.problem.correct) {
        this.busy = true;
        const key = `${this.problem.a}x${this.problem.b}`;
        this.state.retry = this.state.retry.filter((k) => k !== key);
        this.state.streak++;
        this.addXP(10 + Math.min(this.state.streak, 5) * 2);

        if (this.state.streak > 0 && this.state.streak % 5 === 0) {
          this.giveDiamonds(2);
        }

        setTimeout(() => {
          if (this.mobActive) {
            this.defeatMob();
          } else {
            this.hitBlock();
          }
        }, 380);
      } else {
        this.wrongThisProblem++;
        this.state.streak = 0;
        const key = `${this.problem.a}x${this.problem.b}`;
        if (!this.state.retry.includes(key)) this.state.retry.push(key);
      }
      this.save();
    },

    hitBlock() {
      const dmg = CONFIG.picks.find((p) => p.id === this.state.pick).dmg;
      this.block.currentHp -= dmg;
      this.block.stage = Math.min(3, Math.ceil((1 - Math.max(0, this.block.currentHp) / this.block.maxHp) * 3));

      // Звук удара по блоку
      soundManager.play('dig');

      if (this.block.currentHp <= 0) {
        setTimeout(() => this.breakBlock(), 300);
      } else {
        this.state.sinceMob++;
        this.busy = false;
        if (this.maybeMob()) {
          this.startMob();
        } else {
          this.generateProblem();
        }
      }
    },

    breakBlock() {
      this.state.depth++;

      // Проверка на открытие новой руды
      const newOre = CONFIG.blocks.find(b => b.minDepth === this.state.depth);
      if (newOre) {
        this.toast('⛏ Новая руда открыта: ' + newOre.name.toUpperCase() + '!');
      }

      if (Math.random() < this.block.dia) {
        // Звук нахождения алмаза
        soundManager.play('diamond');
        this.giveDiamonds(randInt(1, this.block.diaMax));
      }
      // Звук разрушения блока
      soundManager.play('breakB');
      
      this.save();
      setTimeout(() => {
        this.spawnBlock();
        this.state.sinceMob++;
        this.busy = false;
        if (this.maybeMob()) {
          this.startMob();
        } else {
          this.generateProblem();
        }
      }, 420);
    },

    maybeMob() {
      return !this.mobActive && this.state.sinceMob >= this.state.nextMobAt;
    },

    startMob() {
      this.mobActive = true;
      this.busy = false;
      this.currentMob = pickOne(CONFIG.mobs);
      // Звук появления моба
      soundManager.play('mob');
      this.toast(pickOne(this.currentMob.lines));
      this.generateProblem();
    },

    defeatMob() {
      this.mobActive = false;
      this.state.sinceMob = 0;
      this.state.nextMobAt = randInt(CONFIG.mobEveryMin, CONFIG.mobEveryMax);
      if (Math.random() < 0.5) this.giveDiamonds(1);
      this.busy = false;
      this.generateProblem();
    },

    giveDiamonds(n) {
      this.state.diamonds += n;
      this.save();
    },

    addXP(n) {
      this.state.xp += n;
      this.state.xpIntoLevel += n;

      while (this.state.xpIntoLevel >= CONFIG.xpNeed(this.state.level)) {
        this.state.xpIntoLevel -= CONFIG.xpNeed(this.state.level);
        this.state.level++;

        const t = CONFIG.unlockByLevel[this.state.level];
        if (this.state.progression && t && !this.state.tables.includes(t)) {
          this.state.tables.push(t);
        }

        // Звук повышения уровня
        soundManager.play('levelup');
        this.showLevelUp = true;
      }
      this.save();
    },

    buyItem(item, type) {
      if (this.state.diamonds >= item.price) {
        this.state.diamonds -= item.price;
        if (type === 'picks') {
          this.state.ownedPicks.push(item.id);
          this.state.pick = item.id;
        } else {
          this.state.ownedSkins.push(item.id);
          this.state.skin = item.id;
        }
        // Звук покупки
        soundManager.play('buy');
        this.save();
      }
    },

    equipItem(item, type) {
      if (type === 'picks') {
        this.state.pick = item.id;
      } else {
        this.state.skin = item.id;
      }
      this.save();
    },

    toggleMute() {
      this.state.muted = !this.state.muted;
      // Обновляем состояние в soundManager
      soundManager.setMuted(this.state.muted);
      this.save();
    },

    resetProgress() {
      localStorage.removeItem(CONFIG.saveKey);
      location.reload();
    },

    closeLevelUp() {
      this.showLevelUp = false;
    },

    openShop() {
      this.showShop = true;
    },

    closeShop() {
      this.showShop = false;
    },

    setShopTab(tab) {
      this.shopTab = tab;
    },

    toast(msg) {
      const id = Date.now();
      this.toasts.push({ id, message: msg });
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 2600);
    },

    showToast(msg) {
      this.toast(msg);
    },
  },
});
