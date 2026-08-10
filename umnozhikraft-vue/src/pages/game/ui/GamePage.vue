<template>
  <main id="screen-game">
    <header id="hud">
      <div class="slot">⬇ <span class="lbl">ГЛУБИНА</span> <span id="hud-depth">{{ depth }} м</span></div>
      <div class="slot" id="hud-xp">
        <span id="hud-level">УРОВЕНЬ {{ level }}</span>
        <div class="xpbar"><i id="hud-xpfill" :style="{ width: xpPercent + '%' }"></i></div>
      </div>
      <div class="slot" id="hud-diamonds" :class="{ pop: diamondPop }">💎 <span id="hud-dia">{{ diamonds }}</span></div>
      <div v-if="streak >= 2" class="slot" id="hud-combo">🔥 ×<span id="hud-streak">{{ streak }}</span></div>
      <button class="btn-mc btn-gold" id="btn-shop" @click="openShop">🛒 МАГАЗИН</button>
      <button class="btn-mc" id="btn-mute" :title="muted ? 'Включить звук' : 'Звук'" @click="toggleMute">
        {{ muted ? '🔇' : '🔊' }}
      </button>
    </header>

    <div id="scene" :class="{ shake: isShaking }">
      <div class="torch" id="torchL"></div>
      <div class="torch" id="torchR"></div>
      <div id="ground"></div>
      <div id="miner">
        <span id="hat">{{ currentSkin.hat }}</span>
        <span id="minerSprite"></span>
        <span id="tool"></span>
      </div>
      <div id="block-wrap">
        <div 
          id="block" 
          :class="['block--' + blockType, { 'stage-' + blockStage, boom: isBoom }]"
        >
          <div class="cracks"><i></i><i></i><i></i></div>
        </div>
        <div id="pips">
          <i v-for="i in maxHp" :key="i" :class="{ off: i > currentHp }"></i>
        </div>
      </div>
      <div id="mob" :class="mobClass">
        <div id="mob-bubble" :hidden="!mobActive">❗</div>
        <span id="mobSprite">{{ mobActive ? '🧟' : '' }}</span>
      </div>
    </div>

    <section id="quest">
      <div id="quest-text">
        {{ mobActive ? currentMobName + ' подкрался! Ударь его мечом!' : '⛏ Чтобы сломать «' + blockName + '», реши:' }}
      </div>
      <div id="equation" :class="{ solved: answerCorrect }" class="px">
        <template v-if="problem">
          {{ problem.a }} × {{ problem.b }} = <span v-if="!answerCorrect" class="q">?</span><span v-else>{{ problem.correct }}</span>
        </template>
      </div>
      <div id="answers">
        <button
          v-for="(opt, idx) in problem?.options"
          :key="idx"
          :class="['answer', 'btn-mc', { correct: opt === problem.correct && answered, cracked: isCracked(opt) }]"
          :disabled="answered || isCracked(opt)"
          @click="handleAnswer(opt)"
        >
          {{ opt }}
        </button>
      </div>
      <div id="hint">{{ hint }}</div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGameStore } from '@/entities/player/model/useGameStore';
import { CONFIG } from '@/shared/config/game';
import { getHint } from '@/shared/lib/utils';

const gameStore = useGameStore();

const depth = computed(() => gameStore.state?.depth || 0);
const level = computed(() => gameStore.state?.level || 1);
const diamonds = computed(() => gameStore.state?.diamonds || 0);
const streak = computed(() => gameStore.state?.streak || 0);
const muted = computed(() => gameStore.state?.muted || false);
const xpPercent = computed(() => {
  if (!gameStore.state) return 0;
  return Math.min(100, (gameStore.state.xpIntoLevel / CONFIG.xpNeed(gameStore.state.level)) * 100);
});

const blockType = computed(() => gameStore.block?.id || 'grass');
const blockName = computed(() => gameStore.block?.name || 'Земля');
const blockStage = computed(() => gameStore.block?.stage || 0);
const currentHp = computed(() => gameStore.block?.currentHp || 1);
const maxHp = computed(() => gameStore.block?.maxHp || 1);

const problem = computed(() => gameStore.problem);
const mobActive = computed(() => gameStore.mobActive);
const currentMobName = computed(() => gameStore.currentMob?.name || '');

const answered = ref(false);
const answerCorrect = ref(false);
const crackedAnswers = ref(new Set());
const hint = ref('');
const isShaking = ref(false);
const isBoom = ref(false);
const diamondPop = ref(false);
const mobClass = ref('');
const currentSkin = computed(() => CONFIG.skins.find(s => s.id === gameStore.state?.skin) || CONFIG.skins[0]);

const openShop = () => gameStore.openShop();
const toggleMute = () => gameStore.toggleMute();

const isCracked = (opt) => crackedAnswers.value.has(opt);

const handleAnswer = (value) => {
  if (gameStore.busy) return;
  
  if (value === problem.value.correct) {
    answered.value = true;
    answerCorrect.value = true;
    gameStore.answer(value);
  } else {
    crackedAnswers.value.add(value);
    hint.value = getHint(problem.value.a, problem.value.b);
    gameStore.answer(value);
    
    if (mobActive.value) {
      mobClass.value = 'hop';
      setTimeout(() => mobClass.value = '', 400);
    } else {
      isShaking.value = true;
      setTimeout(() => isShaking.value = false, 300);
    }
  }
};

// Watch for block changes to reset answer state
onMounted(() => {
  // Initialize miner sprite
});
</script>

<style scoped>
/* Styles will be imported from global CSS */
</style>
