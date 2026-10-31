import type { APIRoute } from 'astro';
import { buildKnowledge } from '../data/knowledge';

// Prerendered at build time: a static file of verified answers, searched in the browser.
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildKnowledge()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
