/**
 * Recherche, dans l'artefact construit, des données que le brief interdit de
 * publier : faits internes/retenus, adresses internes, références de secrets,
 * et faits publics hors de leurs surfaces autorisées (JSON-LD notamment).
 *
 * Limite connue : la recherche est textuelle. Une valeur retenue identique à
 * un texte public légitime (ex. un nom de ville) produit un faux positif —
 * c'est le sens d'erreur choisi. Les valeurs de moins de 4 caractères ne sont
 * pas recherchées.
 */
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import type { Brief } from '../contracts/brief.ts';
import type { ResolvedConfig } from '../config/resolve.ts';

const TEXTUAL = new Set(['.html', '.xml', '.txt', '.json', '.js', '.mjs', '.css', '.svg', '.webmanifest', '.htaccess', '.conf']);

async function* walk(dir: string): AsyncGenerator<string> {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : typeof v === 'number' ? [String(v)] : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];

export async function findLeaks(outDir: string, brief: Brief, config: ResolvedConfig): Promise<string[]> {
  const forbidden: Array<[string, string]> = [];
  const jsonldForbidden: Array<[string, string]> = [];
  for (const [key, f] of Object.entries(brief.facts)) {
    const projected = config.facts[key];
    for (const s of strings(f.value)) {
      if (s.length < 4) continue;
      if (!projected) forbidden.push([s, `fait « ${key} » (${f.publication}, ${f.status})`]);
      else if (!projected.surfaces.includes('jsonld')) jsonldForbidden.push([s, `fait « ${key} » interdit en JSON-LD`]);
    }
  }
  // Une adresse interne peut coïncider avec la coordonnée publique confirmée : elle est alors publique.
  const publicStrings = new Set(Object.values(config.facts).flatMap((f) => strings(f.value)));
  for (const k of ['recipient', 'from'] as const) {
    const v = brief.email[k];
    if (v && !publicStrings.has(v)) forbidden.push([v, `email.${k} (adresse interne)`]);
  }
  if (brief.email.smtp) forbidden.push([brief.email.smtp.host, 'email.smtp.host']);

  const out: string[] = [];
  for await (const file of walk(outDir)) {
    const name = file.split('/').pop() ?? '';
    if (!TEXTUAL.has(extname(file)) && !name.startsWith('.')) continue;
    const text = await readFile(file, 'utf8');
    const rel = relative(outDir, file);
    for (const [needle, why] of forbidden) if (text.includes(needle)) out.push(`${rel} : ${why}`);
    if (/env:[A-Z][A-Z0-9_]+/.test(text)) out.push(`${rel} : référence de secret (env:…)`);
    if (extname(file) === '.html' && jsonldForbidden.length) {
      const blocks = [...text.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
      for (const [needle, why] of jsonldForbidden) if (blocks.some((b) => b?.includes(needle))) out.push(`${rel} : ${why}`);
    }
  }
  return out;
}
