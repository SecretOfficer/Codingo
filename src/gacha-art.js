/* Procedural chibi portraits. Every character is drawn as inline SVG from its own
   palette, form and feature list, so the app ships no artwork and nothing is borrowed
   from anyone else's game. Deterministic: the same character always draws the same. */

const RARITY_GLOW = { 3: '#a2968a', 4: '#6a9cb0', 5: '#e0a83c' };

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/* ------------------------------------------------------------- pieces */

function wings(p, back) {
  const [main, dark, accent] = p;
  const colour = back ? dark : main;
  return `
    <g opacity="${back ? 0.9 : 1}">
      <path d="M32 58 C 10 44, 4 62, 12 76 C 18 86, 28 78, 32 70 Z" fill="${colour}" stroke="${dark}" stroke-width="1.5"/>
      <path d="M68 58 C 90 44, 96 62, 88 76 C 82 86, 72 78, 68 70 Z" fill="${colour}" stroke="${dark}" stroke-width="1.5"/>
      <path d="M30 62 C 18 56, 14 66, 18 73" fill="none" stroke="${accent}" stroke-width="1.2" opacity=".7"/>
      <path d="M70 62 C 82 56, 86 66, 82 73" fill="none" stroke="${accent}" stroke-width="1.2" opacity=".7"/>
    </g>`;
}

function horns(p) {
  const [main, dark, accent] = p;
  return `
    <g>
      <path d="M34 26 C 28 14, 22 10, 20 6 C 30 8, 38 16, 40 24 Z" fill="${accent}" stroke="${dark}" stroke-width="1.3"/>
      <path d="M66 26 C 72 14, 78 10, 80 6 C 70 8, 62 16, 60 24 Z" fill="${accent}" stroke="${dark}" stroke-width="1.3"/>
    </g>`;
}

function crown(p) {
  const [, dark, accent] = p;
  return `
    <path d="M36 22 L40 12 L46 20 L50 8 L54 20 L60 12 L64 22 Z"
      fill="${accent}" stroke="${dark}" stroke-width="1.3" stroke-linejoin="round"/>`;
}

function halo(p) {
  const [, , accent] = p;
  return `<ellipse cx="50" cy="12" rx="19" ry="5" fill="none" stroke="${accent}" stroke-width="2.6" opacity=".9"/>`;
}

function orbits(p) {
  const [, , accent] = p;
  return `
    <g opacity=".85" fill="none" stroke="${accent}" stroke-width="1.6">
      <ellipse cx="50" cy="52" rx="34" ry="12" transform="rotate(-18 50 52)"/>
      <ellipse cx="50" cy="52" rx="34" ry="12" transform="rotate(22 50 52)"/>
    </g>
    <circle cx="82" cy="44" r="3.2" fill="${accent}"/>
    <circle cx="19" cy="61" r="2.4" fill="${accent}"/>`;
}

function tail(p) {
  const [main, dark, accent] = p;
  return `
    <path d="M62 96 C 80 98, 88 88, 84 76 C 82 70, 76 70, 76 76 C 76 84, 70 88, 62 88 Z"
      fill="${main}" stroke="${dark}" stroke-width="1.5"/>
    <path d="M84 74 L92 68 L86 80 Z" fill="${accent}" stroke="${dark}" stroke-width="1"/>`;
}

function shield(p) {
  const [main, dark, accent] = p;
  return `
    <g transform="translate(74 78) scale(.72)">
      <path d="M0 -14 L14 -8 L14 6 C 14 16, 0 22, 0 22 C 0 22, -14 16, -14 6 L-14 -8 Z"
        fill="${main}" stroke="${dark}" stroke-width="2"/>
      <path d="M0 -8 L0 16" stroke="${accent}" stroke-width="2.4"/>
    </g>`;
}

function visor(p) {
  const [, dark, accent] = p;
  return `
    <rect x="28" y="40" width="44" height="13" rx="6.5" fill="${dark}" stroke="${accent}" stroke-width="1.6"/>
    <rect x="33" y="44" width="12" height="5" rx="2.5" fill="${accent}" opacity=".95"/>
    <rect x="55" y="44" width="12" height="5" rx="2.5" fill="${accent}" opacity=".95"/>`;
}

function eyes(p, seed) {
  const [, dark, accent] = p;
  const happy = seed > 0.72;
  if (happy) {
    return `
      <path d="M34 46 Q40 39 46 46" fill="none" stroke="${dark}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M54 46 Q60 39 66 46" fill="none" stroke="${dark}" stroke-width="3.4" stroke-linecap="round"/>
      <circle cx="28" cy="53" r="3.6" fill="${accent}" opacity=".45"/>
      <circle cx="72" cy="53" r="3.6" fill="${accent}" opacity=".45"/>`;
  }
  return `
    <ellipse cx="40" cy="46" rx="6.4" ry="7.6" fill="${dark}"/>
    <ellipse cx="60" cy="46" rx="6.4" ry="7.6" fill="${dark}"/>
    <circle cx="42.2" cy="43.4" r="2.4" fill="#ffffff"/>
    <circle cx="62.2" cy="43.4" r="2.4" fill="#ffffff"/>
    <circle cx="38" cy="49" r="1.2" fill="${accent}"/>
    <circle cx="58" cy="49" r="1.2" fill="${accent}"/>`;
}

