<template>
  <div class="music-player">
    <button 
      class="btn-music" 
      :class="{ playing: isPlaying, muted: isMuted }"
      @click="toggleMusic"
      :title="buttonTitle"
    >
      <span class="icon">{{ icon }}</span>
    </button>
    
    <div v-if="showPlaylist" class="playlist">
      <div class="playlist-header">
        <span>🎵 Музыка</span>
        <button class="btn-close" @click="showPlaylist = false">×</button>
      </div>
      <ul class="track-list">
        <li 
          v-for="(track, idx) in tracks" 
          :key="track.id"
          :class="{ active: currentTrackIndex === idx }"
          @click="playTrack(idx)"
        >
          <span class="track-icon">{{ track.icon }}</span>
          <span class="track-name">{{ track.name }}</span>
          <span v-if="currentTrackIndex === idx && isPlaying" class="playing-indicator">♫</span>
        </li>
      </ul>
      <div class="volume-control">
        <span>🔊</span>
        <input 
          type="range" 
          min="0" 
          max="100" 
          :value="volume * 100"
          @input="setVolume($event.target.value)"
          class="volume-slider"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGameStore } from '@/entities/player/model/useGameStore';

const gameStore = useGameStore();

// Список музыкальных треков
const tracks = [
  { id: 'mine', name: 'Шахтёрский марш', icon: '⛏️', src: '/assets/music/mine-theme.mp3' },
  { id: 'cave', name: 'Пещерная мелодия', icon: '🕳️', src: '/assets/music/cave-ambient.mp3' },
  { id: 'adventure', name: 'Приключение', icon: '🗺️', src: '/assets/music/adventure.mp3' },
  { id: 'victory', name: 'Победа', icon: '🏆', src: '/assets/music/victory.mp3' },
];

const audio = ref(null);
const isPlaying = ref(false);
const isMuted = ref(false);
const currentTrackIndex = ref(0);
const volume = ref(0.5);
const showPlaylist = ref(false);

// Создаем аудио элемент при монтировании
onMounted(() => {
  audio.value = new Audio();
  audio.value.loop = true;
  audio.value.volume = volume.value;
  
  // Загружаем состояние из store
  if (gameStore.state?.musicMuted !== undefined) {
    isMuted.value = gameStore.state.musicMuted;
    audio.value.muted = isMuted.value;
  }
  
  if (gameStore.state?.musicVolume !== undefined) {
    volume.value = gameStore.state.musicVolume;
    audio.value.volume = volume.value;
  }
  
  if (gameStore.state?.currentTrack !== undefined) {
    currentTrackIndex.value = gameStore.state.currentTrack;
  }
  
  // Воспроизводим текущий трек если игра активна
  if (gameStore.status === 'playing' && !isMuted.value) {
    playTrack(currentTrackIndex.value);
  }
});

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value = null;
  }
});

// Сохраняем состояние музыки в store
const saveMusicState = () => {
  if (gameStore.state) {
    gameStore.state.musicMuted = isMuted.value;
    gameStore.state.musicVolume = volume.value;
    gameStore.state.currentTrack = currentTrackIndex.value;
    gameStore.save();
  }
};

const icon = computed(() => {
  if (isMuted.value) return '🔇';
  if (!isPlaying.value) return '🎵';
  return '🎶';
});

const buttonTitle = computed(() => {
  if (isMuted.value) return 'Включить музыку';
  if (!isPlaying.value) return 'Запустить музыку';
  return showPlaylist.value ? 'Скрыть плейлист' : 'Открыть плейлист';
});

const toggleMusic = () => {
  if (isMuted.value) {
    // Включаем музыку
    isMuted.value = false;
    audio.value.muted = false;
    if (!isPlaying.value) {
      playTrack(currentTrackIndex.value);
    }
  } else if (!isPlaying.value) {
    // Запускаем воспроизведение
    playTrack(currentTrackIndex.value);
  } else {
    // Показываем/скрываем плейлист
    showPlaylist.value = !showPlaylist.value;
  }
  saveMusicState();
};

const playTrack = (index) => {
  if (index < 0 || index >= tracks.length) return;
  
  currentTrackIndex.value = index;
  const track = tracks[index];
  
  if (audio.value) {
    audio.value.src = track.src;
    audio.value.load();
    
    audio.value.play().then(() => {
      isPlaying.value = true;
      isMuted.value = false;
      showPlaylist.value = false;
    }).catch(err => {
      console.warn('Не удалось воспроизвести трек:', err);
      isPlaying.value = false;
    });
  }
  
  saveMusicState();
};

const setVolume = (value) => {
  volume.value = parseInt(value) / 100;
  if (audio.value) {
    audio.value.volume = volume.value;
  }
  saveMusicState();
};

// Следим за статусом игры
watch(() => gameStore.status, (newStatus) => {
  if (newStatus === 'playing' && !isMuted.value && !isPlaying.value) {
    playTrack(currentTrackIndex.value);
  } else if (newStatus === 'start') {
    if (audio.value) {
      audio.value.pause();
      isPlaying.value = false;
    }
  }
});
</script>

<style scoped>
.music-player {
  position: relative;
  display: inline-block;
}

.btn-music {
  background: linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%);
  border: 2px solid #666;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
  color: #fff;
  outline: none;
}

.btn-music:hover {
  background: linear-gradient(180deg, #5a5a5a 0%, #3a3a3a 100%);
  border-color: #888;
  transform: scale(1.05);
}

.btn-music.playing {
  background: linear-gradient(180deg, #4CAF50 0%, #2E7D32 100%);
  border-color: #81C784;
  animation: pulse 2s infinite;
}

.btn-music.muted {
  opacity: 0.6;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
  50% { box-shadow: 0 0 15px rgba(76, 175, 80, 0.8); }
}

.playlist {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
  border: 2px solid #666;
  border-radius: 8px;
  padding: 12px;
  min-width: 220px;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #444;
  color: #fff;
  font-weight: bold;
}

.btn-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
}

.btn-close:hover {
  color: #ff6b6b;
}

.track-list {
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
}

.track-list li {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  margin: 4px 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #ccc;
}

.track-list li:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.track-list li.active {
  background: linear-gradient(90deg, rgba(76, 175, 80, 0.3) 0%, rgba(46, 125, 50, 0.2) 100%);
  border-left: 3px solid #4CAF50;
  color: #fff;
}

.track-icon {
  margin-right: 8px;
  font-size: 18px;
}

.track-name {
  flex: 1;
  font-size: 14px;
}

.playing-indicator {
  animation: bounce 0.6s infinite alternate;
  color: #4CAF50;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-3px); }
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #444;
  color: #ccc;
}

.volume-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #444;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #4CAF50;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.volume-slider::-webkit-slider-thumb:hover {
  background: #66BB6A;
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #4CAF50;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.volume-slider::-moz-range-thumb:hover {
  background: #66BB6A;
}
</style>
