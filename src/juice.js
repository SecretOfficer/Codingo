/* Game feel: synthesised sound, particles, floating numbers, screen shake.
   No audio or image files ship with the app — every sound is generated with an
   oscillator at play time and every effect is drawn on one overlay canvas. */

let ctx = null;
let muted = false;
let master = 0.5;

/* ---------------------------------------------------------------- audio */

function audio() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

export function setMuted(value) { muted = !!value; }
export function isMuted() { return muted; }
export function setVolume(v) { master = Math.max(0, Math.min(1, v)); }

/** One shaped note. Everything else is built out of these. */
function tone(freq, start, dur, opts) {
  const a = audio();
  if (!a || muted) return;
  const o = a.createOscillator();
  const g = a.createGain();
  const t = a.currentTime + start;
  const peak = (opts && opts.gain !== undefined ? opts.gain : 0.22) * master;

  o.type = (opts && opts.type) || 'sine';
  o.frequency.setValueAtTime(freq, t);
  if (opts && opts.slideTo) o.frequency.exponentialRampToValueAtTime(opts.slideTo, t + dur);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.02, dur * 0.3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(start, dur, gain) {
  const a = audio();
  if (!a || muted) return;
  const frames = Math.floor(a.sampleRate * dur);
  const buffer = a.createBuffer(1, frames, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = a.createBufferSource();
  const g = a.createGain();
  g.gain.value = (gain || 0.12) * master;
  src.buffer = buffer;
  src.connect(g);
  g.connect(a.destination);
  src.start(a.currentTime + start);
}

const SOUNDS = {
  click: () => tone(420, 0, 0.05, { type: 'triangle', gain: 0.08 }),
  correct: () => { tone(660, 0, 0.09, { type: 'triangle' }); tone(880, 0.07, 0.14, { type: 'triangle' }); },
  wrong: () => { tone(200, 0, 0.16, { type: 'sawtooth', gain: 0.16, slideTo: 110 }); noise(0, 0.12, 0.06); },
  combo: (n) => {
    const base = 520 + Math.min(6, n) * 70;
    tone(base, 0, 0.07, { type: 'square', gain: 0.1 });
    tone(base * 1.5, 0.06, 0.1, { type: 'square', gain: 0.09 });
  },
  complete: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.26, { type: 'triangle' })),
  badge: () => [784, 988, 1318].forEach((f, i) => tone(f, i * 0.08, 0.3, { type: 'sine', gain: 0.18 })),
  victory: () => [523, 523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.3, { type: 'square', gain: 0.14 })),
  defeat: () => [392, 349, 294, 233].forEach((f, i) => tone(f, i * 0.13, 0.32, { type: 'sawtooth', gain: 0.1 })),
  countdown: () => tone(440, 0, 0.12, { type: 'square', gain: 0.12 }),
  go: () => { tone(880, 0, 0.28, { type: 'square', gain: 0.16 }); tone(1320, 0.05, 0.3, { type: 'square', gain: 0.1 }); },
  heart: () => tone(300, 0, 0.22, { type: 'sine', gain: 0.14, slideTo: 150 }),
  tick: () => tone(1200, 0, 0.03, { type: 'square', gain: 0.05 })
};

export function play(name, arg) {
  const fn = SOUNDS[name];
  if (!fn) return;
  try { fn(arg); } catch (err) { /* audio is decoration, never fatal */ }
}

/* ------------------------------------------------------------ particles */

let canvas = null;
let g2 = null;
let parts = [];
let raf = 0;
let reduced = false;

export function setReducedMotion(value) { reduced = !!value; }

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.id = 'fx-layer';
  document.body.appendChild(canvas);
  g2 = canvas.getContext('2d');
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);
}

