/* Open City - football on the pitches: kick it with your feet, push it with a car, score in the goals. Made by Ayushdev */
(function (G) {
  'use strict';
  var S = G.S, W = G.world;
  G.balls = [];
  G.initBalls = function () {
    G.balls.length = 0;
    W.pitches.forEach(function (p) { G.balls.push({ x: p.cx, y: p.cy, vx: 0, vy: 0, r: 9, spin: 0, home: p, goalT: 0, score: 0 }); });
  };
  var o = { x: 0, y: 0 };
  function reset(b) { b.x = b.home.cx; b.y = b.home.cy; b.vx = b.vy = 0; b.goalT = 0; }
  G.updateBalls = function (dt) {
    var pl = S.player, I = G.input, i, k, b;
    for (i = 0; i < G.balls.length; i++) {
      b = G.balls[i];
      var dxp = b.x - pl.x, dyp = b.y - pl.y;
      if (dxp * dxp + dyp * dyp > 1400 * 1400) continue;
      if (b.goalT > 0) { b.goalT -= dt; b.vx *= 0.9; b.vy *= 0.9; if (b.goalT <= 0) reset(b); continue; }
      var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (sp > 0) { var ns = Math.max(0, sp - (26 + sp * 0.5) * dt); b.vx *= ns / sp; b.vy *= ns / sp; sp = ns; }
      /* people: dribble and kick */
      var list = S.peds.concat([pl]);
      for (k = 0; k < list.length; k++) {
        var p = list[k];
        if (!p || p.dead || p.far || p.vehicle) continue;
        var dx = b.x - p.x, dy = b.y - p.y, d = Math.sqrt(dx * dx + dy * dy), rad = b.r + p.r + 1;
        if (d >= rad || d < 0.01) continue;
        var nx = dx / d, ny = dy / d, ps = Math.max(70, (p.curSpeed || 0) * 1.25);
        if (p === pl && p.attackT < 0.3) { b.vx = Math.cos(p.angle) * 430; b.vy = Math.sin(p.angle) * 430; G.audio.click(); }
        else if (b.vx * nx + b.vy * ny < ps) { b.vx = nx * ps + b.vx * 0.2; b.vy = ny * ps + b.vy * 0.2; }
        b.x = p.x + nx * rad; b.y = p.y + ny * rad;
      }
      /* vehicles: bump */
      for (k = 0; k < S.cars.length; k++) {
        var v = S.cars[k];
        if (v.sleep || v.wreck) continue;
        var ex = b.x - v.x, ey = b.y - v.y;
        if (ex > v.t.br + 20 || ex < -v.t.br - 20 || ey > v.t.br + 20 || ey < -v.t.br - 20) continue;
        var c = Math.cos(v.angle), s = Math.sin(v.angle), lx = ex * c + ey * s, ly = -ex * s + ey * c;
        var hl = v.t.len / 2 + b.r, hw = v.t.w / 2 + b.r;
        if (Math.abs(lx) < hl && Math.abs(ly) < hw) {
          var px = hl - Math.abs(lx), py = hw - Math.abs(ly), nlx = 0, nly = 0;
          if (px < py) { nlx = lx > 0 ? 1 : -1; lx = nlx * hl; } else { nly = ly > 0 ? 1 : -1; ly = nly * hw; }
          b.x = v.x + lx * c - ly * s; b.y = v.y + lx * s + ly * c;
          var wx = nlx * c - nly * s, wy = nlx * s + nly * c, vs = Math.abs(v.speed) + 40;
          b.vx = wx * vs * 1.25 + (v.vx || 0) * 0.3; b.vy = wy * vs * 1.25 + (v.vy || 0) * 0.3;
          G.audio.click();
        }
      }
      b.x += b.vx * dt; b.y += b.vy * dt;
      /* buildings and trees */
      o.x = b.x; o.y = b.y;
      if (W.resolve(o, b.r) > 0) { var ddx = o.x - b.x, ddy = o.y - b.y; b.x = o.x; b.y = o.y; var dl = Math.sqrt(ddx * ddx + ddy * ddy) || 1, dn = (b.vx * ddx + b.vy * ddy) / dl; if (dn < 0) { b.vx -= 1.6 * dn * ddx / dl; b.vy -= 1.6 * dn * ddy / dl; } }
      b.spin += sp * dt / b.r;
      /* goals */
      var h = b.home;
      if (Math.abs(b.y - h.cy) < 35 && (b.x < h.x - 2 || b.x > h.x + h.w + 2) && Math.abs(b.x - h.cx) < h.w / 2 + 30) {
        b.goalT = 2.2; b.score++; S.money += 250;
        G.toast('GOAL!  +$250', 'good'); G.audio.cash();
      }
      var fx = b.x - h.cx, fy = b.y - h.cy;
      if (fx * fx + fy * fy > 520 * 520) reset(b);
    }
  };
})(window.G = window.G || {});
