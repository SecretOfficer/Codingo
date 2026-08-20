/* Virtual labs: parameter-driven simulations with auto-checked challenges.
   Each lab declares its controls, a derive() that does the real physics/chemistry,
   a draw() for the canvas, and challenges that are checked live as you experiment. */

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round = (v, n) => Number(v.toFixed(n));

/* ------------------------------------------------------------- circuit lab */

const circuitLab = {
  id: 'circuit',
  title: 'Circuit Bench',
  subject: 'physics',
  color: '#ffc800',
  icon: 'AMP',
  blurb: 'Wire two resistors in series or parallel and watch Ohm law decide the current.',
  concepts: ['Ohm law', 'series and parallel', 'electrical power'],
  params: [
    { key: 'mode', label: 'Wiring', type: 'choice', options: ['series', 'parallel'], value: 'series' },
    { key: 'v', label: 'Battery', type: 'range', min: 1, max: 24, step: 1, value: 12, unit: 'V' },
    { key: 'r1', label: 'Resistor 1', type: 'range', min: 1, max: 60, step: 1, value: 10, unit: 'ohm' },
    { key: 'r2', label: 'Resistor 2', type: 'range', min: 1, max: 60, step: 1, value: 20, unit: 'ohm' }
  ],
  derive(s) {
    const rt = s.mode === 'series' ? s.r1 + s.r2 : (s.r1 * s.r2) / (s.r1 + s.r2);
    const i = s.v / rt;
    const i1 = s.mode === 'series' ? i : s.v / s.r1;
    const i2 = s.mode === 'series' ? i : s.v / s.r2;
    const v1 = s.mode === 'series' ? i * s.r1 : s.v;
    const v2 = s.mode === 'series' ? i * s.r2 : s.v;
    return { rt, i, i1, i2, v1, v2, p: s.v * i, p1: v1 * i1, p2: v2 * i2 };
  },
  readout(s, d) {
    return [
      { label: 'Total resistance', value: round(d.rt, 2) + ' ohm' },
      { label: 'Total current', value: round(d.i, 3) + ' A' },
      { label: 'V across R1', value: round(d.v1, 2) + ' V' },
      { label: 'V across R2', value: round(d.v2, 2) + ' V' },
      { label: 'Power drawn', value: round(d.p, 2) + ' W' }
    ];
  },
  draw(g, w, h, s, d) {
    g.clearRect(0, 0, w, h);
    const wire = '#7f8ea8';
    g.lineWidth = 3;
    g.strokeStyle = wire;
    g.font = '13px Consolas, monospace';
    g.textAlign = 'center';

    const L = 70, R = w - 70, T = 70, B = h - 60;

    // battery on the left rail
    g.beginPath();
    g.moveTo(L, T); g.lineTo(R, T);
    g.moveTo(L, B); g.lineTo(R, B);
    g.moveTo(L, T); g.lineTo(L, (T + B) / 2 - 18);
    g.moveTo(L, (T + B) / 2 + 18); g.lineTo(L, B);
    g.stroke();

    g.strokeStyle = '#ffc800';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(L - 16, (T + B) / 2 - 18); g.lineTo(L + 16, (T + B) / 2 - 18);
    g.moveTo(L - 8, (T + B) / 2 - 6); g.lineTo(L + 8, (T + B) / 2 - 6);
    g.moveTo(L - 16, (T + B) / 2 + 6); g.lineTo(L + 16, (T + B) / 2 + 6);
    g.moveTo(L - 8, (T + B) / 2 + 18); g.lineTo(L + 8, (T + B) / 2 + 18);
    g.stroke();
    g.fillStyle = '#ffc800';
    g.fillText(s.v + ' V', L, (T + B) / 2 + 44);

    const resistor = (x, y, label, glow) => {
      g.strokeStyle = '#eaf0fb';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x - 40, y);
      for (let k = 0; k < 6; k++) g.lineTo(x - 30 + k * 12, y + (k % 2 ? 11 : -11));
      g.lineTo(x + 40, y);
      g.stroke();
      g.fillStyle = 'rgba(255,200,0,' + clamp(glow, 0, 0.85) + ')';
      g.fillRect(x - 44, y - 18, 88, 36);
      g.fillStyle = '#8d9bb5';
      g.fillText(label, x, y + 34);
    };

    if (s.mode === 'series') {
      g.strokeStyle = wire;
      g.beginPath(); g.moveTo(L, T); g.lineTo(R, T); g.stroke();
      resistor(w * 0.42, T, s.r1 + ' ohm  ' + round(d.p1, 2) + ' W', d.p1 / 12);
      resistor(w * 0.72, T, s.r2 + ' ohm  ' + round(d.p2, 2) + ' W', d.p2 / 12);
    } else {
      const midX = w * 0.6;
      g.strokeStyle = wire;
      g.beginPath();
      g.moveTo(midX, T); g.lineTo(midX, B);
      g.stroke();
      resistor(midX, T, s.r1 + ' ohm  ' + round(d.p1, 2) + ' W', d.p1 / 12);
      resistor(midX, B, s.r2 + ' ohm  ' + round(d.p2, 2) + ' W', d.p2 / 12);
    }

    // moving charge dots, faster with more current
    const t = (Date.now() / 900) % 1;
    const n = 14;
    g.fillStyle = '#1cb0f6';
    for (let k = 0; k < n; k++) {
      const f = ((k / n) + t * clamp(d.i, 0.05, 4)) % 1;
      g.beginPath();
      g.arc(L + f * (R - L), B, 4, 0, Math.PI * 2);
      g.fill();
    }

    g.fillStyle = '#8d9bb5';
    g.textAlign = 'left';
    g.fillText(s.mode.toUpperCase() + '  |  I = ' + round(d.i, 3) + ' A', 14, h - 16);
  },
  challenges: [
    { id: 'c1', text: 'Get the total current between 0.9 A and 1.1 A', check: (s, d) => d.i >= 0.9 && d.i <= 1.1 },
    { id: 'c2', text: 'Wire it so the total resistance is below either single resistor', check: (s, d) => d.rt < Math.min(s.r1, s.r2) - 0.01 },
    { id: 'c3', text: 'Make R1 and R2 drop equal voltages in series', check: (s, d) => s.mode === 'series' && Math.abs(d.v1 - d.v2) < 0.05 },
    { id: 'c4', text: 'Draw more than 20 W from the battery', check: (s, d) => d.p > 20 }
  ]
};

