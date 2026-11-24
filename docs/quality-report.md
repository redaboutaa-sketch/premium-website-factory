# Rapport qualité — résultats observés

Seuls figurent des résultats de commandes réellement exécutées, avec leur environnement. « Local » = session de développement (conteneur Linux, Node 26.13.1, PHP CLI 8.3.6, Docker 29.9.3, **Chromium 158 préinstallé, hors révision Playwright**). « CI » = GitHub Actions.

## Incrément 5 — 2026-11-24 (bascule, rollback, mise à jour de l'usine)

| Contrôle | Commande | Environnement | Résultat |
|---|---|---|---|
| Bascule / rollback / intégrité | `npm run qa:deploy` | local : `factory-deploy.sh` exécuté dans le conteneur nginx 1.30.8 (busybox), PHP-FPM 8.4.28, 3 releases réelles | **18/18** : v1 → v2 sous trafic (484 requêtes, 0 erreur), pages ET PHP basculés sans redémarrer PHP-FPM, rollback puis réactivation, archive altérée / empreinte erronée / empreinte absente refusées, v3 défaillante → retour automatique, liste, purge, journal. 3 relances keep-alive côté client de test hors charge (comportement attendu après `nginx -s reload`, documenté) |
| Mise à jour de l'usine | `vitest run tests/integration/upgrade.test.ts` | local, copie client git réelle | 3/3 : conflit détecté et jamais écrasé ; empreinte / version / archive erronées refusées ; application sur `factory-upgrade/0.2.0`, `site/` inchangé, site toujours valide ; retour arrière |
| Plan et migrations | `engine/tests/upgrade-plan.test.ts`, `engine/tests/migrations.test.ts` | local | 10/10 |
| Suite complète | `npm test` | local | 10 fichiers, 79 tests |
| Manifeste | `factory:manifest --check` | local | 149 fichiers gérés, à jour |

Non couvert : serveur réel, TLS, attestation de provenance signée, profil Apache mutualisé.

## Incrément 3 — 2026-11-24 (pages de détail, laboratoire de performance, texte agrandi)

| Contrôle | Commande | Environnement | Résultat |
|---|---|---|---|
| Lighthouse, release servie par nginx 1.30.8 (configuration générée, gzip) | `npm run qa:perf -- --release <dir>` | local, Lighthouse 13.6.0, Chromium 158, mobile, throttling simulé, 3 exécutions/page, médiane | 5 pages (accueil, détail FR, contact, détail EN, résultat) : **performance 100, accessibilité 100, CLS 0, TBT 0 ms, LCP simulé ≈ 751 ms** ; JS 0 Ko externe, 2,9 Ko inline (contact) ; 158 Ko transférés (accueil). Rapport : `examples/fixture-a-services/design/reports/lighthouse-local.json` |
| Défaut trouvé par la mesure | même commande | local | page de résultat : CLS 0,141 et perf 95 — police du texte non préchargée et latin-ext préchargé inutilement. **Corrigé** (préchargement Public Sans, sous-ensemble latin seul) → CLS 0, perf 100, accueil 194 → 158 Ko |
| Texte agrandi à 200 % | `node tests/visual/text-zoom.ts` | local, Chromium 158 | 9 pages × 360/1280 px : 18/18 sans débordement ni texte coupé, **après corrections** (grille 12 colonnes limitée à ≥ 60rem, césure, colonne `minmax(0,1fr)`, tableau défilant) |
| Revue outillée | `node tests/visual/review.ts` | local, Chromium 158 | 6 pages × 4 largeurs : aucun problème (mesure du texte courant corrigée : paragraphe le plus long) |
| Tests | `npm test` | local | 66/66 |
| Recette nginx + PHP-FPM | `npm run qa:recipe` | local | 44/44 |

**CI observée — run [45397781935](https://github.com/redaboutaa-sketch/premium-website-factory/actions/runs/45397781935) (`8d71462`) : succès** (validate Node 26.13.1 et 24.22.3, recipe). Lighthouse 13.6.0 / Chromium 159 (révision verrouillée), médiane de 3 : accueil 100 (CLS 0,002), détail FR 100, **contact 97 (TBT 208 ms)**, détail EN 100, résultat 100 ; poids identiques au local (158 Ko accueil, 2,9 Ko de JS inline au contact). Le TBT du contact varie entre l'environnement local (0 ms) et le runner (208 ms) : bruit de mesure CPU probable sur le script du formulaire, à surveiller, budget respecté. Revue outillée 6 pages × 4 largeurs et texte 200 % 18/18 : réussis. Run 6 (`ceab671`) annulé par le push suivant.

Limites : laboratoire uniquement (aucune donnée terrain, aucun INP mesuré) ; HTTP local sans TLS ni HTTP/2 ; preview `noindex` (audits SEO d'indexabilité et HTTPS non pertinents ici, non retenus comme budgets). Scores Lighthouse = indicateurs, pas validation de la direction artistique ni de l'accessibilité complète.

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
