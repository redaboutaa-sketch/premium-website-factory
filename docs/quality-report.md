# Rapport qualité — résultats observés

Seuls figurent des résultats de commandes réellement exécutées, avec leur environnement. « Local » = session de développement (conteneur Linux, Node 26.13.1, PHP CLI 8.3.6, Docker 29.9.3, **Chromium 158 préinstallé, hors révision Playwright**). « CI » = GitHub Actions.

## Incrément 2 — 2026-11-24

| Contrôle | Commande | Environnement | Résultat |
|---|---|---|---|
| Types et schéma | `npm run check` | local | 0 erreur, 0 avertissement ; JSON Schema à jour |
| Tests (contrats, rejets, frontières, builds réels, parité, release, réutilisation) | `npm test` | local | 7 fichiers, 66 tests passés |
| Parité JS/PHP (22 vecteurs) | `vitest run engine/tests/form-parity.test.ts` | local, PHP 8.3.6 et image `php:8.4-fpm-alpine` (8.4.28) | identique sur les deux |
| Release A | `npm run release -- --profile vps-nginx --profile-json tests/recipe/profile.json` | local | 26 contrôles d'audit, 0 bloquant ; `vendorSource: source-fallback` (archive dist Composer inaccessible localement) |
| Reproductibilité | deux assemblages successifs | local | même identité, `SHA256SUMS` identiques |
| Recette nginx + PHP-FPM | `npm run qa:recipe -- --release <dir>` | local : nginx 1.30.8 + PHP 8.4.28 (images épinglées par digest), Chromium 158 | 44/44 contrôles (rapport : `.generated/reports/<id>/recipe.json`, non versionné) |
| Revue visuelle outillée | `node tests/visual/review.ts` | local, Chromium 158 | 5 pages × 4 largeurs : 0 débordement, 0 violation CSP, cibles conformes |
| Fixture B | `astro build` | local | construite sans modification du moteur ; aucune fuite croisée (test) |
| CI complète | `.github/workflows/ci.yml` | CI | voir section CI ci-dessous |

## CI observée
| Run | Commit | Jobs | Conclusion |
|---|---|---|---|
| [45382410714](https://github.com/redaboutaa-sketch/premium-website-factory/actions/runs/45382410714) | `09ceb96` (incrément 1) | validate (Node 26.13.1, 24.22.3) | succès |

## Ce qui reste `pending_external` ou non couvert
- Réception dans une boîte réelle, en-têtes SPF/DKIM/DMARC, DNS, TLS : aucun domaine ni boîte autorisés (démo fictive).
- Hébergement réel, bascule atomique et rollback sur serveur : non exécutés.
- Profils `apache-shared` et `vps-proxy` : non implémentés.
- Performance labo (Lighthouse) et terrain : non mesurées à ce stade.
- Zoom texte 200 %, lecteurs d'écran : non testés ; revue humaine du rendu : en attente du propriétaire.
