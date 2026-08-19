import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EMAIL = 'divyasirohi.945868@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/divya-7755dv75/';
const BRIEF = 'https://tally.so/r/wbEba7';

/** "https://www.linkedin.com/in/divya-7755dv75/" -> "linkedin.com/in/divya-7755dv75" */
const domain = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export default function Contact() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context((self) => {
      gsap.from(self.selector('[data-rise]'), {
        opacity: 0, y: 30, duration: 1.2, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 76%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="contact" ref={root} aria-label="Contact">
      <p className="contact__lede" data-rise>
        Tell me about your project. I&rsquo;ll get back within 24 hours.
      </p>

      <p data-rise>
        <a className="contact__cta" href={BRIEF} target="_blank" rel="noreferrer">
          Start a project
          <svg width="10" height="10" viewBox="0 0 9 9" aria-hidden="true">
            <path d="M1 8L8 1M3 1h5v5" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
          <span className="visually-hidden"> (opens a short form in a new tab)</span>
        </a>
      </p>

      <ul className="contact__list">
        <li data-rise>
          <span className="label">Email</span>
          <a className="contact__link" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </li>
        <li data-rise>
          <span className="label">LinkedIn</span>
          <a className="contact__link" href={LINKEDIN} target="_blank" rel="noreferrer">
            {domain(LINKEDIN)}
          </a>
        </li>
      </ul>
    </section>
  );
}
