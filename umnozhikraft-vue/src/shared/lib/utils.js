export function randInt(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

export function pickOne(arr) {
  return arr[randInt(0, arr.length - 1)];
}

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateDistractors(a, b, correct) {
  let cand = [
    correct + a,
    correct - a,
    correct + b,
    correct - b,
    (a + 1) * b,
    (a - 1) * b,
    a * (b + 1),
    a * (b - 1),
    correct + 10,
    correct - 10,
    correct + 2,
    correct - 2,
  ]
    .filter((v) => v > 0 && v !== correct);
  cand = [...new Set(cand)];
  shuffle(cand);
  const out = cand.slice(0, 3);
  while (out.length < 3) {
    const v = correct + randInt(-9, 9);
    if (v > 0 && v !== correct && !out.includes(v)) out.push(v);
  }
  return out;
}

export function getHint(a, b) {
  const s = Math.min(a, b);
  const l = Math.max(a, b);
  return s <= 4
    ? `Подсказка: ${a} × ${b} — это ${Array(s).fill(l).join(' + ')}`
    : `Подсказка: вспомни таблицу × ${a}`;
}
