/* ================================================================
   🖼️ ПИКСЕЛЬ-АРТ (box-shadow из текстовых схем)
   ================================================================ */

export function makeSprite(rows, palette, px = 6) {
  const shadows = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const c = palette[ch];
      if (c) shadows.push(`${x * px}px ${y * px}px 0 0 ${c}`);
    });
  });
  
  const wrap = document.createElement('div');
  wrap.style.cssText = `position:relative;width:${rows[0].length * px}px;height:${rows.length * px}px`;
  
  const dot = document.createElement('div');
  dot.style.cssText = `position:absolute;width:${px}px;height:${px}px;box-shadow:${shadows.join(',')}`;
  
  wrap.appendChild(dot);
  return wrap;
}

const MINER_MAP = [
  "..HHHH..",
  ".HHHHHH.",
  ".FFFFFF.",
  ".FEFFEF.",
  ".FFFFFF.",
  ".SSSSSS.",
  "FSSSSSSF",
  ".SSSSSS.",
  ".PPPPPP.",
  ".BB..BB."
];

const CREEPER_MAP = [
  "GGGGGGGG",
  "GgGGGGgG",
  "GEEGGEEG",
  "GEEGGEEG",
  "GGGEEGGG",
  "GGGEEGGG",
  "GGEGGEGG",
  "GGEGGEGG",
  "GgGGGGgG",
  "GGGGGGGG",
  "GG....GG"
];

const PICK_MAP = [
  "PP....PP",
  "PPPPPPPP",
  ".PPPPPP.",
  "...TT...",
  "...TT...",
  "...TT...",
  "...TT..."
];

const SWORD_MAP = [
  "...LL...",
  "...LL...",
  "...LL...",
  "...LL...",
  ".TTTTTT.",
  "...TT...",
  "...TT..."
];

export const Sprites = {
  miner(skin) {
    return makeSprite(MINER_MAP, {
      H: '#4a2e18',
      F: skin.skinTone,
      E: '#2c3f8f',
      S: skin.shirt,
      P: '#2b3a8f',
      B: '#5d5d5d'
    }, 6);
  },
  
  zombie() {
    return makeSprite(MINER_MAP, {
      H: '#3e6b2f',
      F: '#6fae4f',
      E: '#111',
      S: '#1f7a8c',
      P: '#2b3a8f',
      B: '#444'
    }, 6);
  },
  
  creeper() {
    return makeSprite(CREEPER_MAP, {
      G: '#58c43c',
      g: '#3f9a2a',
      E: '#101d0c'
    }, 6);
  },
  
  pickaxe(color, px = 6) {
    return makeSprite(PICK_MAP, {
      P: color,
      T: '#8a5a2b'
    }, px);
  },
  
  sword() {
    return makeSprite(SWORD_MAP, {
      L: '#43e0c0',
      T: '#8a5a2b'
    }, 6);
  },
  
  minerPreview(skin) {
    return makeSprite(MINER_MAP, {
      H: '#4a2e18',
      F: skin.skinTone,
      E: '#2c3f8f',
      S: skin.shirt,
      P: '#2b3a8f',
      B: '#5d5d5d'
    }, 4);
  }
};
