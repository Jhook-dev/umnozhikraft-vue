<template>
  <div id="toasts">
    <div v-for="(toast, index) in toasts" :key="index" class="toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/entities/player/model/useGameStore';

const gameStore = useGameStore();
const toasts = gameStore.toasts;
</script>

<style scoped>
#toasts {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  pointer-events: none;
}
.toast {
  font-family: var(--px-font);
  font-size: 13px;
  background: #000;
  border: 3px solid var(--gold);
  color: #ffe95e;
  padding: 10px 16px;
  animation: toastIn 2.6s forwards;
}
@keyframes toastIn {
  0% { opacity: 0; transform: translateY(-20px); }
  10%, 80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; }
}
</style>
