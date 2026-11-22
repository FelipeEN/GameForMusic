'use strict';

class MapRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  rect(x, y, w, h, c) {
    this.ctx.fillStyle = c;
    this.ctx.fillRect(x, y, w, h);
  }

  circle(x, y, r, c) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fillStyle = c;
    this.ctx.fill();
  }

  line(x, y, x2, y2, c, width = 1) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = c;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }

  glow(x, y, r, c) {
    const g = this.ctx.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, c);
    g.addColorStop(1, 'transparent');
    this.circle(x, y, r, g);
  }

  onRoad(x, y) {
    return (
      verticalRoads.some(r => x > r.x && x < r.x + r.w) ||
      horizontalRoads.some(r => y > r.y && y < r.y + r.h)
    );
  }

  drawGround() {
    this.rect(0, 0, WORLD_W, WORLD_H, '#373936');
    for (let i = 0; i < 8000; i++) {
      const x = rand(i * 2 + 101) * WORLD_W;
      const y = rand(i * 3 + 220) * WORLD_H;
      this.rect(
        x,
        y,
        rand(i + 44) * 3 + 1,
        rand(i + 72) * 2 + 1,
        i % 3 ? '#786d5b38' : '#101b2455'
      );
    }

    horizontalRoads.forEach(r => this.rect(0, r.y, WORLD_W, r.h, '#202b32'));
    verticalRoads.forEach(r => this.rect(r.x, 0, r.w, WORLD_H, '#202b32'));

    for (let i = 0; i < 1500; i++) {
      const x = rand(i * 9 + 3) * WORLD_W;
      const y = rand(i * 7 + 8) * WORLD_H;
      if (this.onRoad(x, y)) {
        this.rect(
          x,
          y,
          rand(i * 4 + 19) * 12 + 2,
          1 + rand(i * 8) * 3,
          i % 4 ? '#6a858938' : '#11161d66'
        );
      }
    }

    horizontalRoads.forEach(r => {
      for (let x = 34; x < WORLD_W; x += 90) {
        this.rect(x, r.y + r.h / 2, 27, 1, '#b1a18a36');
      }
    });

    verticalRoads.forEach(r => {
      for (let y = 45; y < WORLD_H; y += 88) {
        this.rect(r.x + r.w / 2, y, 2, 25, '#b1a18a30');
      }
    });
  }

  drawAlleys() {
    const ctx = this.ctx;
    alleys.forEach((path, index) => {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const [width, color] of [
        [35, '#101d2390'],
        [29, '#505a59'],
        [23, '#6b7069'],
        [16, '#808075']
      ]) {
        ctx.beginPath();
        path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.stroke();
      }

      path.slice(1).forEach((p, i) => {
        const a = path[i];
        const dx = p[0] - a[0];
        const dy = p[1] - a[1];
        const length = Math.hypot(dx, dy);
        for (let d = 11; d < length - 5; d += 17) {
          const x = a[0] + (dx * d) / length;
          const y = a[1] + (dy * d) / length;
          this.line(x - 3, y + 2, x + 4, y - 1, index % 2 ? '#384a4d77' : '#b69c7755');
        }
      });

      const step = path[Math.floor(path.length / 2)];
      ctx.save();
      ctx.translate(step[0], step[1]);
      ctx.rotate(index % 2 ? -0.37 : 0.24);
      for (let s = -10; s <= 10; s += 5) {
        this.line(s, -11, s, 11, '#d2b3907a', 2);
      }
      ctx.restore();

      path.slice(1, -1).forEach(([x, y], i) => {
        if (i % 2 === 0) {
          this.circle(x + 18, y - 14, 3, '#222a2a');
          this.rect(x + 16, y - 16, 5, 3, '#97846a');
          this.line(x - 20, y - 20, x + 21, y - 17, '#242326');
          this.rect(x - 10, y - 23, 7, 5, '#b57062');
          this.rect(x + 6, y - 21, 9, 4, '#647f97');
        } else {
          this.rect(x - 18, y + 13, 8, 6, '#483e37');
          this.rect(x - 8, y + 15, 6, 4, '#64584b');
          this.line(x + 14, y - 7, x + 14, y + 9, '#302a27', 2);
          this.line(x + 14, y - 7, x + 21, y - 7, '#827063', 2);
        }
      });

      ctx.lineCap = 'butt';
    });
  }

  drawHouse(h) {
    const { x, y, w, h: height, n } = h;
    this.rect(x + 4, y + 5, w, height, '#070d16aa');
    this.rect(x - 2, y - 2, w + 4, height + 4, '#252d33');
    this.rect(x, y, w, height, ['#6b4a4a', '#79564e', '#63474b', '#76564d', '#625251'][n % 5]);

    for (let j = 9; j < height; j += 9) {
      this.line(x + 1, y + j, x + w - 1, y + j, '#332a3188');
    }
    for (let j = 8; j < w; j += 13) {
      this.line(x + j, y + 3, x + j, y + height - 3, '#b78a6839');
    }

    this.rect(x + 3, y + 3, w - 6, height - 6, ['#596168', '#626a70', '#505e67', '#586165', '#66645f'][n % 5]);

    for (let j = 0; j < 11; j++) {
      const px = x + 7 + rand(n * 20 + j) * Math.max(1, w - 15);
      const py = y + 7 + rand(n * 27 + j) * Math.max(1, height - 15);
      this.rect(px, py, 2 + rand(j + n) * 6, 1 + rand(j * 3 + n) * 4, j % 3 ? '#ba9c7558' : '#292b3290');
    }

    if (n % 4 === 0) {
      this.rect(x + 3, y + height * 0.53, w - 6, height * 0.26, '#434a50');
      for (let j = 0; j < 7; j++) {
        this.line(x + 5, y + height * 0.54 + j * 2, x + w - 5, y + height * 0.54 + j * 2, '#bec0b65c');
      }
    }

    if (n % 3 === 0) {
      this.circle(x + 15, y + 15, 11, '#101925');
      this.circle(x + 15, y + 13, 9, '#28729a');
      this.circle(x + 15, y + 13, 6, '#174967');
      this.line(x + 6, y + 9, x + 24, y + 9, '#62a2bb', 2);
    }

    if (n % 4 === 1) {
      this.rect(x + w - 24, y + height - 23, 16, 13, '#362c30');
      this.glow(x + w - 16, y + height - 17, 27, '#ffbd666a');
      this.rect(x + w - 22, y + height - 21, 12, 9, '#f3bc73');
      this.line(x + w - 16, y + height - 21, x + w - 16, y + height - 12, '#704743', 2);
    }

    if (n % 5 === 2) {
      this.rect(x + 7, y + height - 15, 23, 10, '#293542');
      for (let j = 0; j < 3; j++) {
        this.line(x + 7, y + height - 13 + j * 3, x + 30, y + height - 13 + j * 3, '#9a9a90');
      }
    }

    if (n % 7 === 3) {
      for (let j = 0; j < 4; j++) {
        this.rect(x + w - 13, y + height - 11 - j * 6, 13, 5, j % 2 ? '#a49582' : '#736b62');
      }
    }

    if (n % 6 === 2) {
      this.line(x + 5, y + 5, x + w - 5, y + height - 6, '#343034');
      this.rect(x + 13, y + 13, 8, 4, '#c17f78');
      this.rect(x + 27, y + 24, 9, 4, '#b7a78c');
    }

    if (n % 8 === 5) {
      this.rect(x + 7, y + 7, 11, 8, '#503e36');
      this.rect(x + 31, y + 12, 7, 5, '#403a33');
    }

    this.line(x, y, x + w, y, '#c4a08481', 2);
  }

  drawStreets() {
    verticalRoads.forEach(r => {
      for (const x of [r.x - 4, r.x + r.w - 1]) {
        this.line(x, 0, x, WORLD_H, '#b6a08d46', 2);
        for (let y = 12; y < WORLD_H; y += 8) {
          this.circle(x + (x % 3) * 2, y, 1.2, '#b8a08c77');
        }
      }
    });

    horizontalRoads.forEach(r => {
      this.line(0, r.y - 3, WORLD_W, r.y - 3, '#b6a08d45', 2);
      this.line(0, r.y + r.h + 2, WORLD_W, r.y + r.h + 2, '#b6a08d45', 2);
    });

    for (let i = 0; i < 110; i++) {
      const x = rand(i * 23 + 2) * WORLD_W;
      const y = rand(i * 31 + 4) * WORLD_H;
      if (this.onRoad(x, y)) {
        this.line(x, y, x + 12, y - 3, '#090f1788');
        this.line(x + 12, y - 3, x + 21, y + 2, '#090f1788');
      }
    }

    horizontalRoads.forEach(r => {
      for (let x = 28; x < WORLD_W; x += 184) {
        this.rect(x, r.y - 4, 48, 2, '#ac978452');
      }
    });
  }

  drawProps(time) {
    const ctx = this.ctx;
    const poles = [
      [315, 168], [429, 177], [798, 177], [919, 168], [314, 280], [430, 278], [799, 278], [920, 276],
      [315, 555], [429, 552], [799, 552], [919, 555], [315, 681], [920, 681],
      [1197, 177], [1293, 178], [1697, 178], [1803, 177], [1197, 279], [1293, 279], [1697, 279], [1803, 279],
      [1197, 555], [1293, 555], [1697, 555], [1803, 555], [1197, 680], [1293, 680], [1697, 680], [1803, 680],
      [315, 779], [920, 779], [1197, 779], [1293, 779], [1697, 779], [1803, 779],
      [315, 875], [920, 875], [1197, 875], [1293, 875], [1697, 875], [1803, 875],
      [315, 1030], [920, 1030], [1197, 1030], [1293, 1030], [1697, 1030], [1803, 1030]
    ];

    poles.forEach(([x, y], i) => {
      this.glow(x, y, 65, i % 3 === 0 ? '#ffb45648' : '#ffd28e31');
      this.circle(x + 5, y + 7, 5, '#090d16a8');
      this.circle(x, y, 3, '#171c25');
      this.circle(x, y, 1.5, '#f1c88b');
      this.line(x - 5, y, x + 6, y, '#171c25', 2);
    });

    for (let i = 0; i < 7; i++) {
      const y = 118 + i * 150;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < WORLD_W; x += 230) {
        ctx.quadraticCurveTo(x + 115, y + 29, x + 230, y + 11);
      }
      ctx.strokeStyle = '#0b111cba';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    for (let i = 0; i < 175; i++) {
      const x = rand(i * 14 + 5) * WORLD_W;
      const y = rand(i * 17 + 31) * WORLD_H;
      if (!this.onRoad(x, y) && !nearAlley(x, y, 18)) {
        this.rect(x, y, 3 + rand(i * 9) * 6, 2 + rand(i * 8) * 5, i % 4 === 0 ? '#999079' : '#151c22');
      }
    }

    const flicker = 0.6 + 0.4 * Math.sin(time * 0.009);
    [
      [390, 284], [600, 554], [962, 294], [172, 550],
      [1338, 280], [1770, 548], [1910, 780], [1150, 948]
    ].forEach(([x, y]) => {
      this.glow(x, y, 43, 'rgba(255,180,99,' + 0.12 * flicker + ')');
      this.rect(x - 3, y - 3, 6, 6, '#cba06d');
    });
  }

  drawCar(car, time) {
    const ctx = this.ctx;
    const { x, y, police, vertical } = car;

    if (police) {
      const phase = Math.sin(time * 0.011 + x * 3) > 0;
      this.glow(x - 19, y - 9, 94, phase ? '#247cff72' : '#247cff29');
      this.glow(x + 22, y + 12, 94, phase ? '#f23b5830' : '#f23b587a');
    }

    ctx.save();
    ctx.translate(x, y);
    if (vertical) ctx.rotate(Math.PI / 2);

    this.rect(-29, -13, 63, 34, '#070c14ab');
    this.rect(-31, -16, 62, 32, police ? '#d4d8da' : '#514c48');
    this.rect(-14, -15, 23, 30, police ? '#4b6275' : '#373c44');
    this.rect(-18, -12, 5, 24, '#273441');
    this.rect(14, -12, 6, 24, '#273441');
    this.rect(-33, -12, 3, 8, '#ead8a2');
    this.rect(-33, 5, 3, 8, '#ead8a2');
    this.rect(29, -12, 3, 8, '#b34949');
    this.rect(29, 5, 3, 8, '#b34949');
    this.rect(-23, -19, 12, 3, '#151a20');
    this.rect(11, -19, 12, 3, '#151a20');
    this.rect(-23, 16, 12, 3, '#151a20');
    this.rect(11, 16, 12, 3, '#151a20');

    if (police) {
      const phase = Math.sin(time * 0.011 + x * 3) > 0;
      this.rect(-4, -15, 11, 30, '#ae353a');
      this.rect(-6, -4, 4, 8, '#235bb1');
      this.rect(2, -4, 4, 8, '#bd3549');
      this.glow(-5, 0, 55, phase ? '#247cff9c' : '#247cff39');
      this.glow(6, 0, 55, phase ? '#f23b5844' : '#f23b58a3');
      this.rect(-6, -3, 5, 6, phase ? '#a8d6ff' : '#295a9e');
      this.rect(2, -3, 5, 6, phase ? '#8b293a' : '#ffadac');
    }

    ctx.restore();
  }

  drawPerson(p, active, time) {
    const ctx = this.ctx;
    const bob = Math.sin(time * 0.009 + (p.name === 'Don' ? 0 : 2)) * 1.1;

    this.circle(p.x + 2, p.y + 8, 11, '#050b13a0');

    if (active) {
      this.glow(p.x, p.y, 35, '#f9ca512b');
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 7, 13, 7, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffdb65';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    this.circle(p.x, p.y + bob, 7, p.shirt);
    this.circle(p.x, p.y - 7 + bob, 5, p.skin);
    this.rect(p.x - 5, p.y - 13 + bob, 10, 3, '#202029');

    ctx.textAlign = 'center';
    ctx.font = 'bold 11px "DM Sans", sans-serif';
    ctx.fillStyle = '#07121c';
    ctx.fillText(p.name, p.x + 1, p.y - 20);
    ctx.fillStyle = active ? '#ffe2a0' : '#f3e9d8';
    ctx.fillText(p.name, p.x, p.y - 21);
  }

  render(state, time) {
    const { ctx } = this;
    const { viewW, viewH, scale, camera, people, points, selected } = state;
    if (!ctx || !viewW || !viewH) return;

    this.rect(0, 0, viewW, viewH, '#101b23');

    const visibleW = viewW / scale;
    const visibleH = viewH / scale;
    let cx = Math.max(visibleW / 2, Math.min(WORLD_W - visibleW / 2, camera.x));
    let cy = Math.max(visibleH / 2, Math.min(WORLD_H - visibleH / 2, camera.y));
    if (visibleW >= WORLD_W) cx = WORLD_W / 2;
    if (visibleH >= WORLD_H) cy = WORLD_H / 2;

    ctx.save();
    ctx.translate(viewW / 2 - cx * scale, viewH / 2 - cy * scale);
    ctx.scale(scale, scale);

    this.drawGround();
    this.drawAlleys();
    houses.forEach(h => this.drawHouse(h));
    this.drawStreets();
    this.drawProps(time);
    cars.forEach(car => this.drawCar(car, time));

    points.forEach(point => {
      if (point.type === 'lamp') {
        this.glow(point.x, point.y, point.active ? 88 : 32, point.active ? '#ffc9668a' : '#ffc96638');
        this.circle(point.x, point.y + 3, 4, '#151d22');
        this.rect(point.x - 1.5, point.y - 13, 3, 15, '#8c8780');
        this.circle(point.x, point.y - 14, point.active ? 6 : 4, point.active ? '#ffdf85' : '#d6b57c');
      } else {
        this.glow(point.x, point.y, 23, '#80d5c93d');
        this.circle(point.x, point.y, 4 + Math.sin(time * 0.004), '#94deca');
      }
    });

    people.forEach((p, i) => this.drawPerson(p, i === selected, time));
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      viewW / 2,
      viewH / 2,
      viewW * 0.12,
      viewW / 2,
      viewH / 2,
      Math.max(viewW, viewH) * 0.76
    );
    vignette.addColorStop(0, '#07101a00');
    vignette.addColorStop(1, '#0509169c');
    this.rect(0, 0, viewW, viewH, vignette);
  }
}