/* ---------------------------------------------------------- projectile lab */

const projectileLab = {
  id: 'projectile',
  title: 'Projectile Range',
  subject: 'physics',
  color: '#ff9600',
  icon: 'ARC',
  blurb: 'Launch a ball, watch the parabola, and find the angle that carries it furthest.',
  concepts: ['projectile motion', 'gravity', 'vectors'],
  params: [
    { key: 'v', label: 'Launch speed', type: 'range', min: 5, max: 40, step: 1, value: 20, unit: 'm/s' },
    { key: 'angle', label: 'Angle', type: 'range', min: 5, max: 85, step: 1, value: 40, unit: 'deg' },
    { key: 'body', label: 'World', type: 'choice', options: ['Earth 9.8', 'Moon 1.6', 'Mars 3.7'], value: 'Earth 9.8' }
  ],
  derive(s) {
    const g = Number(s.body.split(' ')[1]);
    const rad = (s.angle * Math.PI) / 180;
    const range = (s.v * s.v * Math.sin(2 * rad)) / g;
    const peak = (s.v * s.v * Math.sin(rad) * Math.sin(rad)) / (2 * g);
    const flight = (2 * s.v * Math.sin(rad)) / g;
    return { g, range, peak, flight, target: 45, hit: Math.abs(range - 45) <= 1 };
  },
  readout(s, d) {
    return [
      { label: 'Gravity', value: d.g + ' m/s^2' },
      { label: 'Range', value: round(d.range, 2) + ' m' },
      { label: 'Peak height', value: round(d.peak, 2) + ' m' },
      { label: 'Time of flight', value: round(d.flight, 2) + ' s' },
      { label: 'Target at', value: d.target + ' m' }
    ];
  },
  draw(g2, w, h, s, d) {
    g2.clearRect(0, 0, w, h);
    const ground = h - 40;
    const spanX = Math.max(d.range, d.target) * 1.15 + 5;
    const spanY = Math.max(d.peak, 5) * 1.35;
    const sx = (x) => 40 + (x / spanX) * (w - 70);
    const sy = (y) => ground - (y / spanY) * (ground - 30);

    g2.strokeStyle = '#2a3448';
    g2.lineWidth = 2;
    g2.beginPath(); g2.moveTo(30, ground); g2.lineTo(w - 15, ground); g2.stroke();

    // target zone
    g2.fillStyle = d.hit ? 'rgba(88,204,2,.35)' : 'rgba(255,75,75,.22)';
    g2.fillRect(sx(d.target - 1), ground - 10, Math.max(6, sx(d.target + 1) - sx(d.target - 1)), 10);
    g2.fillStyle = '#8d9bb5';
    g2.font = '12px Consolas, monospace';
    g2.textAlign = 'center';
    g2.fillText('target', sx(d.target), ground + 20);

    // trajectory
    const rad = (s.angle * Math.PI) / 180;
    g2.strokeStyle = '#ff9600';
    g2.lineWidth = 3;
    g2.beginPath();
    for (let k = 0; k <= 80; k++) {
      const t = (k / 80) * d.flight;
      const x = s.v * Math.cos(rad) * t;
      const y = s.v * Math.sin(rad) * t - 0.5 * d.g * t * t;
      if (k === 0) g2.moveTo(sx(x), sy(Math.max(0, y)));
      else g2.lineTo(sx(x), sy(Math.max(0, y)));
    }
    g2.stroke();

    // animated ball
    const t = ((Date.now() / 1000) % d.flight);
    const bx = s.v * Math.cos(rad) * t;
    const by = Math.max(0, s.v * Math.sin(rad) * t - 0.5 * d.g * t * t);
    g2.fillStyle = '#eaf0fb';
    g2.beginPath(); g2.arc(sx(bx), sy(by), 6, 0, Math.PI * 2); g2.fill();

    // launch vector
    g2.strokeStyle = '#1cb0f6';
    g2.lineWidth = 2;
    g2.beginPath();
    g2.moveTo(sx(0), sy(0));
    g2.lineTo(sx(0) + Math.cos(rad) * 46, sy(0) - Math.sin(rad) * 46);
    g2.stroke();

    g2.textAlign = 'left';
    g2.fillStyle = '#8d9bb5';
    g2.fillText('range ' + round(d.range, 1) + ' m', 14, 22);
  },
  challenges: [
    { id: 'c1', text: 'Land the ball within 1 m of the 45 m target', check: (s, d) => d.hit },
    { id: 'c2', text: 'Find the angle that gives the maximum range on Earth', check: (s) => s.body.startsWith('Earth') && s.angle === 45 },
    { id: 'c3', text: 'Reach the target on the Moon instead', check: (s, d) => s.body.startsWith('Moon') && d.hit },
    { id: 'c4', text: 'Get a peak height above 20 m', check: (s, d) => d.peak > 20 }
  ]
};