function loop() {
  raf = 0;
  if (!parts.length) { g2.clearRect(0, 0, canvas.width, canvas.height); return; }
  g2.clearRect(0, 0, canvas.width, canvas.height);

  parts = parts.filter((p) => {
    p.life -= 1;
    p.vy += p.gravity;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.spin += p.spinRate;
    if (p.life <= 0) return false;

    g2.save();
    g2.globalAlpha = Math.max(0, Math.min(1, p.life / p.fade));
    g2.translate(p.x, p.y);
    g2.rotate(p.spin);
    g2.fillStyle = p.colour;
    if (p.shape === 'circle') {
      g2.beginPath();
      g2.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      g2.fill();
    } else {
      g2.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
    }
    g2.restore();
    return true;
  });

  raf = requestAnimationFrame(loop);
}

const PALETTE = ['#58cc02', '#1cb0f6', '#ffc800', '#ce82ff', '#ff4b4b', '#2ec4b6'];

/**
 * @param {number} x screen x
 * @param {number} y screen y
 * @param {object} opts count, spread, colours, gravity, up
 */
export function burst(x, y, opts) {
  if (reduced) return;
  ensureCanvas();
  const o = opts || {};
  const count = o.count || 24;
  const colours = o.colours || PALETTE;
  for (let i = 0; i < count; i++) {
    const angle = o.up
      ? -Math.PI / 2 + (Math.random() - 0.5) * (o.spread || 1.6)
      : Math.random() * Math.PI * 2;
    const speed = (o.speed || 5) * (0.4 + Math.random());
    parts.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: o.gravity === undefined ? 0.16 : o.gravity,
      size: 5 + Math.random() * 7,
      colour: colours[Math.floor(Math.random() * colours.length)],
      life: 40 + Math.random() * 30,
      fade: 45,
      spin: Math.random() * Math.PI,
      spinRate: (Math.random() - 0.5) * 0.3,
      shape: Math.random() < 0.35 ? 'circle' : 'rect'
    });
  }
  if (!raf) raf = requestAnimationFrame(loop);
}

/** Confetti rain from the top of the window, for the big moments. */
export function confetti(strength) {
  if (reduced) return;
  ensureCanvas();
  const count = strength || 90;
  for (let i = 0; i < count; i++) {
    parts.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 2.4,
      vy: 2 + Math.random() * 3.5,
      gravity: 0.04,
      size: 6 + Math.random() * 8,
      colour: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      life: 150 + Math.random() * 90,
      fade: 90,
      spin: Math.random() * Math.PI,
      spinRate: (Math.random() - 0.5) * 0.35,
      shape: Math.random() < 0.3 ? 'circle' : 'rect'
    });
  }
  if (!raf) raf = requestAnimationFrame(loop);
}

/** Burst centred on an element, which is what most callers actually want. */
export function burstAt(el, opts) {
  if (!el || reduced) return;
  const box = el.getBoundingClientRect();
  burst(box.left + box.width / 2, box.top + box.height / 2, opts);
}

/* -------------------------------------------------- floats and shakes */

/** A number that flies from an element up towards the top bar. */
export function floatText(text, fromEl, kind) {
  if (reduced || !fromEl) return;
  const box = fromEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'float-text ' + (kind || '');
  el.textContent = text;
  el.style.left = (box.left + box.width / 2) + 'px';
  el.style.top = (box.top) + 'px';
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('go'));
  setTimeout(() => el.remove(), 1100);
}

export function shake(intensity) {
  if (reduced) return;
  document.body.classList.remove('shake-hard', 'shake-soft');
  void document.body.offsetWidth;
  document.body.classList.add(intensity === 'hard' ? 'shake-hard' : 'shake-soft');
  setTimeout(() => document.body.classList.remove('shake-hard', 'shake-soft'), 420);
}

/** Full-screen tinted flash, used for a wrong answer or a knockout blow. */
export function flash(colour) {
  if (reduced) return;
  const el = document.createElement('div');
  el.className = 'fx-flash';
  el.style.background = colour;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('go'));
  setTimeout(() => el.remove(), 420);
}

/** A big word that slams into the middle of the screen: 3, 2, 1, FIGHT. */
export function slam(text, colour) {
  const el = document.createElement('div');
  el.className = 'fx-slam';
  el.textContent = text;
  if (colour) el.style.color = colour;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('go'));
  setTimeout(() => el.remove(), 700);
}
