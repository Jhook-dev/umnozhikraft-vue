export const CONFIG = {
  unlockByLevel: { 2: 4, 3: 5, 4: 6, 5: 7, 6: 8, 7: 9 },

  blocks: [
    { id: 'grass', cls: 'block--grass', name: 'Земля', hp: 1, minDepth: 0, dia: 0.08, diaMax: 1, xp: 8 },
    { id: 'stone', cls: 'block--stone', name: 'Камень', hp: 2, minDepth: 3, dia: 0.12, diaMax: 1, xp: 10 },
    { id: 'coal', cls: 'block--coal', name: 'Угольная руда', hp: 2, minDepth: 8, dia: 0.4, diaMax: 1, xp: 12 },
    { id: 'iron', cls: 'block--iron', name: 'Железная руда', hp: 3, minDepth: 15, dia: 0.65, diaMax: 2, xp: 15 },
    { id: 'diamond', cls: 'block--diamond', name: 'Алмазная руда', hp: 4, minDepth: 24, dia: 1, diaMax: 3, xp: 25 },
  ],

  mobs: [
    { id: 'zombie', name: 'Зомби', lines: ['Зомби убежал жаловаться маме!', 'Зомби забыл, зачем пришёл!'] },
    { id: 'creeper', name: 'Крипер', lines: ['Крипер обиделся и ушёл шипеть в уголок!', 'Крипер передумал взрываться!'] },
  ],

  picks: [
    { id: 'wood', name: 'Деревянная кирка', dmg: 1, price: 0, color: '#a97d4b' },
    { id: 'stone', name: 'Каменная кирка', dmg: 2, price: 10, color: '#9c9c9c' },
    { id: 'iron', name: 'Железная кирка', dmg: 3, price: 25, color: '#e8e8e8' },
    { id: 'gold', name: 'Золотая кирка', dmg: 4, price: 45, color: '#ffd43d' },
    { id: 'diamond', name: 'Алмазная кирка', dmg: 5, price: 70, color: '#43e0c0' },
  ],

  skins: [
    { id: 'classic', name: 'Шахтёр Стив', price: 0, shirt: '#3fa7c9', skinTone: '#d29b62', hat: '' },
    { id: 'zombik', name: 'Зомбик', price: 15, shirt: '#1f7a8c', skinTone: '#6fae4f', hat: '' },
    { id: 'helmet', name: 'Прораб в каске', price: 30, shirt: '#ff8c2e', skinTone: '#d29b62', hat: '👷' },
    { id: 'king', name: 'Король шахты', price: 50, shirt: '#a24de0', skinTone: '#d29b62', hat: '👑' },
  ],

  xpNeed: (lvl) => 50 + (lvl - 1) * 40,
  mobEveryMin: 4,
  mobEveryMax: 7,
  saveKey: 'umnozhikraft_save_v1',
};
