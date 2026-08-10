<template>
  <div class="overlay" id="levelup">
    <div class="panel" id="levelup-panel">
      <h2>⭐ УРОВЕНЬ {{ level }}! ⭐</h2>
      <div id="lu-text">{{ unlockMessage }}</div>
      <button class="btn-mc btn-green" @click="closeLevelUp">КОПАТЬ ДАЛЬШЕ ⛏</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGameStore } from '@/entities/player/model/useGameStore';
import { CONFIG } from '@/shared/config/game';

const gameStore = useGameStore();

const level = computed(() => gameStore.state?.level || 1);
const unlockMessage = computed(() => {
  const t = CONFIG.unlockByLevel[level.value];
  if (gameStore.state?.progression && t && !gameStore.state.tables.includes(t)) {
    return `Открыта таблица × ${t}! Теперь копаем ещё умнее!`;
  }
  return 'Так держать, шахтёр!';
});

const closeLevelUp = () => gameStore.closeLevelUp();
</script>

<style scoped>
#lu-text {
  font-size: clamp(15px, 2.6vw, 20px);
  font-weight: 800;
  margin: 14px 0 20px;
  color: #c8ff9d;
}
</style>
