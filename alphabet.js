// ================================================================
// РУССКИЙ АЛФАВИТ — логика игры
// ================================================================

const ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');

const CONFIG = {
  xpNeed: lvl => 50 + (lvl - 1) * 40,
  blockHp: 3,
};

let state = {
  level: 1,
  xp: 0,
  foundLetters: [], // Найденные буквы
  currentLetter: null,
  currentBlockHp: 0,
  questionType: null, // 'find', 'next', 'prev'
};

// Инициализация
function init() {
  loadProgress();
  renderHUD();
  spawnNewLetter();
  
  document.getElementById('btn-back').addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

// Загрузка прогресса
function loadProgress() {
  const saved = localStorage.getItem('alphabet_progress');
  if (saved) {
    const data = JSON.parse(saved);
    state.level = data.level || 1;
    state.xp = data.xp || 0;
    state.foundLetters = data.foundLetters || [];
  }
}

// Сохранение прогресса
function saveProgress() {
  localStorage.setItem('alphabet_progress', JSON.stringify({
    level: state.level,
    xp: state.xp,
    foundLetters: state.foundLetters,
  }));
}

// Рендер HUD
function renderHUD() {
  document.getElementById('hud-level').textContent = state.level;
  document.getElementById('hud-xp').textContent = state.xp;
  document.getElementById('hud-xp-need').textContent = CONFIG.xpNeed(state.level);
  document.getElementById('hud-letters').textContent = state.foundLetters.length;
  updateLettersFound();
}

// Обновление списка найденных букв
function updateLettersFound() {
  const container = document.getElementById('letters-found');
  if (state.foundLetters.length === 0) {
    container.textContent = 'Пока нет';
    container.style.color = '#888';
  } else {
    container.textContent = state.foundLetters.sort().join(' ');
    container.style.color = state.foundLetters.length >= 33 ? '#9dff5e' : '#fff';
  }
}

// Спавн новой буквы для изучения
function spawnNewLetter() {
  state.currentBlockHp = CONFIG.blockHp;
  updateBlockVisual();
  generateQuestion();
}

// Обновление визуала блока
function updateBlockVisual() {
  const block = document.getElementById('block');
  const damagePercent = 1 - (state.currentBlockHp / CONFIG.blockHp);
  block.dataset.stage = damagePercent >= 0.66 ? '3' : damagePercent >= 0.33 ? '2' : damagePercent > 0 ? '1' : '0';
}

// Генерация вопроса
function generateQuestion() {
  // Определяем тип вопроса
  const types = ['find', 'next', 'prev'];
  state.questionType = types[Math.floor(Math.random() * types.length)];
  
  let targetLetter;
  let questionText;
  let correctAnswer;
  let options;
  
  if (state.questionType === 'find') {
    // "Найди букву ..."
    targetLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    state.currentLetter = targetLetter;
    questionText = `Найди букву: "${targetLetter}"`;
    correctAnswer = targetLetter;
    
    // Генерируем варианты
    options = generateOptions(targetLetter);
    
    document.getElementById('block-letter').textContent = '?';
    document.getElementById('letter-display').hidden = true;
    
  } else if (state.questionType === 'next') {
    // "Какая буква идёт после ..."
    const maxIndex = ALPHABET.length - 2;
    const randomIndex = Math.floor(Math.random() * maxIndex);
    targetLetter = ALPHABET[randomIndex];
    state.currentLetter = targetLetter;
    correctAnswer = ALPHABET[randomIndex + 1];
    questionText = `Какая буква идёт ПОСЛЕ "${targetLetter}"?`;
    
    options = generateOptions(correctAnswer);
    
    document.getElementById('block-letter').textContent = targetLetter;
    document.getElementById('letter-display').hidden = false;
    document.getElementById('letter-display').textContent = '➡️';
    
  } else if (state.questionType === 'prev') {
    // "Какая буква идёт перед ..."
    const minIndex = 1;
    const randomIndex = minIndex + Math.floor(Math.random() * (ALPHABET.length - minIndex));
    targetLetter = ALPHABET[randomIndex];
    state.currentLetter = targetLetter;
    correctAnswer = ALPHABET[randomIndex - 1];
    questionText = `Какая буква идёт ПЕРЕД "${targetLetter}"?`;
    
    options = generateOptions(correctAnswer);
    
    document.getElementById('block-letter').textContent = targetLetter;
    document.getElementById('letter-display').hidden = false;
    document.getElementById('letter-display').textContent = '⬅️';
  }
  
  document.getElementById('question').textContent = questionText;
  renderAnswers(options, correctAnswer);
}

// Генерация вариантов ответов
function generateOptions(correct) {
  const options = new Set([correct]);
  while (options.size < 4) {
    const randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    if (randomLetter !== correct) {
      options.add(randomLetter);
    }
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}

// Рендер кнопок ответов
function renderAnswers(options, correctAnswer) {
  const container = document.getElementById('answers');
  container.innerHTML = '';
  
  options.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'answer px';
    btn.textContent = letter;
    btn.addEventListener('click', () => checkAnswer(letter, correctAnswer, btn));
    container.appendChild(btn);
  });
}

// Проверка ответа
function checkAnswer(selected, correct, btnElement) {
  const isCorrect = selected === correct;
  
  if (isCorrect) {
    btnElement.classList.add('correct');
    
    // Награда
    const xpGain = 15;
    state.xp += xpGain;
    
    // Добавляем букву в найденные
    if (!state.foundLetters.includes(correct)) {
      state.foundLetters.push(correct);
      showFloatText(`+🔤 ${correct}`, 'diamond');
    }
    
    // Повреждение блока
    state.currentBlockHp--;
    
    if (state.currentBlockHp <= 0) {
      // Блок разрушен
      setTimeout(() => {
        showFloatText(`+${xpGain} XP`, 'good');
        checkLevelUp();
        saveProgress();
        renderHUD();
        spawnNewLetter();
      }, 300);
    } else {
      updateBlockVisual();
      setTimeout(() => {
        generateQuestion();
      }, 300);
    }
  } else {
    btnElement.classList.add('wrong');
    showFloatText('Подумай ещё!', 'wrong');
    setTimeout(() => {
      btnElement.classList.remove('wrong');
    }, 300);
  }
}

// Проверка уровня
function checkLevelUp() {
  const need = CONFIG.xpNeed(state.level);
  if (state.xp >= need) {
    state.xp -= need;
    state.level++;
    showFloatText('🎉 УРОВЕНЬ ПОВЫШЕН!', 'levelup');
  }
}

// Показ всплывающего текста
function showFloatText(text, type) {
  const scene = document.getElementById('scene');
  const el = document.createElement('div');
  el.className = 'px';
  el.textContent = text;
  el.style.cssText = `position:absolute; left:50%; top:40%; transform:translateX(-50%); 
    font-size:18px; color:${type==='good'?'#9dff5e':type==='diamond'?'#43e0c0':type==='wrong'?'#e5483f':'#ffe95e'};
    text-shadow:2px 2px 0 #000; pointer-events:none; z-index:10;
    animation:floatUp 1s forwards;`;
  scene.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// Запуск
init();
