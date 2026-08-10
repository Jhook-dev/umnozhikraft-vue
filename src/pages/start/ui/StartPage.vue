<template>
  <section id="screen-start">
    <div style="position:relative">
      <h1 class="logo">УМНОЖИ<b>КРАФТ</b></h1>
      <span class="splash">⛏ Теперь с алмазами!</span>
    </div>
    <p class="start-note">Решай примеры — ломай блоки! Отметь таблицы, которые хочешь тренировать (можно несколько):</p>

    <TableSelector />

    <button class="btn-mc btn-green" id="btn-play" @click="startNewGame">▶ НОВАЯ ИГРА</button>
    <button v-if="hasSave" class="btn-mc btn-gold" id="btn-continue" @click="continueGame">
      ⛏ ПРОДОЛЖИТЬ СМЕНУ
    </button>
    <p class="start-note" style="font-size:13px; opacity:.75">
      Для родителей: в игре нет проигрыша — за ошибку ребёнок получает мягкую подсказку и пробует снова.
      Набор «Новичок» открывает новые таблицы по уровням.
    </p>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useGameStore } from '@/entities/player/model/useGameStore';
import { soundManager } from '@/shared/lib/soundManager';
import TableSelector from '@/features/selection/ui/TableSelector.vue';

const gameStore = useGameStore();

const hasSave = computed(() => gameStore.hasSave);

// Инициализируем звук при загрузке страницы (после первого клика пользователя)
const initSound = () => {
  soundManager.init();
  soundManager.setMuted(gameStore.state?.muted || false);
};

const startNewGame = () => {
  initSound();
  gameStore.startNewGame();
};

const continueGame = () => {
  initSound();
  gameStore.continueGame();
};
</script>

<style scoped>
#screen-start {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  padding: 24px;
  position: relative;
}

.logo {
  font-family: var(--px-font);
  font-size: clamp(26px, 6vw, 58px);
  text-align: center;
  line-height: 1.25;
  color: #fff;
  text-shadow: 4px 4px 0 #3f3f3f, 8px 8px 0 rgba(0, 0, 0, 0.45);
  letter-spacing: 2px;
}

.logo b {
  color: var(--gold);
  text-shadow: 4px 4px 0 #7a5a00, 8px 8px 0 rgba(0, 0, 0, 0.45);
}

.splash {
  position: absolute;
  top: -14px;
  right: -30px;
  transform: rotate(-9deg);
  color: #ff5;
  font-family: var(--px-font);
  font-size: clamp(9px, 1.6vw, 14px);
  text-shadow: 2px 2px 0 #3f3f00;
  animation: splash 1s ease-in-out infinite alternate;
  white-space: nowrap;
}

@keyframes splash {
  from { scale: 1 }
  to { scale: 1.12 }
}

.start-note {
  max-width: 560px;
  text-align: center;
  font-size: 15px;
  color: #c9b28f;
}

#btn-play {
  font-size: clamp(16px, 3vw, 24px);
  padding: 22px 44px;
}

#btn-continue {
  font-size: clamp(16px, 3vw, 24px);
  padding: 22px 44px;
}
</style>
