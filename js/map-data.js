'use strict';

// Dimensões globais do mundo do jogo
const WORLD_W = 2150;
const WORLD_H = 1100;

// Gerador pseudoaleatório determinístico para texturas e casas
function rand(n) {
  const v = Math.sin(n * 127.1 + 39.7) * 43758.5453;
  return v - Math.floor(v);
}

// Ruas principais (verticais e horizontais)
const verticalRoads = [
  { x: 316, w: 112 },
  { x: 804, w: 116 },
  { x: 1200, w: 90 },
  { x: 1700, w: 100 }
];

const horizontalRoads = [
  { y: 188, h: 77 },
  { y: 568, h: 99 },
  { y: 790, h: 75 },
  { y: 950, h: 70 }
];

// Quarteirões residenciais
const blocks = [
  { x: 10, y: 8, w: 302, h: 175 },
  { x: 432, y: 8, w: 370, h: 175 },
  { x: 924, y: 8, w: 265, h: 175 },
  { x: 10, y: 270, w: 302, h: 290 },
  { x: 432, y: 270, w: 370, h: 290 },
  { x: 924, y: 270, w: 265, h: 290 },
  { x: 10, y: 668, w: 302, h: 105 },
  { x: 432, y: 668, w: 370, h: 105 },
  { x: 924, y: 668, w: 265, h: 105 }
];

for (const [x, w] of [[1295, 400], [1805, 335]]) {
  for (const [y, h] of [[8, 175], [270, 290], [668, 105], [870, 75], [1025, 70]]) {
    blocks.push({ x, y, w, h });
  }
}

for (const [x, w] of [[10, 302], [432, 370], [924, 265]]) {
  blocks.push({ x, y: 870, w, h: 75 }, { x, y: 1025, w, h: 70 });
}

// Becos e vielas que conectam uma rua à outra por dentro dos quarteirões
const alleys = [
  [[44, 270], [48, 335], [68, 366], [61, 424], [78, 472], [76, 530], [82, 568]],
  [[432, 345], [489, 348], [522, 376], [564, 369], [604, 403], [648, 397], [695, 420], [749, 418], [804, 432]],
  [[580, 270], [580, 316], [602, 351], [604, 403], [609, 452], [621, 507], [621, 568]],
  [[924, 335], [967, 344], [1000, 374], [1039, 375], [1075, 407], [1124, 407], [1200, 422]],
  [[1015, 270], [1018, 314], [1000, 374], [999, 427], [1007, 480], [1000, 529], [1000, 568]],
  [[503, 8], [506, 59], [534, 92], [535, 139], [538, 188]],
  [[730, 8], [728, 63], [703, 91], [703, 140], [707, 188]],
  [[1096, 8], [1093, 62], [1064, 96], [1064, 145], [1062, 188]],
  [[1290, 383], [1355, 379], [1415, 398], [1480, 390], [1545, 415], [1620, 403], [1700, 420]],
  [[1490, 265], [1494, 320], [1510, 373], [1502, 425], [1508, 493], [1515, 568]],
  [[1800, 338], [1850, 351], [1910, 370], [1970, 367], [2030, 393], [2090, 405], [2142, 420]],
  [[1950, 265], [1955, 323], [1970, 367], [1965, 427], [1975, 490], [1980, 568]],
  [[1380, 667], [1393, 710], [1430, 740], [1470, 790]],
  [[1840, 667], [1850, 712], [1880, 745], [1910, 790]],
  [[505, 865], [510, 898], [530, 925], [540, 950]],
  [[1375, 865], [1390, 895], [1420, 925], [1440, 950]]
];

function segmentDistance(px, py, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
}

function nearAlley(x, y, r) {
  return alleys.some(path => path.slice(1).some((p, i) => segmentDistance(x, y, path[i], p) < r));
}

// Geração automática das casas respeitando o traçado dos becos
const houses = [];
blocks.forEach((b, bi) => {
  for (let row = 0, y = b.y + 5; y < b.y + b.h - 30; row++, y += 53) {
    for (let col = 0, x = b.x + 4; x < b.x + b.w - 35; col++, x += 59) {
      const n = bi * 1000 + row * 37 + col;
      const hx = x + rand(n + 6) * 5;
      const hy = y + rand(n + 12) * 5;
      const w = 53 + rand(n + 30) * 5;
      const h = 47 + rand(n + 55) * 5;
      if (nearAlley(hx + w / 2, hy + h / 2, Math.hypot(w, h) / 2 + 14.5)) continue;
      houses.push({ x: hx, y: hy, w, h, n });
    }
  }
});

// Viaturas e carros civis estacionados nas ruas
const cars = [
  { x: 233, y: 226, police: true, vertical: false },
  { x: 956, y: 224, police: true, vertical: false },
  { x: 850, y: 337, police: true, vertical: true },
  { x: 853, y: 499, police: true, vertical: true },
  { x: 698, y: 619, police: true, vertical: false },
  { x: 810, y: 217, police: false, vertical: false },
  { x: 28, y: 624, police: false, vertical: false },
  { x: 1130, y: 622, police: false, vertical: false },
  { x: 1450, y: 224, police: true, vertical: false },
  { x: 1743, y: 383, police: true, vertical: true },
  { x: 1870, y: 619, police: true, vertical: false },
  { x: 1245, y: 728, police: true, vertical: true },
  { x: 1550, y: 826, police: false, vertical: false },
  { x: 1960, y: 984, police: true, vertical: false },
  { x: 850, y: 905, police: false, vertical: true }
];
