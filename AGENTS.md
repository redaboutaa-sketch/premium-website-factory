# Règles communes aux agents — Premium Website Factory

Ce fichier est la source unique des invariants. `CLAUDE.md` l'importe ; ne pas dupliquer ces règles ailleurs.

## Ce qu'est ce dépôt
Un template : `engine/` (moteur générique, mis à jour par l'usine) + un site client (`site/`, ou `examples/<fixture>` via `FACTORY_SITE_DIR`).

## Commandes réelles (vérifiées)
| Commande | Effet |
|---|---|
| `npm ci` | installation verrouillée (Node 26.13.1 de référence, 24.22.3+ supporté) |
| `npm run factory:init -- --example <nom>` ou `-- --brief <chemin>` | crée `site/` ; refuse d'écraser un site existant |
| `npm run factory:validate -- --mode draft\|preview\|release [--production]` | valide le brief, erreurs groupées |
| `npm run factory:doctor` | diagnostic d'environnement, sans afficher de secret |
| `npm run factory:schema [-- --check]` | régénère/vérifie `engine/contracts/brief.schema.json` |
| `npm run dev` / `npm run build` | Astro ; la validation du brief s'exécute aussi sur `astro build` direct |
| `npm run check` | schéma à jour + `astro check` + `tsc` du moteur |
| `npm test` | Vitest : contrats, rejets, frontières, builds réels |
| `npm run shots:prototype` | captures des prototypes sous la CSP de l'artefact (après `npm run build`) |

Les commandes `release`, `qa`, `qa:release`, `qa:remote`, `factory:upgrade` du contrat public ne sont **pas encore implémentées** (incréments 2 et 5). Ne pas les présenter comme disponibles.

Variables non secrètes : `FACTORY_SITE_DIR`, `FACTORY_TARGET` (`preview` par défaut, `production` exige un brief `release`), `FACTORY_OUT_DIR`, `PW_CHROMIUM_PATH`.

## Invariants
1. `engine/` n'importe jamais `site/` ni `examples/` ; un site n'importe que `@engine/<module>` et `virtual:factory/config` (test : `engine/tests/boundaries.test.ts`).
2. Le brief ne contient aucun secret : seulement des références `env:NOM`. Le schéma est strict.
3. Les pages ne lisent que la configuration résolue (`virtual:factory/config`) : faits projetés selon `publication`, jamais d'adresse interne.
4. Un fait `proposed` n'est jamais promu `confirmed` par un agent. Statut et publication sont des décisions humaines.
5. Le domaine web ne détermine ni l'expéditeur, ni le destinataire, ni la preview.
6. Pas de `unsafe-inline` / `unsafe-eval` en CSP ; navigation MPA (pas de `<ClientRouter />`, incompatible avec la CSP native d'Astro).
7. Aucun actif sans droits établis ; aucune image produit générée ou retouchée de façon trompeuse.
8. Aucune réussite déclarée sans sortie de commande observée ; les vérifications externes restent `pending_external`.
9. Publication réelle : uniquement sur autorisation explicite pour cette cible et cette version.

## Frontières de modification
- Agent travaillant pour un client : modifier `site/` (contenu, design, pages). Ne pas modifier `engine/` pour un besoin d'un seul client.
- Évolution de l'usine : `engine/`, `.github/`, `docs/`, avec tests de rejet associés.

## Décisions
Décisions propres au site : `<site>/decisions/`. Décisions d'architecture de l'usine : `docs/adr/`.
