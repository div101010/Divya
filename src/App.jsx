import { useCallback, useState } from 'react';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import ProjectOverlay from './components/ProjectOverlay';
import EffectsLayer from './components/EffectsLayer';
import { PROJECTS } from './data/work';
import './styles.css';

export default function App() {
  const [openId, setOpenId] = useState(null);
  const close = useCallback(() => setOpenId(null), []);
  const project = openId ? PROJECTS[openId] : null;

  return (
    <>
      <main>
        <Hero />
        <Services onOpenProject={setOpenId} moodPaused={openId === 'mood'} />
        <About />
        <Contact />
      </main>
      {project && <ProjectOverlay project={project} onClose={close} />}
      <EffectsLayer />
    </>
  );
}
