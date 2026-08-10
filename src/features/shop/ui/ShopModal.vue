<script setup>
  import { computed, onMounted, ref } from 'vue';
  import { useGameStore } from '@/entities/player/model/useGameStore';
  import { CONFIG } from '@/shared/config/game';
  import { Sprites } from '@/shared/lib/sprites';

  const gameStore = useGameStore();
  const iconRefs = ref([]);

  const shopTab = computed(() => gameStore.shopTab);
  const diamonds = computed(() => gameStore.state?.diamonds || 0);
  const items = computed(() =>
    shopTab.value === 'picks' ? CONFIG.picks : CONFIG.skins,
  );
  const ownedItems = computed(() =>
    shopTab.value === 'picks'
      ? gameStore.state?.ownedPicks
      : gameStore.state?.ownedSkins,
  );
  const equippedItem = computed(() =>
    shopTab.value === 'picks' ? gameStore.state?.pick : gameStore.state?.skin,
  );

  const renderIcons = () => {
    iconRefs.value.forEach((el, index) => {
      if (!el) return;
      el.innerHTML = '';
      const item = items.value[index];
      if (shopTab.value === 'picks') {
        el.appendChild(Sprites.pickaxe(item.color, 5));
      } else {
        el.appendChild(Sprites.minerPreview(item));
      }
    });
  };

  onMounted(() => {
    renderIcons();
  });

  const itemDesc = (item, tab) => {
    if (tab === 'picks') return `Сила удара: ${item.dmg}`;
    return 'Модный шахтёр';
  };

  const isOwned = (id) => ownedItems.value?.includes(id);
  const isEquipped = (id) => equippedItem.value === id;

  const setShopTab = (tab) => {
    gameStore.setShopTab(tab);
    setTimeout(() => renderIcons(), 0);
  };
  const closeShop = () => gameStore.closeShop();
  const resetProgress = () => gameStore.resetProgress();

  const buyItem = (item) => {
    if (gameStore.state.diamonds >= item.price) {
      gameStore.toast('Покупка! ' + item.name + ' — твои!');
    }
    gameStore.buyItem(item, shopTab.value);
    setTimeout(() => renderIcons(), 0);
  };

  const equipItem = (item) => {
    gameStore.equipItem(item, shopTab.value);
    setTimeout(() => renderIcons(), 0);
  };
</script>

<template>
  <div class="overlay" id="shop">
    <div class="panel">
      <h2>🛒 ШАХТЁРСКИЙ МАГАЗИН</h2>
      <p style="margin-bottom: 12px">
        Твои алмазы: 💎 <b>{{ diamonds }}</b>
      </p>
      <div class="shop-tabs">
        <button
          :class="['btn-mc', { active: shopTab === 'picks' }]"
          @click="setShopTab('picks')"
        >
          ⛏ КИРКИ
        </button>
        <button
          :class="['btn-mc', { active: shopTab === 'skins' }]"
          @click="setShopTab('skins')"
        >
          🧑 СКИНЫ
        </button>
      </div>
      <div id="shop-grid">
        <div v-for="item in items" :key="item.id" class="item">
          <div class="icon" ref="iconRefs" :data-item-id="item.id"></div>
          <div class="name">{{ item.name }}</div>
          <div class="desc">{{ itemDesc(item, shopTab) }}</div>
          <template v-if="isOwned(item.id)">
            <div v-if="isEquipped(item.id)" class="equipped">✔ ВЫБРАНО</div>
            <button v-else class="btn-mc" @click="equipItem(item)">
              ВЫБРАТЬ
            </button>
          </template>
          <button
            v-else
            :class="['btn-mc', 'btn-gold']"
            :disabled="diamonds < item.price"
            @click="buyItem(item)"
          >
            КУПИТЬ ЗА {{ item.price }} 💎
          </button>
        </div>
      </div>
      <div
        style="
          margin-top: 18px;
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        "
      >
        <button class="btn-mc btn-green" @click="closeShop">
          КОПАТЬ ДАЛЬШЕ
        </button>
        <button class="btn-mc" style="font-size: 10px" @click="resetProgress">
          🗑 Сброс прогресса
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .shop-tabs .btn-mc.active {
    outline: 3px solid var(--gold);
  }

  #shop-grid {
    gap: 14px;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));

    display: grid;

    text-align: left;
  }

  .item {
    gap: 8px;

    display: flex;
    align-items: center;
    flex-direction: column;

    padding: 12px;

    border: 3px solid #000000;
    background: #1d140b;
    box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.06);
  }

  .item .icon {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 64px;

    font-size: 40px;
  }

  .item .name {
    text-align: center;

    font-family: var(--px-font);
    font-size: 11px;
  }

  .item .desc {
    text-align: center;

    color: #c9b28f;

    font-size: 13px;
  }

  .item .btn-mc {
    width: 100%;
    padding: 10px 12px;

    font-size: 11px;
  }

  .item .equipped {
    color: #9dff5e;

    font-family: var(--px-font);
    font-size: 11px;
  }

  .item .btn-mc:disabled {
    cursor: default;

    opacity: 0.55;
  }

</style>
