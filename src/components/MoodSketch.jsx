import { useEffect, useRef } from 'react';

/**
 * Mood — the original Processing sketch, running.
 *
 * Ported to p5 instance mode so it can live inside the page without owning
 * the document. The drawing rules are unchanged: cursor speed becomes
 * energy, change of direction becomes confusion, and the two pick the
 * colour and deform the ring.
 */
export default function MoodSketch({ max = 1080 }) {
  const host = useRef(null);

  useEffect(() => {
    let instance;
    let observer;
    let cancelled = false;

    import('p5').then(({ default: p5 }) => {
      if (cancelled || !host.current) return;

      instance = new p5((p) => {
        const spokesBase = 100;
        const ringSize = 2000;
        const trailFade = 10;
        let PL;
        let energy = 0;
        let confuse = 0;
        let t = 0;
        let lastAngle = 0;

        // The tile opens from zero height, so fit to whichever box edge is
        // smaller once it has settled — a ResizeObserver re-fits it below.
        const size = () => {
          const el = host.current;
          if (!el) return 0;
          return Math.min(el.clientWidth || 0, el.clientHeight || Infinity, max);
        };

        const pickEmotionColor = (e) => {
          if (e < 0.15) return PL[0];      // calm
          if (e < 0.35) return PL[1];      // happiness
          if (e < 0.6) return PL[2];       // anger
          if (e < 0.8) return PL[3];       // sadness
          return p.lerpColor(PL[2], p.color(255), 0.3); // white-hot peak
        };

        const drawWaveRing = (diameter, spokes, col, e, c, spin) => {
          for (let layer = 0; layer < 2; layer++) {
            p.push();
            p.rotate((layer === 0 ? 1 : -1) * spin * p.frameCount);
            p.fill(p.red(col), p.green(col), p.blue(col), p.map(layer, 0, 1, 120, 80));
            p.noStroke();
            for (let i = 0; i < spokes; i++) {
              const a0 = p.map(i, 0, spokes, 0, p.TWO_PI);
              const a1 = a0 + p.TWO_PI / (5.0 * spokes);
              const jitter = p.map(p.noise(i * 0.12, t * 1.2 + layer * 10), 0, 2, -24, 14) * (0.3 + e);
              const radShift = p.map(p.sin(i * 0.4 + t * 2.0), -0.5, 2, -60, 50) * c;
              p.arc(0, 0, diameter + jitter + radShift, diameter + jitter + radShift, a0, a1);
            }
            p.pop();
          }
        };

        p.setup = () => {
          const s = Math.max(size(), 1);
          p.createCanvas(s, s);
          p.smooth();
          p.noStroke();
          PL = [
            p.color(106, 167, 255), // calm blue
            p.color(255, 213, 74),  // happiness yellow
            p.color(255, 90, 54),   // anger red-orange
            p.color(140, 77, 255),  // sadness violet
            p.color(53, 241, 210),  // awe cyan
          ];
          p.background(255);
        };

        p.draw = () => {
          p.fill(255, trailFade);
          p.noStroke();
          p.rect(0, 0, p.width, p.height);

          const dx = p.mouseX - p.pmouseX;
          const dy = p.mouseY - p.pmouseY;
          const speed = Math.sqrt(dx * dx + dy * dy);
          energy = Math.max(speed * 0.5, energy * 0.9);

          const ang = Math.atan2(dy, dx);
          let dAng = ang - lastAngle;
          dAng = Math.atan2(Math.sin(dAng), Math.cos(dAng));
          confuse = Math.max(Math.abs(dAng) * 0.9, confuse * 0.88);
          lastAngle = ang;

          const e = p.constrain(p.map(energy, 0, 40, 0, 1), 0, 1);
          const c = p.constrain(p.map(confuse, 0, 0.9, 0, 1), 0, 1);
          const emo = pickEmotionColor(e);

          p.push();
          p.translate(p.width / 2, p.height / 2);
          p.fill(0, 35);
          p.noStroke();
          for (let r = 140; r <= 380; r += 20) p.ellipse(0, 0, r * 2, r * 2);
          p.pop();

          p.push();
          p.translate(p.mouseX, p.mouseY);
          const spin = p.map(c, 0, 1, 0.0, 0.15) * (p.frameCount % 2 === 0 ? 2 : -4);

          p.blendMode(p.ADD);
          p.fill(p.red(emo), p.green(emo), p.blue(emo), 18);
          p.noStroke();
          for (let r = 320; r <= 620; r += 40) p.ellipse(0, 0, r * 2, r * 2);
          p.blendMode(p.BLEND);

          drawWaveRing(ringSize, spokesBase + Math.floor(e * 240), emo, e, c, spin);
          p.pop();

          t += 0.01;
        };

        p.refit = () => {
          const s = size();
          if (s < 40 || Math.abs(s - p.width) < 2) return;
          p.resizeCanvas(s, s);
          p.background(255);
        };

        p.windowResized = p.refit;
      }, host.current);

      observer = new ResizeObserver(() => instance?.refit?.());
      observer.observe(host.current);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (instance) instance.remove();
    };
  }, [max]);

  return <div className="mood" ref={host} aria-hidden="true" />;
}
