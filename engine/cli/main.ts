#!/usr/bin/env node
/**
 * CLI publique de l'usine. Exécutée directement par Node (suppression des
 * types natifs) : le moteur n'emploie que de la syntaxe TypeScript effaçable
 * (`erasableSyntaxOnly` dans tsconfig), sans enum ni namespace.
 */
import { parseArgs } from 'node:util';
import { doctor } from './doctor.ts';
import { init } from './init.ts';
import { schema } from './schema.ts';
import { validate } from './validate.ts';

const HELP = `Premium Website Factory — commandes

  init      --brief <chemin> | --example <nom>   crée site/ (refuse d'écraser un site existant)
  validate  --mode draft|preview|release [--production]   valide le brief du site courant
  doctor                                          vérifie l'environnement, sans afficher de secret
  schema    [--check]                             génère (ou vérifie) le JSON Schema du brief

Variables : FACTORY_SITE_DIR (répertoire du site, défaut site/), FACTORY_TARGET (preview|production).
Utilisation via npm : npm run factory:validate -- --mode release`;

const [command, ...rest] = process.argv.slice(2);

const { values } = parseArgs({
  args: rest,
  options: {
    brief: { type: 'string' },
    example: { type: 'string' },
    mode: { type: 'string' },
    production: { type: 'boolean', default: false },
    check: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  strict: true,
});

async function main(): Promise<number> {
  if (!command || values.help || command === 'help') {
    console.log(HELP);
    return command ? 0 : 2;
  }
  switch (command) {
    case 'init':
      return init({ brief: values.brief, example: values.example });
    case 'validate':
      return validate({ mode: values.mode, production: values.production });
    case 'doctor':
      return doctor();
    case 'schema':
      return schema({ check: values.check });
    default:
      console.error(`Commande inconnue : ${command}\n\n${HELP}`);
      return 2;
  }
}

main().then(
  (code) => process.exit(code),
  (e: unknown) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  },
);
