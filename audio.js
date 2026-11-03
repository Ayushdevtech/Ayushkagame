/* Open City - procedural sound (no audio files needed). Made by Ayushdev */
(function (G) {
  'use strict';
  var A = G.audio = { ctx: null, master: null, noise: null, on: true };

  A.init = function () {
    try {
      if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var c = new AC();
      A.ctx = c;
      A.master = c.createGain();
      A.master.gain.value = A.on ? 0.55 : 0;
      A.master.connect(c.destination);
      var n = c.sampleRate, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      A.noise = buf;
      A.engOsc = c.createOscillator(); A.engOsc.type = 'sawtooth'; A.engOsc.frequency.value = 55;
      A.engF = c.createBiquadFilter(); A.engF.type = 'lowpass'; A.engF.frequency.value = 420;
      A.engG = c.createGain(); A.engG.gain.value = 0;
      A.engOsc.connect(A.engF); A.engF.connect(A.engG); A.engG.connect(A.master);
      A.engOsc.start();
    } catch (e) { A.ctx = null; }
  };

  A.setOn = function (v) {
    A.on = v;
    if (A.master) A.master.gain.value = v ? 0.55 : 0;
  };

  A.near = function (x, y) {
    var p = G.S.player;
    if (!p) return 1;
    var d = Math.sqrt((x - p.x) * (x - p.x) + (y - p.y) * (y - p.y));
    return Math.max(0, 1 - d / 1100);
  };

  function burst(vol, dur, freq, q, type, endMul) {
    if (!A.ctx || !A.on || vol < 0.02) return;
    try {
      var c = A.ctx, t = c.currentTime;
      var s = c.createBufferSource(); s.buffer = A.noise;
      var f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.setValueAtTime(freq, t); f.Q.value = q || 0.8;
      if (endMul) f.frequency.exponentialRampToValueAtTime(Math.max(40, freq * endMul), t + dur);
      var g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      s.connect(f); f.connect(g); g.connect(A.master);
      s.start(t, Math.random() * 0.05); s.stop(t + dur + 0.03);
    } catch (e) {}
  }

  function tone(f0, f1, dur, type, vol) {
    if (!A.ctx || !A.on || vol < 0.01) return;
    try {
      var c = A.ctx, t = c.currentTime;
      var o = c.createOscillator(); o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      var g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(A.master);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }

  A.shoot = function (kind, v) {
    v = v === undefined ? 1 : v;
    if (kind === 'shotgun') { burst(0.9 * v, 0.32, 900, 0.7, 'lowpass', 0.3); tone(130, 40, 0.25, 'sawtooth', 0.25 * v); }
    else if (kind === 'smg') { burst(0.5 * v, 0.09, 2200, 0.8, 'bandpass', 0.5); tone(260, 90, 0.06, 'square', 0.08 * v); }
    else { burst(0.65 * v, 0.14, 1800, 0.8, 'bandpass', 0.4); tone(220, 60, 0.1, 'square', 0.1 * v); }
  };
  A.punch = function (v) { v = v === undefined ? 1 : v; tone(150, 50, 0.12, 'sine', 0.5 * v); burst(0.2 * v, 0.06, 700, 0.8, 'lowpass'); };
  A.hit = function () { burst(0.2, 0.07, 2600, 1, 'bandpass'); };
  A.hurt = function () { tone(190, 80, 0.15, 'sawtooth', 0.18); };
  A.boom = function (v) { v = v === undefined ? 1 : v; burst(1.0 * v, 0.9, 320, 0.7, 'lowpass', 0.3); tone(95, 25, 0.7, 'sine', 0.7 * v); };
  A.crash = function (v) { burst(0.45 * v, 0.2, 800, 0.8, 'bandpass', 0.5); tone(110, 50, 0.12, 'square', 0.1 * v); };
  A.horn = function () { tone(440, 436, 0.34, 'square', 0.1); tone(554, 548, 0.34, 'square', 0.08); };
  A.cash = function () { tone(880, 1180, 0.1, 'square', 0.08); setTimeout(function () { tone(1180, 1560, 0.12, 'square', 0.08); }, 90); };
  A.pick = function () { tone(520, 800, 0.1, 'triangle', 0.2); };
  A.click = function () { tone(900, 700, 0.04, 'square', 0.05); };


  /* ---- background music: generated groove (bass, pads, drums), no files ---- */
  var mus = { on: false, next: 0, step: 0, timer: null, gain: null };
  var BASS = [0, 0, 3, 0, 5, 5, 3, 7], CH = [[0, 3, 7], [0, 3, 7], [5, 8, 12], [7, 10, 14]];
  function mtone(f, t, dur, type, vol, dest) {
    var c = A.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  function mnoise(t, dur, vol, hp, dest) {
    var c = A.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = A.noise; f.type = 'highpass'; f.frequency.value = hp; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.02);
  }
  function sched() {
    if (!A.ctx || !mus.on) return;
    var spb = 60 / 104 / 2;                                  /* eighth note */
    while (mus.next < A.ctx.currentTime + 0.4) {
      var t = mus.next, st = mus.step, d = mus.gain, root = 55 * Math.pow(2, 0 / 12);
      var bar = Math.floor(st / 8) % 4, b = BASS[st % 8];
      mtone(root * Math.pow(2, b / 12), t, spb * 0.9, 'sawtooth', 0.16, d);
      if (st % 8 === 0) CH[bar].forEach(function (n) { mtone(root * 4 * Math.pow(2, n / 12), t, spb * 7.5, 'triangle', 0.05, d); });
      if (st % 4 === 0) { mtone(110, t, 0.14, 'sine', 0.5, d); mnoise(t, 0.05, 0.12, 80, d); }
      if (st % 8 === 4) mnoise(t, 0.12, 0.3, 1500, d);
      mnoise(t, 0.03, 0.08, 6500, d);
      if (st % 8 === 6) mtone(root * 8 * Math.pow(2, [0, 3, 7, 10][(st >> 3) % 4] / 12), t, spb * 1.5, 'square', 0.025, d);
      mus.next += spb; mus.step++;
    }
  }
  A.music = function (v) {
    if (!A.ctx) return;
    if (v && !mus.on) {
      if (!mus.gain) { mus.gain = A.ctx.createGain(); mus.gain.gain.value = 0.3; mus.gain.connect(A.master); }
      mus.on = true; mus.next = A.ctx.currentTime + 0.1; mus.step = 0; mus.timer = setInterval(sched, 120);
    } else if (!v && mus.on) { mus.on = false; clearInterval(mus.timer); }
  };

  A.engine = function (active, ratio) {
    if (!A.ctx) return;
    try {
      var t = A.ctx.currentTime;
      var g = active && A.on ? 0.035 + ratio * 0.05 : 0;
      A.engG.gain.setTargetAtTime(g, t, 0.08);
      A.engOsc.frequency.setTargetAtTime(46 + ratio * 150, t, 0.06);
      A.engF.frequency.setTargetAtTime(300 + ratio * 500, t, 0.1);
    } catch (e) {}
  };
})(window.G = window.G || {});
