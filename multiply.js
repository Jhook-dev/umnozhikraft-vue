// ================================================================
// ТАБЛИЦА УМНОЖЕНИЯ — логика игры
// ================================================================

const CONFIG = {
  xpNeed: lvl => 50 + (lvl - 1) * 40,
  blocks: [
    {id:'grass', cls:'block--grass', hp:1, xp:10, diamonds:0.1},
    {id:'stone', cls:'block--stone', hp:2, xp:15, diamonds:0.15},
    {id:'diamond', cls:'block--diamond', hp:3, xp:25, diamonds:1},
  ],
};

let state = {
  level: 1,
  xp: 0,
  diamonds: 0,
  streak: 0,
  currentBlock: null,
  currentProblem: null,
};

// Инициализация
function init() {
  loadProgress();
  renderHUD();
  spawnBlock();
  generateProblem();
  
  document.getElementById('btn-back').addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

// Загрузка прогресса
function loadProgress() {
  const saved = localStorage.getItem('multiply_progress');
  if (saved) {
    state = JSON.parse(saved);
  }
}

// Сохранение прогресса
function saveProgress() {
  localStorage.setItem('multiply_progress', JSON.stringify(state));
}

// Рендер HUD
function renderHUD() {
  document.getElementById('hud-level').textContent = state.level;
  document.getElementById('hud-xp').textContent = state.xp;
  document.getElementById('hud-xp-need').textContent = CONFIG.xpNeed(state.level);
  document.getElementById('hud-diamonds').textContent = Math.floor(state.diamonds);
  document.getElementById('hud-streak').textContent = state.streak;
}

// Спавн блока
function spawnBlock() {
  const depth = Math.floor(state.diamonds / 2);
  let availableBlocks = CONFIG.blocks.filter(b => b.id === 'grass' || (b.id === 'stone' && depth >= 3) || (b.id === 'diamond' && depth >= 10));
  if (availableBlocks.length === 0) availableBlocks = [CONFIG.blocks[0]];
  
  // Выбираем блок с учётом глубины
  const rand = Math.random();
  if (rand < 0.5) {
    state.currentBlock = { ...availableBlocks[0] };
  } else if (availableBlocks.length > 1 && rand < 0.8) {
    state.currentBlock = { ...availableBlocks[1] };
  } else if (availableBlocks.length > 2) {
    state.currentBlock = { ...availableBlocks[2] };
  } else {
    state.currentBlock = { ...availableBlocks[availableBlocks.length - 1] };
  }
  
  state.currentBlock.maxHp = state.currentBlock.hp;
  updateBlockVisual();
}

// Обновление визуала блока
function updateBlockVisual() {
  const block = document.getElementById('block');
  block.className = state.currentBlock.cls;
  
  const damagePercent = 1 - (state.currentBlock.hp / state.currentBlock.maxHp);
  block.dataset.stage = damagePercent >= 0.66 ? '3' : damagePercent >= 0.33 ? '2' : damagePercent > 0 ? '1' : '0';
}

// Генерация примера
function generateProblem() {
  const tables = [2, 3, 4, 5, 6, 7, 8, 9];
  // Фильтруем таблицы по уровню
  const maxTable = Math.min(9, 2 + Math.floor((state.level - 1) / 2));
  const availableTables = tables.filter(t => t <= maxTable);
  
  const a = availableTables[Math.floor(Math.random() * availableTables.length)];
  const b = Math.floor(Math.random() * 10) + 1;
  
  state.currentProblem = { a, b, answer: a * b };
  
  document.getElementById('equation').textContent = `${a} × ${b} = ?`;
  
  // Генерируем варианты ответов
  const answers = new Set([state.currentProblem.answer]);
  while (answers.size < 4) {
    const offset = Math.floor(Math.random() * 5) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const wrong = state.currentProblem.answer + (offset * sign);
    if (wrong > 0 && wrong !== state.currentProblem.answer) {
      answers.add(wrong);
    }
  }
  
  const shuffled = Array.from(answers).sort(() => Math.random() - 0.5);
  
  const answersContainer = document.getElementById('answers');
  answersContainer.innerHTML = '';
  
  shuffled.forEach(ans => {
    const btn = document.createElement('button');
    btn.className = 'answer px';
    btn.textContent = ans;
    btn.addEventListener('click', () => checkAnswer(ans, btn));
    answersContainer.appendChild(btn);
  });
}

// Проверка ответа
function checkAnswer(selected, btnElement) {
  const isCorrect = selected === state.currentProblem.answer;
  
  if (isCorrect) {
    btnElement.classList.add('correct');
    state.streak++;
    
    // Награда
    const xpGain = 10 + state.streak;
    state.xp += xpGain;
    state.diamonds += state.currentBlock.diamonds;
    
    // Повреждение блока
    state.currentBlock.hp--;
    
    // Звук (опционально)
    playSound('correct');
    
    if (state.currentBlock.hp <= 0) {
      // Блок разрушен
      setTimeout(() => {
        showFloatText(`+${xpGain} XP`, 'good');
        if (state.currentBlock.diamonds >= 1) {
          showFloatText(`+💎`, 'diamond');
        }
        checkLevelUp();
        saveProgress();
        renderHUD();
        spawnBlock();
        generateProblem();
      }, 300);
    } else {
      updateBlockVisual();
      setTimeout(() => {
        generateProblem();
      }, 300);
    }
  } else {
    btnElement.classList.add('wrong');
    state.streak = 0;
    playSound('wrong');
    setTimeout(() => {
      btnElement.classList.remove('wrong');
    }, 300);
  }
  
  renderHUD();
}

// Проверка уровня
function checkLevelUp() {
  const need = CONFIG.xpNeed(state.level);
  if (state.xp >= need) {
    state.xp -= need;
    state.level++;
    showFloatText('🎉 УРОВЕНЬ ПОВЫШЕН!', 'levelup');
    playSound('levelup');
  }
}

// Показ всплывающего текста
function showFloatText(text, type) {
  const scene = document.getElementById('scene');
  const el = document.createElement('div');
  el.className = 'px';
  el.textContent = text;
  el.style.cssText = `position:absolute; left:50%; top:40%; transform:translateX(-50%); 
    font-size:18px; color:${type==='good'?'#9dff5e':type==='diamond'?'#43e0c0':'#ffe95e'};
    text-shadow:2px 2px 0 #000; pointer-events:none; z-index:10;
    animation:floatUp 1s forwards;`;
  scene.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// Звуки (упрощённые)
function playSound(type) {
  // Можно добавить WebAudio API для звуков
  console.log('Sound:', type);
}

// Запуск
init();
