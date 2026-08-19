import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ellipsePoint, circlePath } from '../lib/geometry';

gsap.registerPlugin(ScrollTrigger);

const CUE_CX = 30;
const CUE_CY = 26;

export default function Hero() {
  const root = useRef(null);
  const dots = useRef([]);

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context((self) => {
      const q = self.selector;

      if (reduced) {
        gsap.set(q('.line > span, .hero__sub, .hero__cue'), { yPercent: 0, opacity: 1 });
        return;
      }

      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from(q('.line > span'), { yPercent: 110, duration: 1.5, stagger: 0.09 }, 0.15)
        .from(q('.hero__sub'), { yPercent: 100, opacity: 0, duration: 1.2 }, 0.75)
        .from(q('.hero__cue'), { opacity: 0, duration: 1 }, 1.3);

      /* A gentle pulse: the shaft breathes and the whole mark drifts down. */
      gsap.to(q('.hero__arrow'), { y: 10, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to(q('.hero__pulse'), {
        opacity: 0.25, scale: 1.14, transformOrigin: `${CUE_CX}px ${CUE_CY}px`,
        duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
      gsap.to(q('.hero__shaft'), { opacity: 0.45, duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });

      /* Dots on their own orbit around the cue. */
      const orbiting = dots.current.filter(Boolean);
      const spin = () => {
        const t = gsap.ticker.time;
        orbiting.forEach((el, i) => {
          const p = ellipsePoint(CUE_CX, CUE_CY, 22, 11.5, -0.24, t * (0.55 + i * 0.19) + i * 1.6);
          el.setAttribute('cx', p.x.toFixed(2));
          el.setAttribute('cy', p.y.toFixed(2));
        });
      };
      spin();
      gsap.ticker.add(spin);
      self.add(() => gsap.ticker.remove(spin));

      /* Starting to scroll takes it apart: the shaft retracts, the dots fly
         off their orbit, and what is left dissolves into the page. */
      const out = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=38%',
          scrub: 0.5,
        },
      });
      out.to(q('.hero__shaft'), { strokeDashoffset: 1, duration: 1, ease: 'none' }, 0)
        .to(q('.hero__head'), { y: -14, rotation: 45, transformOrigin: '50% 50%', opacity: 0, duration: 1 }, 0)
        .to(q('.hero__ring'), { scale: 1.9, opacity: 0, transformOrigin: `${CUE_CX}px ${CUE_CY}px`, duration: 1 }, 0)
        .to(orbiting, {
          scale: 0, opacity: 0, transformOrigin: `${CUE_CX}px ${CUE_CY}px`,
          duration: 1, stagger: 0.06,
        }, 0)
        .to(q('.hero__cue-label'), { opacity: 0, letterSpacing: '0.7em', duration: 1 }, 0)
        .to(q('.hero__cue'), { opacity: 0, y: 18, duration: 0.7 }, 0.3);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <header className="hero" ref={root}>
      <h1 className="hero__title">
        <span className="line"><span>Hi, I&rsquo;m </span></span>
        <span className="line"><span className="hero__name">Divya.</span></span>
      </h1>
      <p className="hero__sub-wrap">
        <span className="hero__sub">I&rsquo;m here to help you.</span>
      </p>

      <div className="hero__cue" aria-hidden="true">
        <span className="hero__cue-label">Scroll</span>
        <svg className="hero__arrow" width="60" height="74" viewBox="0 0 60 74" fill="none">
          <path className="hero__ring hero__pulse" d={circlePath(CUE_CX, CUE_CY, 22)} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} ref={(el) => { dots.current[i] = el; }}
              className={i === 1 ? 'hero__dot hero__dot--gold' : 'hero__dot'}
              r={i === 1 ? 1.9 : 1.4} />
          ))}
          <path className="hero__shaft" pathLength="1" d={`M${CUE_CX} 12 L${CUE_CX} 62`} />
          <path className="hero__head" d={`M${CUE_CX - 5.5} 56.5 L${CUE_CX} 63 L${CUE_CX + 5.5} 56.5`} />
        </svg>
      </div>
    </header>
  );
}