/* -------------------------------------------------------------- forms */

function bodyFor(form, p) {
  const [main, dark, accent] = p;
  switch (form) {
    case 'dragon':
      return `
        <path d="M50 62 C 36 62, 28 74, 30 88 C 32 100, 44 104, 50 104 C 56 104, 68 100, 70 88 C 72 74, 64 62, 50 62 Z"
          fill="${main}" stroke="${dark}" stroke-width="2"/>
        <path d="M44 78 L50 70 L56 78 L50 86 Z" fill="${accent}" opacity=".9"/>
        <path d="M40 92 C 46 96, 54 96, 60 92" fill="none" stroke="${dark}" stroke-width="1.4" opacity=".6"/>`;
    case 'construct':
      return `
        <rect x="31" y="64" width="38" height="38" rx="8" fill="${main}" stroke="${dark}" stroke-width="2"/>
        <rect x="38" y="72" width="24" height="8" rx="4" fill="${accent}" opacity=".9"/>
        <rect x="38" y="85" width="10" height="6" rx="3" fill="${dark}" opacity=".7"/>
        <rect x="52" y="85" width="10" height="6" rx="3" fill="${dark}" opacity=".7"/>`;
    case 'elemental':
      return `
        <path d="M50 60 C 34 66, 30 84, 38 96 C 44 104, 56 104, 62 96 C 70 84, 66 66, 50 60 Z"
          fill="${main}" stroke="${dark}" stroke-width="2" opacity=".95"/>
        <circle cx="50" cy="82" r="8" fill="${accent}" opacity=".85"/>
        <circle cx="50" cy="82" r="13" fill="none" stroke="${accent}" stroke-width="1" opacity=".5"/>`;
    case 'beast':
      return `
        <ellipse cx="50" cy="84" rx="21" ry="19" fill="${main}" stroke="${dark}" stroke-width="2"/>
        <ellipse cx="50" cy="88" rx="11" ry="9" fill="${accent}" opacity=".45"/>
        <path d="M36 100 L34 106 M44 103 L43 108 M56 103 L57 108 M64 100 L66 106"
          stroke="${dark}" stroke-width="2.6" stroke-linecap="round"/>`;
    default: // sprite
      return `
        <path d="M50 62 C 38 62, 32 74, 34 86 C 36 98, 44 102, 50 102 C 56 102, 64 98, 66 86 C 68 74, 62 62, 50 62 Z"
          fill="${main}" stroke="${dark}" stroke-width="2"/>
        <circle cx="50" cy="80" r="6" fill="${accent}" opacity=".8"/>`;
  }
}

/* ------------------------------------------------------------ portrait */

/**
 * Full portrait as an SVG string.
 * @param {object} c character record from the roster
 * @param {object} opts { size, showAura }
 */
export function portrait(c, opts) {
  const o = opts || {};
  const size = o.size || 120;
  const p = c.palette;
  const seed = hash(c.id);
  const glow = RARITY_GLOW[c.rarity];
  const hasBackWings = c.features.includes('wings');

  const rays = c.rarity === 5
    ? `<g opacity=".22">${Array.from({ length: 12 }, (_, i) =>
        `<rect x="49" y="6" width="2" height="46" fill="${glow}" transform="rotate(${i * 30} 50 56)"/>`).join('')}</g>`
    : '';

  return `
<svg viewBox="0 0 100 118" width="${size}" height="${size * 1.18}" role="img" aria-label="${c.name}">
  <defs>
    <radialGradient id="bg-${c.id}" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="${p[0]}" stop-opacity=".38"/>
      <stop offset="100%" stop-color="${p[1]}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="50" cy="56" rx="46" ry="52" fill="url(#bg-${c.id})"/>
  ${rays}
  ${o.showAura === false ? '' : `<ellipse cx="50" cy="106" rx="26" ry="5" fill="${p[1]}" opacity=".55"/>`}
  ${hasBackWings ? wings(p, true) : ''}
  ${c.features.includes('orbits') ? orbits(p) : ''}
  ${bodyFor(c.form, p)}
  ${c.features.includes('tail') ? tail(p) : ''}
  ${c.features.includes('shield') ? shield(p) : ''}
  <circle cx="50" cy="42" r="26" fill="${p[0]}" stroke="${p[1]}" stroke-width="2.4"/>
  <ellipse cx="50" cy="32" rx="19" ry="9" fill="#ffffff" opacity=".12"/>
  ${c.features.includes('horns') ? horns(p) : ''}
  ${c.features.includes('crown') ? crown(p) : ''}
  ${c.features.includes('visor') ? visor(p) : eyes(p, seed)}
  ${c.features.includes('visor') ? '' : `<path d="M45 57 Q50 61 55 57" fill="none" stroke="${p[1]}" stroke-width="2" stroke-linecap="round" opacity=".8"/>`}
  ${c.features.includes('halo') ? halo(p) : ''}
</svg>`;
}

export function rarityColour(rarity) {
  return RARITY_GLOW[rarity] || RARITY_GLOW[3];
}

export function stars(rarity) {
  return '★'.repeat(rarity);
}
