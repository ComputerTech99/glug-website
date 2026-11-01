import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const events = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      venue: z.string(),
      type: z.enum(['workshop', 'talk', 'hacknight', 'installfest', 'other']),
      poster: image().optional(),
      summary: z.string().max(160),
      registerUrl: z.url().optional(),
      photos: z.array(z.object({ src: image(), alt: z.string() })).optional(),
    }),
});

const team = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/team' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      year: z.number().int(),
      photo: image(),
      github: z.url().optional(),
      linkedin: z.url().optional(),
      alumni: z.boolean().default(false),
      order: z.number().optional(),
    }),
});

export const collections = { events, team };
