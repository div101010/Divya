import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { mulberry32, leafPath, rosePath, circlePath, ellipsePoint } from '../lib/geometry';
import { onBurst } from '../lib/sparks';

const POOL = 90;
const SIZE = 1.12;   // the mark's overall size, a notch up from the base drawing
const KINDS = ['dot', 'petal', 'dot', 'line', 'dot', 'petal', 'num', 'dot', 'petal', 'line', 'dot', 'petal'];

/**
 * The pointer, and everything it stirs up.
 *
 * The cursor is a small drawn instrument rather than an arrow: a dashed dial,
 * a five-petal rose turning inside it, three dots on an orbit, and a plate
 * number that reads how far down the page you are. Moving it scatters marks
 * from the same vocabulary, more of them the faster you go. Stop, and a
 * flower blooms where you left off.
 *
 * Transforms are written straight onto the elements rather than left to GSAP's
 * SVG transform handling, so every mark rotates and scales about its own
 * origin no matter where it has been flung.
 */
export default function EffectsLayer() {
  const root = useRef(null);
  const cursor = useRef(null);
  const rose = useRef(null);
  const bloom = useRef(null);
  const orbits = useRef([]);
  const plate = useRef(null);
  const marks = useRef([]);

  /* Every mark is drawn from a formula once, then reused from the pool. */
  const parts = useMemo(() => {
    const rng = mulberry32(31415);
    return Array.from({ length: POOL }, (_, i) => {
      const kind = KINDS[i % KINDS.length];
      const accent = i % 9 === 4 ? 'fill-gold' : i % 14 === 3 ? 'fill-blue' : 'fill-ink';
      if (kind === 'dot') return { kind, r: 1 + rng() * 1.7, accent };
      if (kind === 'petal') return { kind, d: leafPath(0, 0, 7 + rng() * 7, 2 + rng() * 2.2, 0), accent };
      if (kind === 'line') return { kind, len: 9 + rng() * 15, accent };
      return { kind, text: String(11 + Math.floor(rng() * 88)), accent };
    });
  }, []);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    // On touch devices the pointer still follows the finger while it's down,
    // but the crosshair is hidden until the first contact.
    const touch = !fine;

    const states = parts.map(() => ({ x: 0, y: 0, r: 0, s: 0, o: 0 }));
    const paint = (i) => {
      const el = marks.current[i];
      const s = states[i];
      if (!el) return;
      el.setAttribute('transform', `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) rotate(${s.r.toFixed(1)}) scale(${s.s.toFixed(3)})`);
      el.setAttribute('opacity', s.o.toFixed(3));
    };
    states.forEach((_, i) => paint(i));

    let next = 0;
    const scatter = (x, y, dir, spread, reach, life) => {
      const i = next++ % POOL;
      const s = states[i];
      const a = dir + (Math.random() - 0.5) * spread;
      const dist = reach * (0.45 + Math.random() * 0.75);
      gsap.killTweensOf(s);
      s.x = x; s.y = y; s.r = Math.random() * 360; s.s = 0; s.o = 0;
      const grow = Math.min(0.16, life * 0.3);
      gsap.timeline({ onUpdate: () => paint(i) })
        .to(s, {
          x: x + Math.cos(a) * dist,
          y: y + Math.sin(a) * dist,
          r: s.r + (Math.random() * 170 - 85),
          duration: life,
          ease: 'power2.out',
        }, 0)
        .to(s, { s: 0.65 + Math.random() * 0.7, o: 1, duration: grow, ease: 'power2.out' }, 0)
        .to(s, { o: 0, duration: life - grow, ease: 'power1.in' }, grow);
    };

    /* A burst asked for from elsewhere on the page. */
    const off = onBurst((x, y, { count = 18, reach = 150, life = 0.5 } = {}) => {
      for (let i = 0; i < count; i++) {
        scatter(x, y, (Math.PI * 2 * i) / count + Math.random() * 0.4, 0.5, reach, life);
      }
    });

    /* ---------------------------------------------------------- pointer */

    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let cx = px;
    let cy = py;
    let vx = 0;
    let vy = 0;
    let hot = 0;          // how emphatic the cursor is, over interactive things
    let idle = null;
    let blooming = false;
    let shown = false;
    let lastPlate = '';

    const stopBloom = () => {
      if (!blooming) return;
      blooming = false;
      gsap.killTweensOf(bloom.current);
      gsap.set(bloom.current, { opacity: 0 });
    };

    const startBloom = () => {
      if (blooming || !bloom.current) return;
      blooming = true;
      const el = bloom.current;
      el.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(0.25)`);
      gsap.set(el, { opacity: 1, strokeDasharray: 1, strokeDashoffset: 1 });
      const g = { s: 0.25 };
      gsap.timeline({ onComplete: () => { blooming = false; } })
        .to(el, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out' }, 0)
        .to(g, {
          s: 1, duration: 1.3, ease: 'power3.out',
          onUpdate: () => el.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${g.s.toFixed(3)})`),
        }, 0)
        .to(el, { opacity: 0, duration: 0.55, ease: 'power1.in' }, 1.05);
    };

    const onMove = (e) => {
      const dx = e.clientX - px;
      const dy = e.clientY - py;
      px = e.clientX;
      py = e.clientY;
      const speed = Math.hypot(dx, dy);
      vx = dx; vy = dy;

      if (!shown) {
        shown = true;
        gsap.to(cursor.current, { opacity: 1, duration: 0.4 });
      }

      stopBloom();
      clearTimeout(idle);
      idle = setTimeout(startBloom, 420);

      // The faster the pointer travels, the more it throws off.
      if (speed > 3) {
        const n = Math.min(3, Math.round(speed / 13));
        const dir = Math.atan2(dy, dx) + Math.PI;
        for (let i = 0; i < n; i++) scatter(px, py, dir, 1.5, 26 + speed * 0.8, 0.55 + Math.random() * 0.4);
      }

      const over = e.target?.closest?.('a, button');
      hot = over ? 1 : 0;
    };

    // Touch drags don't emit pointermove events unless we snap the initial
    // position on touch-down, so the first drag doesn't fling from the last
    // mouse position.
    const onDown = (e) => {
      px = e.clientX;
      py = e.clientY;
      cx = e.clientX;
      cy = e.clientY;
    };

    const onUp = () => {
      // On touch, hide the pointer visual again once the finger lifts.
      if (touch) {
        shown = false;
        gsap.to(cursor.current, { opacity: 0, duration: 0.4 });
        clearTimeout(idle);
        stopBloom();
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    if (fine) document.documentElement.classList.add('has-cursor');

    /* ------------------------------------------------------------ frame */

    const tick = () => {
      const t = gsap.ticker.time;

      if (cursor.current) {
        cx += (px - cx) * 0.24;
        cy += (py - cy) * 0.24;
        const lean = Math.max(-9, Math.min(9, vx * 0.5));
        cursor.current.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${lean.toFixed(2)}) scale(${SIZE})`);
        vx *= 0.9; vy *= 0.9;

        const grow = 1 + hot * 0.45;
        rose.current?.setAttribute('transform', `rotate(${((t * 26) % 360).toFixed(1)}) scale(${grow.toFixed(3)})`);

        orbits.current.forEach((el, i) => {
          if (!el) return;
          const p = ellipsePoint(0, 0, 15.5 * grow, 8.5 * grow, -0.3, t * (0.6 + i * 0.22) + i * 2.1);
          el.setAttribute('cx', p.x.toFixed(2));
          el.setAttribute('cy', p.y.toFixed(2));
        });

        if (plate.current) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const pc = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
          const txt = String(Math.min(99, pc)).padStart(2, '0');
          if (txt !== lastPlate) { plate.current.textContent = txt; lastPlate = txt; }
        }
      }

    };

    gsap.ticker.add(tick);

    return () => {
      off();
      gsap.ticker.remove(tick);
      clearTimeout(idle);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.documentElement.classList.remove('has-cursor');
      gsap.killTweensOf(states);
    };
  }, [parts]);

  return (
    <svg className="cf" aria-hidden="true" focusable="false">
      {/* the marks the pointer scatters */}
      {parts.map((p, i) => (
        <g key={i} ref={(el) => { marks.current[i] = el; }} opacity="0">
          {p.kind === 'dot' && <circle r={p.r} className={p.accent} />}
          {p.kind === 'petal' && <path d={p.d} className={p.accent} />}
          {p.kind === 'line' && (
            <>
              <path d={`M0 0 L${p.len.toFixed(1)} 0`} className="cf__link" />
              <circle cx="0" cy="0" r="1.2" className={p.accent} />
              <circle cx={p.len.toFixed(1)} cy="0" r="1.2" className={p.accent} />
            </>
          )}
          {p.kind === 'num' && <text className="cf__num">{p.text}</text>}
        </g>
      ))}

      {/* the flower that opens when you stop */}
      <path ref={bloom} className="cf__bloom" pathLength="1" opacity="0" d={rosePath(0, 0, 34, 5)} />

      {/* the pointer itself */}
      <g ref={cursor} className="cf__cursor" opacity="0">
        <path className="cf__dial" d={circlePath(0, 0, 15.5)} />
        <g ref={rose}>
          <path className="cf__petals" d={rosePath(0, 0, 9.5, 5)} />
          <path className="cf__petals cf__petals--accent" d={rosePath(0, 0, 6, 7, 0.4)} />
        </g>
        <circle className="cf__core" r="1.6" />
        {[0, 1, 2].map((i) => (
          <circle key={i} ref={(el) => { orbits.current[i] = el; }}
            className={i === 1 ? 'fill-gold' : 'fill-ink'} r={i === 1 ? 1.9 : 1.4} />
        ))}
        <text ref={plate} className="cf__plate" x="19" y="24">00</text>
      </g>

    </svg>
  );
}
