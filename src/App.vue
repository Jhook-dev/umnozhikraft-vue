<template>
  <div id="app">
    <StartPage v-if="gameStore.status === 'start'" />
    <GamePage v-else>
      <template #hud-actions>
        <MusicPlayer />
      </template>
    </GamePage>
    <ShopModal v-if="gameStore.showShop" />
    <LevelUpModal v-if="gameStore.showLevelUp" />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useGameStore } from '@/entities/player/model/useGameStore';
import StartPage from '@/pages/start/ui/StartPage.vue';
import GamePage from '@/pages/game/ui/GamePage.vue';
import ShopModal from '@/features/shop/ui/ShopModal.vue';
import LevelUpModal from '@/features/mining/ui/LevelUpModal.vue';
import MusicPlayer from '@/features/music/ui/MusicPlayer.vue';
import ToastContainer from '@/features/notification/ui/ToastContainer.vue';

const gameStore = useGameStore();

onMounted(() => {
  // Initialize fonts and other global resources
});
</script>

<style>
/* Global styles will be in style.css */
</style>
