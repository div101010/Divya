# Divya — portfolio

Single-page React site. White paper, black ink, Playfair Display for the
headings and Inter for everything with a job to do.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve the production build
```

Deploy `dist/` to any static host (Netlify, Vercel, GitHub Pages, S3). If it
is served from a sub-path, set `base` in `vite.config.js` — the image URLs are
built from `import.meta.env.BASE_URL`, so they follow it.

## Layout

```
src/
  App.jsx                    section order + which project overlay is open
  data/work.js               services, prices, projects, image manifests
  lib/geometry.js            the maths behind every drawn mark
  lib/sparks.js              one-listener bus for asking the layer for a burst
  components/
    Hero.jsx                 masked line reveal, animated scroll cue
    Services.jsx             the four services, full width
    ServiceRow.jsx           one service; "See work" expands the panel
    EffectsLayer.jsx         the drawn pointer, its trail, and page bursts
    MoodSketch.jsx           the Mood sketch, running (p5, instance mode)
    ProjectOverlay.jsx       full-screen project view: text, then the work
    StoryDiagram.jsx         the Leganés diagrams, redrawn as ink
    About.jsx / Contact.jsx
  styles.css                 tokens and all layout
public/work/<project>/NN.jpg  web-sized project images
```

## The pointer

`EffectsLayer` replaces the browser cursor with a small drawn instrument and
keeps a pool of 90 reusable marks behind it. Nothing is a hand-authored path:
`lib/geometry.js` evaluates each shape from a formula and serialises it.

- **The cursor** is a dashed dial with a five-petal rhodonea curve, `r = a·cos(kθ)`,
  turning inside it, three dots on a tilted parametric orbit, and a plate number
  reading how far down the page you are. It leans into the direction of travel
  and opens up over links and buttons.
- **The trail** throws off marks from the same vocabulary: dots, petals from the
  leaf construction, short constellation segments, and catalogue numbers. Count
  scales with pointer speed, up to three per event; each blooms and fades inside
  a second. Black, with gold on every ninth mark and blue on every fourteenth.
- **The idle flower** opens 420ms after the pointer stops, drawing itself on via
  `stroke-dashoffset` while it scales up, then fading.
- **Bursts** at the centre of the screen fire as each service arrives, through
  `lib/sparks.js`, and clear in half a second.

Transforms are written straight onto the elements instead of going through
GSAP's SVG transform handling, so each mark rotates and scales about its own
origin wherever it has been flung.

The cursor is only taken over on a fine pointer with hover, and never under
`prefers-reduced-motion`; the `has-cursor` class that hides the native cursor is
added by the layer at runtime, so a failed script still leaves a usable pointer.

The hero's scroll cue carries the same vocabulary: a pulsing dashed ring with
dots on their own orbit. Scrolling takes it apart, retracting the shaft,
turning the arrowhead loose and scattering the dots.

## Editing the work

Everything shown comes from `src/data/work.js` — service names, prices,
descriptions, project titles and blurbs. Images live in
`public/work/<project>/` and are numbered; `frames('polaris', 8)` means
`01.jpg` through `08.jpg`, and `01.jpg` leads.

A project opens with its paragraph, then the work. Three optional fields
change what it shows:

| field   | effect |
| ------- | ------ |
| `url`   | adds a link to the live site under the paragraph |
| `video` | plays instead of the opening image, with `frames[0]` as the poster |
| `live`  | embeds the running sketch instead of stills |
| `story` | a laid-out case study instead of a plain run of frames |

### Leganés, and the `story` field

The Leganés material arrived as exported slides on a peach field. Rather than
posting the slides as pictures, the project is rebuilt on the page: the copy is
real text in the site's own faces, the photographic and screen evidence is cut
off its slide background (`scripts/` note below), and the two conceptual
diagrams are redrawn as inline SVG in `StoryDiagram.jsx`, placing their nodes on
an ellipse the same way the margin plate places its orbits. Below 900px the
radial plans would be too small to read, so they are set as lists carrying the
same relationships.

A `story` is a list of blocks. `{ h, p }` is a heading and paragraphs;
add `img` (plus `wide` for a full-bleed plate) or `diagram: 'cycle' | 'framework'`
or `cols` for a row of captioned evidence; `{ note }` renders the closing
disclaimer.

The originals in `../services/` are up to 23 MB each. They were downscaled to
1800 px JPEGs (206 MB → 6.8 MB) before being placed in `public/`. Re-run that
step with `sips` if you add more:

```sh
sips -s format jpeg -s formatOptions 72 -Z 1800 source.png --out public/work/slug/01.jpg
```

The Leganés slide content was cut off its peach background by finding the
connected regions of non-background pixels, trimming any edge still sitting on
the slide field, and repainting the remaining background white. The one-off
script for that is not part of the build.

The Space Odyssey film was 4K and 33 MB. It ships as 1080p H.264 at
7.8 MB, encoded with a static ffmpeg (macOS has no system one, and
`avconvert`'s presets only made it larger):

```sh
ffmpeg -i "space odyssey .mp4" -vf scale=1920:-2 -c:v libx264 -profile:v high \
  -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 96k public/work/space-odyssey/film.mp4
```

## Notes

- **Mood** is the original Processing sketch ported to p5 instance mode. It
  runs live in the Creative Technology panel and full size in its overlay;
  p5 is a lazy chunk, so it only downloads when the sketch first mounts.
- The film uses `preload="metadata"`, so none of its 7.8 MB is fetched until
  someone presses play.
- `prefers-reduced-motion` is respected: the plate renders complete, and
  nothing loops.
