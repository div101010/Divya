import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import MoodSketch from './MoodSketch';
import StoryDiagram from './StoryDiagram';

/** "https://street-reader-com.vercel.app/" → "street-reader-com.vercel.app" */
const domain = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

export default function ProjectOverlay({ project, onClose }) {
  const root = useRef(null);
  const closeBtn = useRef(null);

  /* Escape closes; the page behind stays put. */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context((self) => {
      const q = self.selector;
      if (reduced) return;
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from(root.current, { opacity: 0, duration: 0.35, ease: 'none' })
        .from(q('[data-o]'), { opacity: 0, y: 24, duration: 0.9, stagger: 0.07 }, 0.05)
        .from(q('.overlay__hero'), { opacity: 0, y: 38, duration: 1.1 }, 0.25);
    }, root);
    return () => ctx.revert();
  }, [project.id]);

  const [hero, ...rest] = project.frames;

  return (
    <div className="overlay" ref={root} role="dialog" aria-modal="true" aria-label={project.title}>
      <button type="button" className="overlay__close" onClick={onClose} ref={closeBtn}>
        <span className="overlay__close-label">Close</span>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </button>

      <div className="overlay__scroll">
        <div className="overlay__text">
          <p className="label" data-o>{project.service}</p>
          <h2 className="overlay__title" data-o>{project.title}</h2>
          <p className="overlay__blurb" data-o>{project.blurb}</p>
          {project.url && (
            <p data-o>
              <a className="overlay__link" href={project.url} target="_blank" rel="noreferrer">
                {domain(project.url)}
                <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true">
                  <path d="M1 8L8 1M3 1h5v5" stroke="currentColor" strokeWidth="1" fill="none" />
                </svg>
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </p>
          )}
        </div>

        {project.story ? (
          <Story blocks={project.story} title={project.title} />
        ) : (
          <>
            <figure className="overlay__hero">
              {project.live ? (
                <div className="overlay__live"><MoodSketch max={860} /></div>
              ) : project.video ? (
                <video
                  className="overlay__video"
                  src={project.video}
                  poster={hero}
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={hero} alt={`${project.title}, ${project.meta}`} />
              )}
            </figure>

            {!project.live && rest.length > 0 && (
              <div className="overlay__frames">
                {rest.map((src, i) => (
                  <figure key={src} className="overlay__frame">
                    <img src={src} alt={`${project.title}, frame ${i + 2}`} loading="lazy" />
                  </figure>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


/** A case study laid out on the page, rather than a run of exported slides. */
function Story({ blocks, title }) {
  return (
    <div className="story">
      {blocks.map((b, i) =>
        b.note ? (
          <p key={i} className="story__note">{b.note}</p>
        ) : (
          <section key={i} className="story__block">
            <h3 className="story__h">{b.h}</h3>

            {b.p?.map((t) => (
              <p key={t} className="story__p">{t}</p>
            ))}

            {b.diagram && (
              <figure className="story__figure story__figure--dgm">
                <StoryDiagram name={b.diagram} />
                {b.cap && <figcaption className="story__cap">{b.cap}</figcaption>}
              </figure>
            )}

            {b.img && (
              <figure className={`story__figure${b.wide ? ' story__figure--wide' : ''}`}>
                <img src={b.img} alt={`${title}: ${b.h}`} loading="lazy" />
                {b.cap && <figcaption className="story__cap">{b.cap}</figcaption>}
              </figure>
            )}

            {b.cols && (
              <div className="story__cols">
                {b.cols.map((c) => (
                  <figure key={c.label} className="story__col">
                    <p className="story__col-label">{c.label}</p>
                    <img src={c.img} alt={c.label} loading="lazy" />
                    <figcaption className="story__cap">
                      {c.cap}
                      {c.src && <span className="story__src">{c.src}</span>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        ),
      )}
    </div>
  );
}
