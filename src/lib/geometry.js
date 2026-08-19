/**
 * Geometry generators for the margin drawing.
 *
 * Nothing here is a hand-authored path. Every shape is evaluated from a
 * formula — golden-angle phyllotaxis, rose curves, parametric ellipses,
 * a nearest-neighbour graph over a seeded star field — and serialised to
 * an SVG `d` string. Change a parameter and the drawing genuinely redraws.
 */

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // 137.507...°

const r2 = (n) => Math.round(n * 100) / 100;

/** Serialise sampled points to a path. `close` wraps it back to the start. */
function toPath(points, close = false) {
  if (!points.length) return '';
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${r2(x)} ${r2(y)}`).join(' ');
  return close ? `${d} Z` : d;
}

/** Sample any polar function r(t) over [t0, t1] into a path. */
function polarPath(cx, cy, t0, t1, samples, radiusAt, rotate = 0) {
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = t0 + ((t1 - t0) * i) / samples;
    const r = radiusAt(t);
    pts.push([cx + r * Math.cos(t + rotate), cy + r * Math.sin(t + rotate)]);
  }
  return toPath(pts);
}

/* ---------------------------------------------------------------- circles */

export function circlePath(cx, cy, r) {
  return (
    `M${r2(cx - r)} ${r2(cy)}` +
    `a${r2(r)} ${r2(r)} 0 1 0 ${r2(r * 2)} 0` +
    `a${r2(r)} ${r2(r)} 0 1 0 ${r2(-r * 2)} 0`
  );
}

/** Parametric ellipse, tilted by `tilt` radians, sampled so it can be dash-drawn. */
export function ellipsePath(cx, cy, rx, ry, tilt = 0, t0 = 0, t1 = TAU, samples = 180) {
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = t0 + ((t1 - t0) * i) / samples;
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);
    pts.push([cx + x * cos - y * sin, cy + x * sin + y * cos]);
  }
  return toPath(pts, t1 - t0 >= TAU - 1e-6);
}

/** Point on a tilted ellipse — used to fly the planets along their orbits. */
export function ellipsePoint(cx, cy, rx, ry, tilt, t) {
  const x = rx * Math.cos(t);
  const y = ry * Math.sin(t);
  return {
    x: cx + x * Math.cos(tilt) - y * Math.sin(tilt),
    y: cy + x * Math.sin(tilt) + y * Math.cos(tilt),
  };
}

/* ------------------------------------------------- 1. compass / pole star */

/** Alternating outer/inner radii — a `points`-pointed star drawn in one stroke. */
export function starPath(cx, cy, points, rOuter, rInner, rotate = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? rInner : rOuter;
    const a = rotate + (TAU * i) / (points * 2);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return toPath(pts, true);
}

/** Graduation ticks around a dial — every `major`th tick runs longer. */
export function tickMarks(cx, cy, rInner, rOuter, count, major = 3) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = (TAU * i) / count - Math.PI / 2;
    const ro = i % major === 0 ? rOuter : rInner + (rOuter - rInner) * 0.45;
    out.push({
      d: toPath([
        [cx + rInner * Math.cos(a), cy + rInner * Math.sin(a)],
        [cx + ro * Math.cos(a), cy + ro * Math.sin(a)],
      ]),
      major: i % major === 0,
    });
  }
  return out;
}

/* --------------------------------------------------------- 2. the flower */

/**
 * Vogel's model: the seed head. Each floret sits at angle n·137.507°,
 * radius c·√n — the packing sunflowers actually use.
 */
export function phyllotaxis(count, c, cx, cy) {
  const out = [];
  for (let n = 0; n < count; n++) {
    const a = n * GOLDEN_ANGLE;
    const r = c * Math.sqrt(n);
    out.push({
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
      r: 0.5 + 2.1 * (n / count),
      i: n,
      dist: r,
    });
  }
  return out;
}

/** Rhodonea curve r = a·cos(kθ). Odd k traces k petals over [0, π]. */
export function rosePath(cx, cy, a, k, rotate = 0, samples = 480) {
  return polarPath(cx, cy, 0, Math.PI, samples, (t) => a * Math.cos(k * t), rotate);
}

/** The stem: a cubic that leans, so the bloom doesn't look bolted on. */
export function stemPath(cx, cy, baseY, lean = 26) {
  return (
    `M${r2(cx + lean * 0.35)} ${r2(baseY)}` +
    ` C${r2(cx + lean)} ${r2(baseY - (baseY - cy) * 0.42)},` +
    ` ${r2(cx - lean * 0.6)} ${r2(cy + (baseY - cy) * 0.34)},` +
    ` ${r2(cx)} ${r2(cy)}`
  );
}

/** A leaf as two mirrored quadratics off the stem. */
export function leafPath(x, y, len, width, angle) {
  const tx = x + len * Math.cos(angle);
  const ty = y + len * Math.sin(angle);
  const nx = -Math.sin(angle) * width;
  const ny = Math.cos(angle) * width;
  return (
    `M${r2(x)} ${r2(y)}` +
    ` Q${r2((x + tx) / 2 + nx)} ${r2((y + ty) / 2 + ny)} ${r2(tx)} ${r2(ty)}` +
    ` Q${r2((x + tx) / 2 - nx)} ${r2((y + ty) / 2 - ny)} ${r2(x)} ${r2(y)} Z`
  );
}

/* --------------------------------------------------- 3. the constellation */

/** Deterministic PRNG — the star field must be identical on every render. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Scatter stars across the panel, skipping any that fall inside a
 * `keepClear` disc — the star and the bloom need room to read.
 */
export function starField(rng, count, w, h, keepClear = [], margin = 10) {
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 80) {
    const x = margin + rng() * (w - margin * 2);
    const y = margin + rng() * (h - margin * 2);
    if (keepClear.some((z) => Math.hypot(x - z.x, y - z.y) < z.r)) continue;
    out.push({ x, y, r: 0.7 + rng() * 1.8 });
  }
  return out;
}

/**
 * Connect each star to its `k` nearest neighbours within `maxDist`.
 * The resulting graph is what makes it read as a constellation rather
 * than as scattered dots.
 */
export function nearestNeighbourEdges(points, k, maxDist) {
  const seen = new Set();
  const edges = [];
  points.forEach((p, i) => {
    const near = points
      .map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) }))
      .filter((c) => c.j !== i && c.d <= maxDist)
      .sort((a, b) => a.d - b.d)
      .slice(0, k);
    near.forEach(({ j, d }) => {
      const key = i < j ? `${i}:${j}` : `${j}:${i}`;
      if (seen.has(key)) return;
      seen.add(key);
      const q = points[j];
      edges.push({ d: toPath([[p.x, p.y], [q.x, q.y]]), len: d });
    });
  });
  return edges;
}

/* --------------------------------------------------------- 4. the planets */

/**
 * Saturn, split so the ring passes correctly behind the globe: the far half
 * of the ring (sin t < 0 in ring space) is drawn first, then the filled
 * planet, then the near half on top.
 */
export function saturn(cx, cy, r, ringRx, ringRy, tilt) {
  return {
    planet: circlePath(cx, cy, r),
    ringBack: ellipsePath(cx, cy, ringRx, ringRy, tilt, Math.PI, TAU, 90),
    ringFront: ellipsePath(cx, cy, ringRx, ringRy, tilt, 0, Math.PI, 90),
    ringOuterBack: ellipsePath(cx, cy, ringRx * 1.22, ringRy * 1.22, tilt, Math.PI, TAU, 90),
    ringOuterFront: ellipsePath(cx, cy, ringRx * 1.22, ringRy * 1.22, tilt, 0, Math.PI, 90),
    /** Latitude bands, foreshortened by the sphere. */
    bands: [-0.42, -0.1, 0.24].map((f) => {
      const y = cy + r * f;
      const half = Math.sqrt(Math.max(r * r - (r * f) ** 2, 0));
      return `M${r2(cx - half)} ${r2(y)} Q${r2(cx)} ${r2(y + r * 0.16)} ${r2(cx + half)} ${r2(y)}`;
    }),
  };
}

/** A nebula wisp: a circular arc perturbed by two out-of-phase harmonics. */
export function nebulaArc(cx, cy, r, t0, t1, amp, freq, phase, samples = 140) {
  return polarPath(
    cx,
    cy,
    t0,
    t1,
    samples,
    (t) => r + amp * Math.sin(freq * t + phase) + amp * 0.45 * Math.sin(freq * 2.3 * t - phase),
  );
}

export { TAU, GOLDEN_ANGLE, toPath };
