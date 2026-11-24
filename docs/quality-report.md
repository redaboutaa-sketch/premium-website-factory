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
| CI complète | `.github/workflows/ci.yml` | CI | run 4 : succès (voir ci-dessous) |

## CI observée
| Run | Commit | Jobs | Conclusion |
|---|---|---|---|
| [45382410714](https://github.com/redaboutaa-sketch/premium-website-factory/actions/runs/45382410714) | `09ceb96` (incrément 1) | validate (Node 26.13.1, 24.22.3) | succès |
| [45392424365](https://github.com/redaboutaa-sketch/premium-website-factory/actions/runs/45392424365) | `f96a6e4` | — | annulé (remplacé par le run 3, `cancel-in-progress`) |
| [45392531749](https://github.com/redaboutaa-sketch/premium-website-factory/actions/runs/45392531749) | `3233a79` | validate ×2 : succès · recipe : **échec** après 26 contrôles réussis — le script de recette (utilisateur non root) ne pouvait pas effacer le compteur de débit créé par `www-data` ; défaut du script, pas de l'endpoint | échec |
| [45393386104](https://github.com/redaboutaa-sketch/premium-website-factory/actions/runs/45393386104) | `0f6e929` | validate (Node 26.13.1, 24.22.3) · recipe | **succès** |

Détail du run 4, job `recipe` (journal GitHub Actions) :
- navigateurs de la révision Playwright 1.65.1 : **Chromium 159.0.8154.6, Firefox 159.0, WebKit 27.2** ;
- parité JS/PHP sur l'image PHP 8.4 : réussie ;
- release assemblée et auditée, `qa:release` (empreintes + ré-audit) : réussi ; 131 fichiers (archive Composer « dist » disponible sur le runner ; 288 en local avec repli sur les sources) ;
- recette nginx 1.30.8 + PHP 8.4.28 : **62/62 contrôles** (HTTP, en-têtes, surfaces non servies, rejets, capture SMTP, panne de transport, parcours sans et avec JavaScript sur les trois moteurs, limitation de débit, journaux sans corps de message) ;
- revue visuelle (Chromium 159) : 5 pages × 4 largeurs, aucun problème relevé ;
- rapports et captures : artefact `recette-0f6e929…` (rétention 14 jours).

## Ce qui reste `pending_external` ou non couvert
- Réception dans une boîte réelle, en-têtes SPF/DKIM/DMARC, DNS, TLS : aucun domaine ni boîte autorisés (démo fictive).
- Hébergement réel, bascule atomique et rollback sur serveur : non exécutés.
- Profils `apache-shared` et `vps-proxy` : non implémentés.
- Performance labo (Lighthouse) et terrain : non mesurées à ce stade.
- Zoom texte 200 %, lecteurs d'écran : non testés ; revue humaine du rendu : en attente du propriétaire.
