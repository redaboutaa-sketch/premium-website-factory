/**
 * Intégration Astro de l'usine — interface publique pour `astro.config.ts`.
 *
 * Pourquoi ici et pas seulement dans `npm run build` : un appel direct à
 * `astro build` (ou `astro dev`, `astro preview`) traverse TOUJOURS cette
 * intégration. La validation du brief y est donc impossible à contourner par
 * le chemin de build (écarts E1/E2 de l'audit).
 */
import { existsSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { AstroIntegration, AstroUserConfig } from 'astro';
import type { Brief, Mode } from '../contracts/brief.ts';
import { formatIssues } from '../contracts/issues.ts';
import { checkRules } from '../contracts/rules.ts';
import { loadBrief, siteDir as resolveSiteDir } from '../config/load.ts';
import { type ResolvedConfig, type Target, resolveConfig } from '../config/resolve.ts';
import { findLeaks } from './leaks.ts';

const VIRTUAL_ID = 'virtual:factory/config';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

export class FactoryValidationError extends Error {}

export function targetFromEnv(env: NodeJS.ProcessEnv = process.env): Target {
  const t = env.FACTORY_TARGET?.trim() || 'preview';
  if (t !== 'preview' && t !== 'production') throw new FactoryValidationError(`FACTORY_TARGET inconnu : ${t} (preview | production)`);
  return t;
}

/** Mode de validation exigé par une commande Astro et une cible. */
export function modeFor(command: 'dev' | 'build' | 'preview' | 'sync', target: Target): Mode {
  if (command === 'dev' || command === 'sync') return 'draft';
  return target === 'production' ? 'release' : 'preview';
}

function factoryIntegration(dir: string, brief: Brief, config: ResolvedConfig): AstroIntegration {
  return {
    name: 'premium-website-factory',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, updateConfig, logger }) => {
        const mode = modeFor(command, config.target);
        const issues = checkRules(brief, mode);
        if (issues.length) {
          throw new FactoryValidationError(
            `Brief refusé pour « ${command} » (mode ${mode}, cible ${config.target}) :${formatIssues(issues)}\n`,
          );
        }
        logger.info(`brief valide — mode ${mode}, cible ${config.target}, origine ${config.origin}`);

        // Prototypes de direction : jamais dans un artefact de production.
        const protoDir = join(dir, 'design', 'prototypes');
        if (config.target !== 'production' && existsSync(protoDir)) {
          for (const file of readdirSync(protoDir).filter((f) => f.endsWith('.astro'))) {
            const name = basename(file, '.astro');
            injectRoute({ pattern: `/prototypes/${name}`, entrypoint: join(protoDir, file), prerender: true });
          }
          logger.info('prototypes de direction exposés sous /prototypes/ (hors production)');
        }

        updateConfig({
          vite: {
            plugins: [
              {
                name: 'factory:virtual-config',
                resolveId: (id: string) => (id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : undefined),
                load: (id: string) =>
                  id === RESOLVED_VIRTUAL_ID ? `export default ${JSON.stringify(config)};` : undefined,
              },
            ],
          },
        });
      },
      'astro:build:done': async ({ dir: outDir, logger }) => {
        const leaks = await findLeaks(fileURLToPath(outDir), brief, config);
        if (leaks.length) {
          throw new FactoryValidationError(
            `Donnée non publiable trouvée dans l'artefact :\n${leaks.map((l) => `  ✗ ${l}`).join('\n')}`,
          );
        }
        logger.info('aucune donnée interne ou retenue dans l’artefact');
      },
    },
  };
}

/** Polices déclarées par le site (`<site>/design/fonts.ts`), facultatif. */
async function siteFonts(dir: string): Promise<AstroUserConfig['fonts']> {
  const file = join(dir, 'design', 'fonts.ts');
  if (!existsSync(file)) return undefined;
  const mod = (await import(/* @vite-ignore */ pathToFileURL(file).href)) as { fonts?: AstroUserConfig['fonts'] };
  return mod.fonts;
}

/**
 * Configuration Astro complète pour le site courant.
 * La structure du brief est vérifiée ici (mode draft) ; le mode exigé par la
 * commande est vérifié dans le hook `astro:config:setup`.
 */
export async function factoryConfig(root: string = process.cwd()): Promise<AstroUserConfig> {
  const dir = resolveSiteDir(root);
  const target = targetFromEnv();
  const loaded = await loadBrief(dir, 'draft');
  if (!loaded.ok || !loaded.brief) {
    throw new FactoryValidationError(`Brief invalide (${relative(root, dir) || '.'}) :${formatIssues(loaded.issues)}\n`);
  }
  const config = resolveConfig(loaded.brief, { target });
  const rel = (p: string) => `./${relative(root, join(dir, p)).split('\\').join('/')}`;
  return {
    root,
    srcDir: rel('src'),
    publicDir: rel('public'),
    outDir: process.env.FACTORY_OUT_DIR?.trim() || './dist',
    site: config.origin,
    trailingSlash: 'always',
    build: { format: 'directory' },
    devToolbar: { enabled: false },
    // Shiki émet des styles inline incompatibles avec la CSP par hashes.
    markdown: { syntaxHighlight: false },
    fonts: await siteFonts(dir),
    security: {
      // CSP native : hashes des scripts/styles émis par Astro. Incompatible
      // avec <ClientRouter /> d'après la documentation : la navigation reste MPA.
      csp: {
        directives: [
          "default-src 'self'",
          "img-src 'self' data:",
          "font-src 'self'",
          "connect-src 'self'",
          "form-action 'self'",
          "base-uri 'self'",
          "object-src 'none'",
        ],
      },
    },
    integrations: [factoryIntegration(dir, loaded.brief, config)],
  };
}

export type { ResolvedConfig } from '../config/resolve.ts';
export { factFor } from '../config/resolve.ts';
