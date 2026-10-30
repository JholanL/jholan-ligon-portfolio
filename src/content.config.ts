import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * One YAML file per project in src/content/projects/.
 * Image paths are relative to the YAML file; Astro validates and optimises them at build time.
 * The `sections` list decides the order and kind of blocks on the project's case-study page,
 * so each project can tell its story differently without new page code.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/projects' }),
  schema: ({ image }) => {
    const media = z.strictObject({
      src: image(),
      alt: z.string(),
      title: z.string().optional(),
      caption: z.string().optional(),
      /** wide = 16:9 panel, phone = portrait store art, screen = raw phone capture (gets a device frame) */
      kind: z.enum(['wide', 'phone', 'screen']).default('wide'),
    });

    const section = z.discriminatedUnion('type', [
      z.object({
        type: z.literal('brief'),
        problem: z.string(),
        people: z.array(z.object({ name: z.string(), text: z.string() }).strict()),
        product: z.string(),
      }),
      z.object({ type: z.literal('film'), title: z.string(), intro: z.string().optional() }),
      z.object({
        type: z.literal('features'),
        title: z.string(),
        intro: z.string().optional(),
        items: z.array(z.object({ eyebrow: z.string().optional(), title: z.string(), body: z.string(), points: z.array(z.string()).optional(), media }))
      }),
      z.object({
        type: z.literal('gallery'),
        title: z.string(),
        intro: z.string().optional(),
        style: z.enum(['rail', 'grid', 'phones']),
        items: z.array(media),
      }),
      z.object({
        type: z.literal('tabs'),
        title: z.string(),
        intro: z.string().optional(),
        tabs: z.array(z.object({ label: z.string(), style: z.enum(['grid', 'phones']), items: z.array(media) })),
      }),
      z.object({
        type: z.literal('pipeline'),
        title: z.string(),
        intro: z.string().optional(),
        stages: z.array(z.object({ name: z.string(), note: z.string().optional() }).strict()),
        media: media.optional(),
      }),
      z.object({
        type: z.literal('roles'),
        title: z.string(),
        intro: z.string().optional(),
        roles: z.array(z.object({ name: z.string(), surface: z.string(), text: z.string(), points: z.array(z.string()).default([]), media })),
      }),
      z.object({
        type: z.literal('scenes'),
        title: z.string(),
        intro: z.string().optional(),
        scenes: z.array(z.object({ title: z.string(), body: z.string(), points: z.array(z.string()).optional(), screens: z.array(media).min(1).max(2) })),
      }),
      z.object({
        type: z.literal('storyboard'),
        title: z.string(),
        intro: z.string().optional(),
        frames: z.array(z.object({ t: z.number(), title: z.string(), body: z.string(), media }).strict()),
      }),
      z.object({
        type: z.literal('architecture'),
        title: z.string(),
        intro: z.string().optional(),
        nodes: z.array(z.object({ name: z.string(), detail: z.string(), items: z.array(z.string()) })),
        links: z.array(z.string()),
      }),
      z.object({
        type: z.literal('decisions'),
        title: z.string(),
        intro: z.string().optional(),
        items: z.array(z.object({ title: z.string(), body: z.string(), source: z.string().optional() }).strict()),
      }),
      z.object({
        type: z.literal('engineering'),
        title: z.string(),
        intro: z.string().optional(),
        stats: z.array(z.object({ value: z.string(), label: z.string() })),
        note: z.string().optional(),
      }),
      z.object({ type: z.literal('quote'), quote: z.string(), translation: z.string().optional(), attribution: z.string().optional() }),
      z.object({ type: z.literal('note'), title: z.string(), body: z.string() }),
      z.object({
        type: z.literal('contribution'),
        title: z.string().default('My part'),
        mine: z.array(z.string()),
        team: z.array(z.string()).optional(),
        note: z.string().optional(),
      }),
      z.object({ type: z.literal('stack'), title: z.string().default('Built with'), groups: z.array(z.object({ name: z.string(), items: z.array(z.string()) })), note: z.string().optional() }),
    ]);

    return z.object({
      order: z.number(),
      name: z.string(),
      /** The "room" this product lives in: the real place it is built for. */
      place: z.string(),
      tagline: z.string(),
      summary: z.string(),
      year: z.string().optional(),
      kind: z.string(),
      team: z.string(),
      platforms: z.array(z.string()),
      status: z.string().optional(),
      stackShort: z.array(z.string()).default([]),
      theme: z.object({
        bg: z.string(),
        surface: z.string(),
        ink: z.string(),
        muted: z.string(),
        line: z.string(),
        accent: z.string(),
        /** accent that passes contrast for small text on bg */
        accentText: z.string(),
        onAccent: z.string(),
        /** secondary brand colour used sparingly (VoiceLink gold, FemiSafe SOS red...) */
        highlight: z.string().optional(),
        font: z.string(),
        scheme: z.enum(['light', 'dark']),
      }),
      hero: z.enum(['editorial', 'console', 'night', 'market']),
      cover: media,
      heroMedia: media,
      preview: z.string().optional(),
      film: z
        .object({
          src: z.string(),
          poster: image(),
          duration: z.number(),
          caption: z.string(),
          chapters: z.array(z.object({ t: z.number(), label: z.string() })),
        })
        .optional(),
      facts: z.array(z.object({ label: z.string(), value: z.string() }).strict()),
      links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
      /** Home-page room: a short, bespoke composition per product. */
      room: z.object({
        headline: z.string(),
        accent: z.string().optional(),
        text: z.string(),
        points: z.array(z.string()).default([]),
        media: z.array(media).default([]),
        tabs: z.array(z.object({ label: z.string(), text: z.string(), media })).default([]),
      }),
      sections: z.array(section),
      /** Not rendered. Things the owner still needs to confirm before they can be published. */
      confirm: z.array(z.string()).default([]),
    });
  },
});

/**
 * One YAML file per certificate in src/content/certificates/, shown newest first on the home page.
 * `preview` is an image of the certificate (for a PDF, an image of its first page);
 * `file` is the original under public/ that "View original" opens.
 */
const certificates = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/certificates' }),
  schema: ({ image }) =>
    z.strictObject({
      title: z.string(),
      issuer: z.string(),
      /** First (or only) day, YYYY-MM-DD. Used for sorting and the machine-readable date. */
      date: z.coerce.date(),
      /** How the date reads on the card, e.g. "October 9–10, 2026". Defaults to the month and year. */
      dateLabel: z.string().optional(),
      /** Certificate type as printed, e.g. "Certificate of Participation". */
      type: z.string(),
      /** Short grouping label shown as a chip, e.g. "Hackathon", "Seminar", "Conference". */
      category: z.string(),
      venue: z.string().optional(),
      summary: z.string().optional(),
      preview: image(),
      previewAlt: z.string(),
      file: z.string().regex(/^\/certificates\//, 'Put the original in public/certificates/'),
      /** A portfolio page this certificate relates to, e.g. the project built at a hackathon. */
      related: z.object({ label: z.string(), href: z.string() }).optional(),
      /** Optional public verification link from the issuer. */
      verifyUrl: z.string().url().optional(),
    }),
});

export const collections = { projects, certificates };
