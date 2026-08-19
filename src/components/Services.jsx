import ServiceRow from './ServiceRow';
import { SERVICES } from '../data/work';

export default function Services({ onOpenProject, moodPaused }) {
  return (
    <section className="services" aria-label="Services">
      <div className="services__list">
        {SERVICES.map((s) => (
          <ServiceRow
            key={s.id}
            service={s}
            onOpenProject={onOpenProject}
            moodPaused={moodPaused}
          />
        ))}
      </div>
    </section>
  );
}
