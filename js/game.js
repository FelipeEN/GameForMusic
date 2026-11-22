'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const renderer = new MapRenderer(canvas);

  const startScreen = document.getElementById('start-screen');
  const hud = document.getElementById('hud');
  const controls = document.getElementById('game-controls');
  const message = document.getElementById('message');
  const diagnostic = document.getElementById('diagnostic');
  const selectedHud = document.getElementById('selected-hud');
  const progressHud = document.getElementById('progress-hud');

  const keys = new Set();
  const touch = new Set();

  const state = {
    viewW: 0,
    viewH: 0,
    scale: 1,
    started: false,
    selected: 1,
    last: 0,
    camera: { x: 600, y: 390 },
    people: [],
    points: []
  };

  function reset() {
    state.people = [
      {
        name: 'Don',
        x: 392,
        y: 616,
        shirt: '#c4b09b',
        skin: '#ae765c',
        keys: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      },
      {
        name: 'Jaya',
        x: 467,
        y: 606,
        shirt: '#da806b',
        skin: '#d9a87b',
        keys: ['KeyW', 'KeyS', 'KeyA', 'KeyD']
      }
    ];

    state.points = [
      { x: 384, y: 325, type: 'lamp', active: false },
      { x: 844, y: 395, type: 'lamp', active: false },
      { x: 599, y: 614, type: 'lamp', active: false },
      { x: 510, y: 247, type: 'culture' },
      { x: 746, y: 618, type: 'square' }
    ];

    state.selected = 1;
    state.camera.x = 600;
    state.camera.y = 390;
    state.last = 0;

    selectedHud.textContent = 'Câmera: Jaya';
    progressHud.textContent = 'Ouro Minerado: 0 / 3';
    document.getElementById('select-don').setAttribute('aria-pressed', 'false');
    document.getElementById('select-jaya').setAttribute('aria-pressed', 'true');

    keys.clear();
    touch.clear();
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    state.viewW = bounds.width;
    state.viewH = bounds.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(state.viewW * dpr);
    canvas.height = Math.round(state.viewH * dpr);
    renderer.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.scale = Math.max(state.viewW / 1050, state.viewH / 690);

    renderer.render(state, performance.now());
  }

  function isSolid(x, y) {
    if (x < 8 || x > WORLD_W - 8 || y < 8 || y > WORLD_H - 8) return true;
    return houses.some(
      h => x + 7 > h.x - 2 && x - 7 < h.x + h.w + 2 && y + 7 > h.y - 2 && y - 7 < h.y + h.h + 2
    );
  }

  function selectCharacter(index) {
    if (!state.started) return;
    state.selected = index;
    selectedHud.textContent = 'Câmera: ' + state.people[index].name;
    document.getElementById('select-don').setAttribute('aria-pressed', String(index === 0));
    document.getElementById('select-jaya').setAttribute('aria-pressed', String(index === 1));
  }

  function interact() {
    if (!state.started) return;
    const p = state.people[state.selected];
    let nearest = null;
    let distance = 60;

    for (const point of state.points) {
      const d = Math.hypot(point.x - p.x, point.y - p.y);
      if (d < distance) {
        distance = d;
        nearest = point;
      }
    }

    if (!nearest) {
      message.textContent = 'Chegue mais perto de um brilho para interagir.';
      return;
    }

    if (nearest.type === 'lamp') {
      if (nearest.active) {
        message.textContent = 'Este ponto dourado já foi encontrado.';
        return;
      }
      nearest.active = true;
      const count = state.points.filter(pt => pt.type === 'lamp' && pt.active).length;
      progressHud.textContent = 'Ouro Minerado: ' + count + ' / 3';
      message.textContent =
        count === 3
          ? 'Os três pontos dourados foram encontrados. A madrugada é de vocês.'
          : 'Ponto dourado encontrado! Continue pelos becos.';
    } else {
      message.textContent =
        nearest.type === 'square'
          ? 'A praça está quieta nesta hora da madrugada.'
          : 'O centro cultural descansa enquanto a cidade segue acordada.';
    }
  }

  function frame(time) {
    if (!state.started) return;

    const dt = Math.min((time - state.last) / 16.67 || 1, 2);
    state.last = time;

    state.people.forEach((p, i) => {
      const k = p.keys;
      let dx = Number(keys.has(k[3])) - Number(keys.has(k[2]));
      let dy = Number(keys.has(k[1])) - Number(keys.has(k[0]));

      if (i === state.selected) {
        dx += Number(touch.has('right')) - Number(touch.has('left'));
        dy += Number(touch.has('down')) - Number(touch.has('up'));
      }

      const length = Math.hypot(dx, dy) || 1;
      const speed = 2.8 * dt;
      const nx = p.x + (dx / length) * speed;
      const ny = p.y + (dy / length) * speed;

      if (!isSolid(nx, p.y)) p.x = nx;
      if (!isSolid(p.x, ny)) p.y = ny;
    });

    // Suavização da câmera acompanhando o personagem selecionado
    state.camera.x += (state.people[state.selected].x - state.camera.x) * 0.055;
    state.camera.y += (state.people[state.selected].y - state.camera.y) * 0.055;

    renderer.render(state, time);
    requestAnimationFrame(frame);
  }

  function startGame() {
    if (state.started) return;
    if (!renderer.ctx) {
      diagnostic.textContent = 'Não foi possível desenhar o jogo neste navegador.';
      diagnostic.hidden = false;
      return;
    }

    reset();
    state.started = true;
    diagnostic.hidden = true;
    startScreen.hidden = true;
    hud.hidden = false;
    controls.hidden = false;

    resize();
    requestAnimationFrame(frame);
  }

  // Inicialização
  reset();
  resize();

  window.addEventListener('resize', resize);
  document.getElementById('start-game').addEventListener('click', startGame);
  document.getElementById('select-don').addEventListener('click', () => selectCharacter(0));
  document.getElementById('select-jaya').addEventListener('click', () => selectCharacter(1));
  document.getElementById('interact').addEventListener('click', interact);

  window.addEventListener('keydown', e => {
    if (!state.started) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    keys.add(e.code);
    if (e.repeat) return;
    if (e.code === 'Digit1') selectCharacter(0);
    if (e.code === 'Digit2') selectCharacter(1);
    if (e.code === 'KeyE') interact();
  });

  window.addEventListener('keyup', e => keys.delete(e.code));
  window.addEventListener('blur', () => {
    keys.clear();
    touch.clear();
  });

  document.querySelectorAll('[data-dir]').forEach(button => {
    const direction = button.dataset.dir;
    button.addEventListener('pointerdown', e => {
      if (!state.started) return;
      e.preventDefault();
      button.setPointerCapture(e.pointerId);
      touch.add(direction);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => {
      button.addEventListener(type, () => touch.delete(direction));
    });
  });
});
