<template>
  <div class="tables-pick">
    <button
      v-for="t in tables"
      :key="t"
      :class="['btn-mc', 'tgl', { sel: isSelected(t) }]"
      @click="handleToggle(t)"
    >
      × {{ t }}
    </button>
  </div>
  <div class="presets">
    <button class="btn-mc" @click="setPreset([2, 3])">🌱 НОВИЧОК ×2–×3</button>
    <button class="btn-mc" @click="setPreset([4, 5, 6])">⛏ СРЕДНИЙ ×4–×6</button>
    <button class="btn-mc" @click="setPreset([7, 8, 9])">💪 ПРО ×7–×9</button>
    <button class="btn-mc btn-gold" @click="setPreset([2, 3, 4, 5, 6, 7, 8, 9])">💎 ВСЕ ×2–×9</button>
  </div>
</template>

<script setup>
import { useGameStore } from '@/entities/player/model/useGameStore';

const gameStore = useGameStore();
const tables = [2, 3, 4, 5, 6, 7, 8, 9];

const isSelected = (t) => gameStore.selectedTables.has(t);

const handleToggle = (t) => {
  gameStore.toggleTable(t);
};

const setPreset = (preset) => {
  gameStore.setPreset(preset);
};
</script>

<style scoped>
.tables-pick {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 540px;
}

.tables-pick .tgl {
  font-size: 16px;
  padding: 15px 17px;
  opacity: 0.55;
  transition: opacity 0.15s;
}

.tables-pick .tgl.sel {
  outline: 4px solid var(--gold);
  color: #ffe95e;
  opacity: 1;
}

.presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.presets .btn-mc {
  font-size: 10px;
  padding: 10px 12px;
}
</style>
