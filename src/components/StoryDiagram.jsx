/**
 * The two conceptual diagrams from the Leganés report, redrawn in the site's
 * ink language rather than screenshotted off their original pink slides.
 * Node positions are evaluated from an ellipse, the same way the margin
 * plate places its orbits.
 */

const TAU = Math.PI * 2;
const r2 = (n) => Math.round(n * 100) / 100;

const onEllipse = (cx, cy, rx, ry, deg) => {
  const t = (deg * Math.PI) / 180;
  return { x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t), t };
};

const ellipseD = (cx, cy, rx, ry, samples = 160) => {
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const t = (TAU * i) / samples;
    pts.push(`${i ? 'L' : 'M'}${r2(cx + rx * Math.cos(t))} ${r2(cy + ry * Math.sin(t))}`);
  }
  return `${pts.join(' ')} Z`;
};

/**
 * Where the label goes relative to its node: pushed clear of the node on
 * whichever side of the diagram it sits. The node itself stays on the
 * ellipse, so `lx`/`ly` are kept separate from `x`/`y`.
 */
function place({ x, y }, cx, pad = 30) {
  if (Math.abs(x - cx) < 40) return { lx: x, ly: y, anchor: 'middle' };
  return x > cx
    ? { lx: x + pad, ly: y, anchor: 'start' }
    : { lx: x - pad, ly: y, anchor: 'end' };
}

/* ------------------------------------------------- the analytical cycle */

const CYCLE = [
  'Data collection',
  'Multi-layer analysis',
  'System mapping',
  'System relations',
  'Spatial insights',
];

function Cycle() {
  const cx = 480, cy = 185, rx = 300, ry = 118;
  const nodes = CYCLE.map((label, i) => {
    const p = onEllipse(cx, cy, rx, ry, -90 + i * (360 / CYCLE.length));
    return { label, ...p, ...place(p, cx) };
  });

  // A chevron sitting on the ellipse, turned along its tangent.
  const arrows = CYCLE.map((_, i) => {
    const deg = -90 + (i + 0.5) * (360 / CYCLE.length);
    const p = onEllipse(cx, cy, rx, ry, deg);
    const t = p.t;
    const angle = (Math.atan2(ry * Math.cos(t), -rx * Math.sin(t)) * 180) / Math.PI;
    return { x: p.x, y: p.y, angle };
  });

  return (
    <svg viewBox="0 0 960 330" className="dgm" role="img"
      aria-label="A five-stage cycle: data collection, multi-layer analysis, system mapping, system relations, spatial insights, feeding back to data collection.">
      <path className="dgm__ring" d={ellipseD(cx, cy, rx, ry)} />
      {arrows.map((a, i) => (
        <path key={i} className="dgm__arrow" d="M-6 -5 L1 0 L-6 5"
          transform={`translate(${r2(a.x)} ${r2(a.y)}) rotate(${r2(a.angle)})`} />
      ))}
      {nodes.map((n) => (
        <g key={n.label}>
          <circle className="dgm__dot" cx={r2(n.x)} cy={r2(n.y)} r="3.4" />
          <text className="dgm__label" x={r2(n.lx)} y={r2(n.ly)}
            textAnchor={n.anchor} dy={n.anchor === 'middle' ? -16 : 4}>
            {n.label.toUpperCase()}
          </text>
        </g>
      ))}
      <text className="dgm__core" x={cx} y={cy} textAnchor="middle" dy="6">
        Urban systems thinking
      </text>
    </svg>
  );
}

/** Too wide to read on a phone, so the same cycle is set as a list. */
function CycleList() {
  return (
    <div className="dgm-list">
      <p className="dgm-list__core">Urban systems thinking</p>
      <ol className="dgm-list__items">
        {CYCLE.map((label) => (
          <li key={label}><span className="dgm-list__label">{label.toUpperCase()}</span></li>
        ))}
      </ol>
      <p className="dgm-list__loop">and back to data collection</p>
    </div>
  );
}

/* ----------------------------------------------- the layered framework */

const LAYERS = [
  ['Environment', 'air, climate, ecology'],
  ['Demographics', 'population, age, migration'],
  ['Mobility', 'infrastructure, accessibility'],
  ['Built system', 'urban layers, density'],
  ['Territory', 'land, geomorphology, water'],
  ['Temporal layer', 'history, evolution over time'],
];

function Framework() {
  const cx = 480, cy = 290, rx = 300, ry = 180;
  const nodes = LAYERS.map(([label, note], i) => {
    const p = onEllipse(cx, cy, rx, ry, -90 + i * (360 / LAYERS.length));
    return { label, note, ...p, ...place(p, cx, 26) };
  });

  return (
    <svg viewBox="0 0 960 580" className="dgm" role="img"
      aria-label="Six layers read as one system: environment, demographics, mobility, built system, territory and temporal layer, all joined to Leganés as a system.">
      {nodes.map((n) => {
        // Stop the spoke short at both ends so nothing collides with the type.
        const dx = n.x - cx, dy = n.y - cy;
        const len = Math.hypot(dx, dy);
        const a = 92 / len, b = 1 - 14 / len;
        return (
          <path key={n.label} className="dgm__spoke"
            d={`M${r2(cx + dx * a)} ${r2(cy + dy * a)} L${r2(cx + dx * b)} ${r2(cy + dy * b)}`} />
        );
      })}
      <path className="dgm__ring" d={ellipseD(cx, cy, 86, 44)} />
      <text className="dgm__core" x={cx} y={cy} textAnchor="middle" dy="-2">Leganés</text>
      <text className="dgm__core dgm__core--sm" x={cx} y={cy} textAnchor="middle" dy="20">as a system</text>
      {nodes.map((n) => (
        <g key={n.label}>
          <circle className="dgm__dot" cx={r2(n.x)} cy={r2(n.y)} r="3.4" />
          <text className="dgm__label" x={r2(n.lx)} y={r2(n.ly)}
            textAnchor={n.anchor} dy={n.anchor === 'middle' ? (n.y < cy ? -26 : 22) : -4}>
            {n.label.toUpperCase()}
          </text>
          <text className="dgm__note" x={r2(n.lx)} y={r2(n.ly)}
            textAnchor={n.anchor} dy={n.anchor === 'middle' ? (n.y < cy ? -10 : 38) : 14}>
            {n.note}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** The same six layers, set as a list where the radial plan will not fit. */
function FrameworkList() {
  return (
    <div className="dgm-list">
      <p className="dgm-list__core">Leganés as a system</p>
      <ul className="dgm-list__items">
        {LAYERS.map(([label, note]) => (
          <li key={label}>
            <span className="dgm-list__label">{label.toUpperCase()}</span>
            <span className="dgm-list__note">{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StoryDiagram({ name }) {
  if (name === 'cycle') return <><Cycle /><CycleList /></>;
  if (name === 'framework') return <><Framework /><FrameworkList /></>;
  return null;
}
