import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context((self) => {
      gsap.from(self.selector('.about__p'), {
        opacity: 0, y: 34, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 72%' },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="about" ref={root} aria-label="About">
      <p className="about__p">
        I&rsquo;ve delivered projects across the world for government bodies, private
        companies and startups. I work across brand, web, research and creative
        technology. Pricing is always open to conversation. If you have a project,
        let&rsquo;s talk.
      </p>
    </section>
  );
}
