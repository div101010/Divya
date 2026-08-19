import { useLayoutEffect, useRef, useState, useId } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MoodSketch from './MoodSketch';
import { burst } from '../lib/sparks';

gsap.registerPlugin(ScrollTrigger);

export default function ServiceRow({ service, onOpenProject, moodPaused }) {
  const root = useRef(null);
  const panel = useRef(null);
  const [open, setOpen] = useState(false);
  const panelId = useId();

  /* Reveal the row as it enters. */
  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context((self) => {
      const centreBurst = () =>
        burst(window.innerWidth / 2, window.innerHeight / 2, { count: 20, reach: 170, life: 0.5 });

      gsap.from(self.selector('[data-reveal]'), {
        opacity: 0, y: 44, duration: 1.3, ease: 'expo.out', stagger: 0.1,
        scrollTrigger: {
          trigger: root.current,
          start: 'top 78%',
          onEnter: centreBurst,
          onEnterBack: centreBurst,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  /* Open and close the work panel. */
  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      gsap.set(el, { height: open ? 'auto' : 0, opacity: open ? 1 : 0 });
      ScrollTrigger.refresh();
      return;
    }

    const tween = open
      ? gsap.to(el, {
          height: 'auto', opacity: 1, duration: 0.72, ease: 'expo.out',
          onComplete: () => ScrollTrigger.refresh(),
        })
      : gsap.to(el, {
          height: 0, opacity: 0, duration: 0.45, ease: 'power2.inOut',
          onComplete: () => ScrollTrigger.refresh(),
        });

    return () => tween.kill();
  }, [open]);

  const money = new Intl.NumberFormat('en-IE').format(service.price);

  return (
    <article className="service" ref={root}>
      <div className="service__head">
        <h2 className="service__name" data-reveal>{service.name}</h2>

        <p className="service__line" data-reveal>{service.description}</p>

        <div className="service__meta" data-reveal>
          <p className="service__price">from &euro;{money}</p>
          <button
            type="button"
            className="seework"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="seework__mark" aria-hidden="true">
              <span className="seework__bar" />
              <span className={`seework__bar seework__bar--v${open ? ' is-open' : ''}`} />
            </span>
            <span className="seework__label">{open ? 'Close' : 'See work'}</span>
          </button>
        </div>
      </div>

      <div className="service__panel" id={panelId} ref={panel} style={{ height: 0, opacity: 0 }}>
        <div className="service__panel-inner">
          <ul className="projects">
            {service.projects.map((p) => (
              <li key={p.id} className={`project${p.live ? ' project--live' : ''}`}>
                <button
                  type="button"
                  className="project__btn"
                  onClick={() => onOpenProject(p.id)}
                >
                  <span className="project__media">
                    {p.live ? (
                      moodPaused ? (
                        <img src={p.frames[0]} alt="" loading="lazy" />
                      ) : (
                        <MoodSketch max={620} />
                      )
                    ) : (
                      <img src={p.frames[0]} alt="" loading="lazy" />
                    )}
                  </span>
                  <span className="project__foot">
                    <span className="project__title">{p.title}</span>
                    <span className="project__type">{p.meta}</span>
                  </span>
                </button>
                {p.live && (
                  <p className="project__hint">
                    Running live. Move your cursor across it.
                  </p>
                )}
              </li>
            ))}
          </ul>

          <p className="service__note">
            Starting from &euro;{money}. Scope and pricing always open to discussion.
          </p>
        </div>
      </div>
    </article>
  );
}
