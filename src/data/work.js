/**
 * Services and their projects.
 *
 *   description  the line under the service name, spoken to the client
 *   blurb   the paragraph at the top of the project view
 *   url     live site, linked from the project view (optional)
 *   video   plays in place of the opening image (optional)
 *   live    the piece is a running sketch rather than a still (optional)
 *   story   a laid-out case study, used instead of a plain run of frames
 *   frames  images; `frames[0]` leads, and doubles as the video poster
 */

const L = `${import.meta.env.BASE_URL}work/leganes/`;

const frames = (slug, n) =>
  Array.from({ length: n }, (_, i) => `${import.meta.env.BASE_URL}work/${slug}/${String(i + 1).padStart(2, '0')}.jpg`);

export const SERVICES = [
  {
    id: 'brand',
    name: 'Brand Strategy',
    price: 800,
    description:
      'I will help you with defining who you are, what you stand for, and how the world sees you.',
    projects: [
      {
        id: 'polaris',
        title: 'Polaris Consult',
        meta: 'Identity system · Consulting',
        blurb:
          'Polaris Consult is a forward-thinking consultancy that empowers individuals and businesses to reach new heights. In this project, I crafted a brand identity that reflects the company’s core values of innovation, growth, and human-centered approach. By conducting in-depth research and strategic planning, I designed a visual language that captures the essence of Polaris Consult and inspires confidence in their clients.',
        frames: frames('polaris', 8),
      },
    ],
  },
  {
    id: 'web',
    name: 'Web Design & Development',
    price: 1500,
    description:
      'I will help you with designing and building your website or product from concept to deployed.',
    projects: [
      {
        id: 'particle',
        title: 'Personal website',
        meta: 'Particle system · WebGL',
        url: 'https://divyacom.vercel.app/',
        blurb:
          'My own site opens on an empty field of drifting particles that cluster into constellations, each one a piece of work waiting to be opened. Everything is simulated rather than placed: the particles carry their own velocity and attraction, so the arrangement is never twice the same and the page reads as a night sky you navigate instead of a menu you scroll.',
        frames: frames('particle', 4),
      },
      {
        id: 'streetreader',
        title: 'StreetReader',
        meta: 'React + Supabase',
        url: 'https://street-reader-com.vercel.app/',
        blurb:
          'StreetReader is a sensory re-reading of Madrid’s Gran Vía that maps the corridor through the people who live and walk it: their memories, their senses, their grievances, set alongside the architectural plan. The interface is a zoomable plan of the street built in React, with sensory readings and resident submissions stored in Supabase, organised around four pillars: ecological integration, spatial justice, organic design and participatory agency.',
        frames: frames('streetreader', 4),
      },
    ],
  },
  {
    id: 'research',
    name: 'Strategic Research & Insight Reports',
    price: 500,
    description:
      'I will help you with researching any topic deeply and delivering a clear report you can act on.',
    projects: [
      {
        id: 'leganes',
        title: 'Leganés Norte',
        meta: 'Urban research · Comunidad de Madrid',
        blurb:
          'An urban systems analysis of Leganés Norte, delivered to the Comunidad de Madrid as the framework for an urban competition. The work traced how mobility, housing, green space and public facilities actually interact across the district, then reduced that to a set of positions a jury and a government team could act on. The research is dense, the deliverable is not.',
        frames: [`${L}site.jpg`],
        story: [
          {
            h: 'Context',
            p: [
              'Developed as part of the IE Center for Sustainable Cities in collaboration with the Comunidad de Madrid and Ayuntamiento de Leganés, this project contributed to the strategic foundation of a large-scale urban development and future international design competition.',
              'The objective was to define the conditions, constraints and opportunities of the site, so that future design proposals could respond to its complexity.',
            ],
          },
          {
            h: 'Site',
            p: ['North Leganés, Madrid, Spain. Urban development site.'],
            img: `${L}site.jpg`,
            wide: true,
            cap: 'Source: Comunidad de Madrid',
          },
          {
            h: 'Strategic role',
            p: [
              'Developed the analytical foundation of the project by structuring multi-layered urban data into a coherent system to inform strategic decision-making.',
            ],
            diagram: 'cycle',
            cap: 'Iterative process of constructing a multi-layered urban system from fragmented data.',
          },
          {
            h: 'Urban system framework',
            p: ['A multi-layered framework to understand the territory as an interconnected urban system.'],
            diagram: 'framework',
            cap: 'From fragmented data to systemic urban understanding.',
          },
          {
            h: 'System dynamics',
            p: [
              'Understanding how layered systems interact to produce urban conditions. Systems do not operate independently, their interactions define the city.',
            ],
            cols: [
              {
                label: 'Mobility → Emissions → Air quality',
                img: `${L}dynamics-1.jpg`,
                cap: 'Mobility patterns directly shape emission levels and urban air quality.',
                src: 'Source: Comunidad de Madrid',
              },
              {
                label: 'Urban structure → Accessibility → Mobility behaviour',
                img: `${L}dynamics-2.jpg`,
                cap: 'Urban form directly determines accessibility, which shapes how people move.',
                src: 'Source: Sony 15-min city',
              },
              {
                label: 'Natural systems → Urbanization → Ecological fragmentation',
                img: `${L}dynamics-3.jpg`,
                cap: 'Urban development has transformed natural systems, but these still structure the territory and offer opportunities.',
                src: 'Source: Comunidad de Madrid',
              },
            ],
          },
          {
            h: 'Acknowledgement',
            p: ['The contribution is credited in the final institutional report.'],
            img: `${L}acknowledgement.jpg`,
            cap: 'From the acknowledgements of the final report for the Consorcio Urbanístico Leganés Norte. IE Center for Sustainable Cities, December 2025.',
          },
          {
            note: 'Due to the ongoing nature of the project and its institutional context, selected materials are presented to illustrate the analytical approach without disclosing the full report.',
          },
        ],
      },
    ],
  },
  {
    id: 'creative',
    name: 'Creative Technology & Interactive Experiences',
    price: 1000,
    description:
      'I will help you with building something people haven’t seen before: 3D, generative, interactive.',
    projects: [
      {
        id: 'space-odyssey',
        title: 'Space Odyssey',
        meta: '3D animated short',
        video: `${import.meta.env.BASE_URL}work/space-odyssey/film.mp4`,
        blurb:
          'A 3D animated short set in 2072, after humanity has colonised Mars and begun to explore the unknown universe. It runs from a launch site on a Moonbase out to the outer solar system near Saturn, through a wormhole called the Saturn Gate, and into the Unknown. I directed it with Lydia, and built and animated the Moonbase launch site, the Saturn approach and the Gate sequence. It closes on the line the whole thing is built around: be curious and explore.',
        frames: frames('space-odyssey', 6),
      },
      {
        id: 'mood',
        title: 'Mood',
        meta: 'Live interactive canvas',
        live: true,
        blurb:
          'Mood is a running sketch, not a recording: it reads your cursor and draws what it finds. Speed becomes energy and sudden changes of direction become confusion. Together they pick the colour, from calm blue through happy yellow to angry red and violet sadness, and they deform the ring, which is redrawn every frame from a few hundred noise-displaced arcs. Move across it and it answers.',
        frames: frames('mood', 1),
      },
    ],
  },
];

export const PROJECTS = Object.fromEntries(
  SERVICES.flatMap((s) => s.projects.map((p) => [p.id, { ...p, service: s.name }])),
);