/* ------------------------------------------------------------ titration lab */

const titrationLab = {
  id: 'titration',
  title: 'Titration Bench',
  subject: 'chem',
  color: '#ce82ff',
  icon: 'pH',
  blurb: 'Add alkali to 50 mL of acid drop by drop and watch the pH curve turn over.',
  concepts: ['pH scale', 'neutralisation', 'concentration'],
  params: [
    { key: 'ca', label: 'Acid concentration', type: 'range', min: 0.02, max: 0.2, step: 0.01, value: 0.1, unit: 'M' },
    { key: 'cb', label: 'Alkali concentration', type: 'range', min: 0.02, max: 0.2, step: 0.01, value: 0.1, unit: 'M' },
    { key: 'vb', label: 'Alkali added', type: 'range', min: 0, max: 100, step: 1, value: 0, unit: 'mL' }
  ],
  derive(s) {
    const va = 0.05;                      // 50 mL of acid in the flask
    const na = s.ca * va;
    const nb = s.cb * (s.vb / 1000);
    const total = va + s.vb / 1000;
    let ph;
    if (Math.abs(na - nb) < 1e-9) ph = 7;
    else if (na > nb) ph = clamp(-Math.log10((na - nb) / total), 0, 14);
    else ph = clamp(14 + Math.log10((nb - na) / total), 0, 14);
    const equivalence = (na / s.cb) * 1000;
    return { ph, na, nb, total, equivalence, neutral: Math.abs(ph - 7) < 0.3 };
  },
  readout(s, d) {
    return [
      { label: 'pH', value: round(d.ph, 2) },
      { label: 'State', value: d.ph < 6.7 ? 'acidic' : (d.ph > 7.3 ? 'alkaline' : 'neutral') },
      { label: 'Moles of acid', value: round(d.na * 1000, 2) + ' mmol' },
      { label: 'Moles of alkali', value: round(d.nb * 1000, 2) + ' mmol' },
      { label: 'Equivalence at', value: round(d.equivalence, 1) + ' mL' }
    ];
  },
  phColor(ph) {
    if (ph < 3) return '#ff4b4b';
    if (ph < 6) return '#ff9600';
    if (ph < 6.8) return '#ffc800';
    if (ph <= 7.2) return '#58cc02';
    if (ph < 10) return '#1cb0f6';
    return '#a560ff';
  },
  draw(g, w, h, s, d) {
    g.clearRect(0, 0, w, h);
    const self = titrationLab;

    // burette
    g.fillStyle = '#2a3448';
    g.fillRect(80, 12, 16, 120);
    g.fillStyle = '#1cb0f6';
    const fill = clamp(1 - s.vb / 100, 0, 1);
    g.fillRect(80, 12 + 120 * (1 - fill), 16, 120 * fill);
    g.fillStyle = '#8d9bb5';
    g.font = '12px Consolas, monospace';
    g.textAlign = 'left';
    g.fillText(s.vb + ' mL added', 104, 26);

    // falling drop
    if (s.vb > 0) {
      const t = (Date.now() / 700) % 1;
      g.fillStyle = '#1cb0f6';
      g.beginPath();
      g.arc(88, 136 + t * 46, 4, 0, Math.PI * 2);
      g.fill();
    }

    // beaker
    const bx = 52, by = 190, bw = 76, bh = 92;
    g.strokeStyle = '#7f8ea8';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(bx, by); g.lineTo(bx, by + bh); g.lineTo(bx + bw, by + bh); g.lineTo(bx + bw, by);
    g.stroke();
    const liquid = clamp(0.45 + s.vb / 260, 0, 0.92);
    g.fillStyle = self.phColor(d.ph);
    g.globalAlpha = 0.75;
    g.fillRect(bx + 2, by + bh - bh * liquid, bw - 4, bh * liquid - 2);
    g.globalAlpha = 1;
    g.fillStyle = '#eaf0fb';
    g.textAlign = 'center';
    g.font = 'bold 15px Consolas, monospace';
    g.fillText('pH ' + round(d.ph, 2), bx + bw / 2, by + bh + 24);

    // titration curve
    const gx = 200, gy = 30, gw = w - gx - 30, gh = h - 90;
    g.strokeStyle = '#2a3448';
    g.lineWidth = 2;
    g.strokeRect(gx, gy, gw, gh);
    g.fillStyle = '#8d9bb5';
    g.font = '11px Consolas, monospace';
    g.textAlign = 'right';
    [0, 7, 14].forEach((p) => {
      const y = gy + gh - (p / 14) * gh;
      g.fillText(String(p), gx - 6, y + 4);
      g.strokeStyle = p === 7 ? '#3b4a66' : '#1d2537';
      g.beginPath(); g.moveTo(gx, y); g.lineTo(gx + gw, y); g.stroke();
    });

    g.strokeStyle = '#ce82ff';
    g.lineWidth = 3;
    g.beginPath();
    for (let k = 0; k <= 100; k++) {
      const ph = titrationLab.derive({ ca: s.ca, cb: s.cb, vb: k }).ph;
      const x = gx + (k / 100) * gw;
      const y = gy + gh - (ph / 14) * gh;
      if (k === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();

    const px = gx + (s.vb / 100) * gw;
    const py = gy + gh - (d.ph / 14) * gh;
    g.fillStyle = self.phColor(d.ph);
    g.beginPath(); g.arc(px, py, 6, 0, Math.PI * 2); g.fill();

    g.fillStyle = '#8d9bb5';
    g.textAlign = 'center';
    g.fillText('alkali added (mL)', gx + gw / 2, gy + gh + 22);
  },
  challenges: [
    { id: 'c1', text: 'Neutralise the acid: reach pH 7 (within 0.3)', check: (s, d) => d.neutral && s.vb > 0 },
    { id: 'c2', text: 'Make the flask strongly acidic, below pH 2', check: (s, d) => d.ph < 2 },
    { id: 'c3', text: 'Push it past pH 12', check: (s, d) => d.ph > 12 },
    { id: 'c4', text: 'Neutralise using less than 30 mL of alkali', check: (s, d) => d.neutral && s.vb > 0 && s.vb < 30 }
  ]
};

/* -------------------------------------------------------------- graph lab */

const grapherLab = {
  id: 'grapher',
  title: 'Quadratic Grapher',
  subject: 'math',
  color: '#1cb0f6',
  icon: 'f(x)',
  blurb: 'Bend a parabola with its coefficients and match the mystery curve.',
  concepts: ['quadratics', 'roots', 'vertex form'],
  params: [
    { key: 'a', label: 'a (x squared)', type: 'range', min: -3, max: 3, step: 0.1, value: 1 },
    { key: 'b', label: 'b (x)', type: 'range', min: -6, max: 6, step: 0.1, value: 0 },
    { key: 'c', label: 'c (constant)', type: 'range', min: -8, max: 8, step: 0.1, value: 0 }
  ],
  target: { a: 1, b: -2, c: -3 },
  derive(s) {
    const disc = s.b * s.b - 4 * s.a * s.c;
    const vx = s.a === 0 ? 0 : -s.b / (2 * s.a);
    const vy = s.a * vx * vx + s.b * vx + s.c;
    const roots = s.a === 0 ? [] : (disc < 0 ? [] : [
      (-s.b - Math.sqrt(disc)) / (2 * s.a),
      (-s.b + Math.sqrt(disc)) / (2 * s.a)
    ]);
    const t = grapherLab.target;
    const matched = Math.abs(s.a - t.a) < 0.11 && Math.abs(s.b - t.b) < 0.11 && Math.abs(s.c - t.c) < 0.11;
    return { disc, vx, vy, roots, matched };
  },
  readout(s, d) {
    return [
      { label: 'Equation', value: 'y = ' + round(s.a, 1) + 'x^2 + ' + round(s.b, 1) + 'x + ' + round(s.c, 1) },
      { label: 'Discriminant', value: round(d.disc, 2) },
      { label: 'Roots', value: d.roots.length ? d.roots.map((r) => round(r, 2)).join(' and ') : 'none (does not cross x)' },
      { label: 'Vertex', value: '(' + round(d.vx, 2) + ', ' + round(d.vy, 2) + ')' },
      { label: 'Opens', value: s.a === 0 ? 'straight line' : (s.a > 0 ? 'upward' : 'downward') }
    ];
  },
  draw(g, w, h, s, d) {
    g.clearRect(0, 0, w, h);
    const spanX = 8, spanY = 10;
    const sx = (x) => w / 2 + (x / spanX) * (w / 2 - 20);
    const sy = (y) => h / 2 - (y / spanY) * (h / 2 - 20);

    g.strokeStyle = '#1d2537';
    g.lineWidth = 1;
    for (let x = -spanX; x <= spanX; x++) {
      g.beginPath(); g.moveTo(sx(x), 0); g.lineTo(sx(x), h); g.stroke();
    }
    for (let y = -spanY; y <= spanY; y += 2) {
      g.beginPath(); g.moveTo(0, sy(y)); g.lineTo(w, sy(y)); g.stroke();
    }
    g.strokeStyle = '#3b4a66';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, sy(0)); g.lineTo(w, sy(0)); g.stroke();
    g.beginPath(); g.moveTo(sx(0), 0); g.lineTo(sx(0), h); g.stroke();

    const plot = (a, b, c, colour, width) => {
      g.strokeStyle = colour;
      g.lineWidth = width;
      g.beginPath();
      let started = false;
      for (let px = 0; px <= w; px += 2) {
        const x = ((px - w / 2) / (w / 2 - 20)) * spanX;
        const y = a * x * x + b * x + c;
        const py = sy(y);
        if (py < -400 || py > h + 400) { started = false; continue; }
        if (!started) { g.moveTo(px, py); started = true; } else g.lineTo(px, py);
      }
      g.stroke();
    };

    const t = grapherLab.target;
    plot(t.a, t.b, t.c, 'rgba(206,130,255,.45)', 6);
    plot(s.a, s.b, s.c, d.matched ? '#58cc02' : '#1cb0f6', 3);

    g.fillStyle = '#ffc800';
    d.roots.forEach((r) => {
      g.beginPath(); g.arc(sx(r), sy(0), 5, 0, Math.PI * 2); g.fill();
    });
    g.fillStyle = '#ff4b4b';
    g.beginPath(); g.arc(sx(d.vx), sy(d.vy), 5, 0, Math.PI * 2); g.fill();

    g.fillStyle = '#8d9bb5';
    g.font = '12px Consolas, monospace';
    g.textAlign = 'left';
    g.fillText('faint curve = mystery target', 12, 20);
  },
  challenges: [
    { id: 'c1', text: 'Match the mystery curve exactly', check: (s, d) => d.matched },
    { id: 'c2', text: 'Make a parabola that never crosses the x axis', check: (s, d) => s.a !== 0 && d.disc < 0 },
    { id: 'c3', text: 'Make the curve touch the x axis exactly once', check: (s, d) => s.a !== 0 && Math.abs(d.disc) < 0.05 },
    { id: 'c4', text: 'Put the vertex below y = -5 with the curve opening upward', check: (s, d) => s.a > 0 && d.vy < -5 }
  ]
};

/* ------------------------------------------------------------ genetics lab */

const punnettLab = {
  id: 'punnett',
  title: 'Punnett Square',
  subject: 'bio',
  color: '#2ec4b6',
  icon: 'DNA',
  blurb: 'Cross two parents and read the genotype and phenotype ratios off the grid.',
  concepts: ['alleles', 'dominant and recessive', 'inheritance ratios'],
  params: [
    { key: 'p1', label: 'Parent 1', type: 'choice', options: ['BB', 'Bb', 'bb'], value: 'Bb' },
    { key: 'p2', label: 'Parent 2', type: 'choice', options: ['BB', 'Bb', 'bb'], value: 'Bb' }
  ],
  derive(s) {
    const a = s.p1.split('');
    const b = s.p2.split('');
    const cells = [];
    a.forEach((x) => b.forEach((y) => {
      const pair = [x, y].sort((m, n) => (m === n ? 0 : (m === m.toUpperCase() ? -1 : 1))).join('');
      cells.push(pair);
    }));
    const counts = {};
    cells.forEach((c) => { counts[c] = (counts[c] || 0) + 1; });
    const recessive = (counts.bb || 0) / cells.length * 100;
    const dominantPheno = 100 - recessive;
    return { cells, counts, recessive, dominantPheno, a, b };
  },
  readout(s, d) {
    const geno = Object.keys(d.counts).sort().map((k) => k + ' ' + (d.counts[k] / d.cells.length * 100) + '%').join('   ');
    return [
      { label: 'Cross', value: s.p1 + ' x ' + s.p2 },
      { label: 'Genotypes', value: geno },
      { label: 'Dominant phenotype', value: round(d.dominantPheno, 1) + '%' },
      { label: 'Recessive phenotype', value: round(d.recessive, 1) + '%' },
      { label: 'Carriers (Bb)', value: round((d.counts.Bb || 0) / d.cells.length * 100, 1) + '%' }
    ];
  },
  draw(g, w, h, s, d) {
    g.clearRect(0, 0, w, h);
    const size = Math.min(w, h) - 90;
    const ox = (w - size) / 2 + 20;
    const oy = 50;
    const cell = size / 2;

    g.font = 'bold 20px Consolas, monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';

    d.b.forEach((letter, i) => {
      g.fillStyle = '#1cb0f6';
      g.fillText(letter, ox + cell * i + cell / 2, oy - 22);
    });
    d.a.forEach((letter, i) => {
      g.fillStyle = '#ff9600';
      g.fillText(letter, ox - 26, oy + cell * i + cell / 2);
    });

    d.cells.forEach((pair, idx) => {
      const r = Math.floor(idx / 2), c = idx % 2;
      const x = ox + c * cell, y = oy + r * cell;
      const recessive = pair === 'bb';
      g.fillStyle = recessive ? 'rgba(255,75,75,.18)' : 'rgba(46,196,182,.18)';
      g.fillRect(x, y, cell - 4, cell - 4);
      g.strokeStyle = '#2a3448';
      g.lineWidth = 2;
      g.strokeRect(x, y, cell - 4, cell - 4);
      g.fillStyle = recessive ? '#ff4b4b' : '#eaf0fb';
      g.fillText(pair, x + (cell - 4) / 2, y + (cell - 4) / 2);
    });

    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    g.font = '13px Consolas, monospace';
    g.fillStyle = '#8d9bb5';
    g.fillText('B = dominant, b = recessive', 14, h - 16);
  },
  challenges: [
    { id: 'c1', text: 'Produce exactly 25% recessive offspring', check: (s, d) => Math.abs(d.recessive - 25) < 0.01 },
    { id: 'c2', text: 'Make every offspring a carrier (Bb) and none recessive', check: (s, d) => (d.counts.Bb || 0) === d.cells.length },
    { id: 'c3', text: 'Get a 50/50 split of dominant and recessive phenotypes', check: (s, d) => Math.abs(d.recessive - 50) < 0.01 },
    { id: 'c4', text: 'Make it impossible for any offspring to show the recessive trait, using at least one Bb parent', check: (s, d) => d.recessive === 0 && (s.p1 === 'Bb' || s.p2 === 'Bb') }
  ]
};

/* ----------------------------------------------------------- python lab */

export const pythonLab = {
  id: 'pylab',
  title: 'Python Sandbox',
  subject: 'code',
  color: '#58cc02',
  icon: '</>',
  blurb: 'A free editor wired to the Python on this machine, with four challenges to clear.',
  concepts: ['running code', 'loops', 'strings', 'functions'],
  code: true,
  starter: '# Anything you write here runs for real.\nfor i in range(5):\n    print(i, i * i)\n',
  challenges: [
    { id: 'c1', text: 'Print the numbers 1 to 5, one per line', expect: '1\n2\n3\n4\n5' },
    { id: 'c2', text: 'Print the 7 times table up to 7 x 5, as "7 x 1 = 7" per line', expect: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35' },
    { id: 'c3', text: 'Print the sum of every even number below 100', expect: '2450' },
    { id: 'c4', text: 'Print the word "level" reversed, then whether it is a palindrome (True/False)', expect: 'level\nTrue' }
  ]
};

export const labs = [circuitLab, projectileLab, titrationLab, grapherLab, punnettLab, pythonLab];

export function getLab(id) {
  return labs.find((l) => l.id === id) || null;
}

export function labState(lab) {
  const s = {};
  (lab.params || []).forEach((p) => { s[p.key] = p.value; });
  return s;
}
