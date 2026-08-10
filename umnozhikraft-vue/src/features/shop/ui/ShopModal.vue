<template>
  <div class="overlay" id="shop">
    <div class="panel">
      <h2>🛒 ШАХТЁРСКИЙ МАГАЗИН</h2>
      <p style="margin-bottom:12px">Твои алмазы: 💎 <b>{{ diamonds }}</b></p>
      <div class="shop-tabs">
        <button :class="['btn-mc', { active: shopTab === 'picks' }]" @click="setShopTab('picks')">⛏ КИРКИ</button>
        <button :class="['btn-mc', { active: shopTab === 'skins' }]" @click="setShopTab('skins')">🧑 СКИНЫ</button>
      </div>
      <div id="shop-grid">
        <div v-for="item in items" :key="item.id" class="item">
          <div class="icon">{{ itemIcon(item) }}</div>
          <div class="name">{{ item.name }}</div>
          <div class="desc">{{ itemDesc(item, shopTab) }}</div>
          <template v-if="isOwned(item.id)">
            <div v-if="isEquipped(item.id)" class="equipped">✔ ВЫБРАНО</div>
            <button v-else class="btn-mc" @click="equipItem(item)">ВЫБРАТЬ</button>
          </template>
          <button v-else :class="['btn-mc', 'btn-gold']" :disabled="diamonds < item.price" @click="buyItem(item)">
            КУПИТЬ ЗА {{ item.price }} 💎
          </button>
        </div>
      </div>
      <div style="margin-top:18px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap">
        <button class="btn-mc btn-green" @click="closeShop">КОПАТЬ ДАЛЬШЕ</button>
        <button class="btn-mc" style="font-size:10px" @click="resetProgress">🗑 Сброс прогресса</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGameStore } from '@/entities/player/model/useGameStore';
import { CONFIG } from '@/shared/config/game';

const gameStore = useGameStore();

const shopTab = computed(() => gameStore.shopTab);
const diamonds = computed(() => gameStore.state?.diamonds || 0);
const items = computed(() => shopTab.value === 'picks' ? CONFIG.picks : CONFIG.skins);
const ownedItems = computed(() => shopTab.value === 'picks' ? gameStore.state?.ownedPicks : gameStore.state?.ownedSkins);
const equippedItem = computed(() => shopTab.value === 'picks' ? gameStore.state?.pick : gameStore.state?.skin);

const itemIcon = (item) => {
  if (shopTab.value === 'picks') return '⛏';
  return '🧑';
};

const itemDesc = (item, tab) => {
  if (tab === 'picks') return `Сила удара: ${item.dmg}`;
  return 'Модный шахтёр';
};

const isOwned = (id) => ownedItems.value?.includes(id);
const isEquipped = (id) => equippedItem.value === id;

const setShopTab = (tab) => gameStore.setShopTab(tab);
const closeShop = () => gameStore.closeShop();
const resetProgress = () => gameStore.resetProgress();

const buyItem = (item) => {
  gameStore.buyItem(item, shopTab.value);
};

const equipItem = (item) => {
  gameStore.equipItem(item, shopTab.value);
};
</script>

<style scoped>
.shop-tabs .btn-mc.active {
  outline: 3px solid var(--gold);
}

#shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
  text-align: left;
}

.item {
  background: #1d140b;
  border: 3px solid #000;
  box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.06);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.item .icon {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.item .name {
  font-family: var(--px-font);
  font-size: 11px;
  text-align: center;
}

.item .desc {
  font-size: 13px;
  color: #c9b28f;
  text-align: center;
}

.item .btn-mc {
  font-size: 11px;
  padding: 10px 12px;
  width: 100%;
}

.item .equipped {
  color: #9dff5e;
  font-family: var(--px-font);
  font-size: 11px;
}

.item .btn-mc:disabled {
  opacity: 0.55;
  cursor: default;
}
</style>
