# Jholan Ligon · Portfolio

**Four Rooms.** Each product lives in the real place it was built for: the workshop (TopCraft),
the training floor (VoiceLink Academy), the walk home (FemiSafe) and the palengke (FoodWais).
The site is a calm gallery; each room switches to that product's own brand.

Built with [Astro 5](https://astro.build): static HTML, about 10 KB of JavaScript per page,
responsive images generated at build time, and no UI framework.

## Run it

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ at http://localhost:4321
```

Requires Node 20 or newer.

## Deploy

`dist/` is a plain static site, so any static host works.

- **Vercel / Netlify / Cloudflare Pages:** build command `npm run build`, output directory `dist`.
- Set the environment variable `SITE_URL` (e.g. `https://jholanligon.dev`) to turn on canonical
  URLs, absolute social-preview links and `sitemap-index.xml`.

The three films (77 MB in total) are in `public/media/`, and they all fit under the common 100 MB
per-file limits.

## Edit content

| What | Where |
|---|---|
| Name, school, links (email, LinkedIn, résumé), skills, timeline | `src/data/profile.ts` |
| A project's text, facts, colours, media and page sections | `src/content/projects/<slug>.yaml` |
| Images | `src/assets/projects/<slug>/` (Astro optimises them on build) |
| Videos, preview loops | `public/media/<slug>/` |

Empty fields in `profile.ts` are hidden, so nothing half-finished shows up on the site.

**To replace a screenshot**, overwrite the file and keep its name, or point the YAML at a new file.
**To replace a video**, overwrite `public/media/<slug>/film.mp4`, then update `duration` and
`chapters` in the YAML. Re-encoding isn't needed for H.264/AAC MP4s exported with "fast start".

### Pulling media from `Portfolio-Assets/`

`npm run media` copies the curated originals into the site. It never modifies
`Portfolio-Assets/`. It also derives the posters, the muted preview loops and the FoodWais film
stills, using ffmpeg (set `FFMPEG=path\to\ffmpeg.exe`). Existing files are skipped unless you pass
`-- --force`.

## Add a project

1. Copy one of the YAML files in `src/content/projects/` and change the facts, theme and media.
2. Choose its `sections` from the available blocks: `brief`, `film`, `features`, `gallery` (rail,
   grid or phones), `tabs`, `pipeline`, `roles`, `scenes`, `storyboard`, `architecture`,
   `decisions`, `engineering`, `quote`, `note`, `contribution` and `stack`. The case-study page at
   `/work/<slug>` is generated from that list.
3. Its row in the room index on the home page appears automatically. For a full home-page room,
   add a component in `src/components/home/` and register it in `src/pages/index.astro`.

The schema in `src/content.config.ts` validates every file. A typo or an unquoted comma in YAML
fails the build instead of silently dropping text.

## Still to confirm before publishing

Every YAML file has a `confirm:` list (never rendered) of facts that the project media doesn't
show. Nothing in that list appears on the site until you add it.
