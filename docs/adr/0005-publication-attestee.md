# ADR 0005 — Publication attestée d'une release

Statut : accepté · 2026-11-24 · workflow écrit et testé structurellement ; **première exécution réelle soumise à l'accord du propriétaire** (voir plus bas).

## Chaîne
1. `.github/workflows/release.yml`, **déclenchement manuel uniquement** (`workflow_dispatch` : site, cible). Jamais sur pull request ni sur push.
2. Job `build` — droits `contents: read`, `id-token: write`, `attestations: write` : entrées validées puis passées par variables d'environnement ; `npm run release` (validation, build, endpoint, vendor, audit, empreintes) ; `qa:release` ; **attestation de provenance** de l'archive (`actions/attest-build-provenance`, SLSA, signée via l'identité OIDC du workflow, Sigstore) ; archive, `.sha256` et `release.json` en artefact.
3. Job `publish` — `needs: build`, **environnement `release`** (règles de protection à activer : relecteurs requis), droits `contents: write`, `attestations: read` : revérifie l'empreinte transmise par le build, **revérifie l'attestation** (`gh attestation verify --signer-workflow <dépôt>/.github/workflows/release.yml`), puis crée une release GitHub **en brouillon**.
4. Opérateur, avant tout déploiement : `npm run release:verify -- --archive <id>.tar.gz --repo <propriétaire/dépôt>`. L'empreinte n'est affichée que si l'attestation est vérifiée ET porte sur ces octets. Elle est ensuite transmise à `factory-deploy install --sha256` (le serveur n'a pas besoin de gh).

## Ce que l'attestation prouve, et ce qu'elle ne prouve pas
Elle prouve que ces octets ont été produits par ce workflow, dans ce dépôt, depuis ce commit. Elle ne prouve ni que le code est sûr, ni que le contenu est exact, ni que le déploiement est autorisé (décision humaine distincte, environnement protégé et autorisation explicite).

## Points à décider par le propriétaire
- **Activer** les règles de protection de l'environnement `release` (relecteurs requis) : sans elles, toute personne pouvant déclencher le workflow peut produire un brouillon. Disponibilité selon le plan GitHub et la visibilité du dépôt ; **non configuré par ce dépôt, non observé**.
- **Dépôt public** : les attestations sont alors inscrites dans le journal de transparence public de Sigstore (nom du dépôt, workflow, commit, empreinte). Dépôt privé : stockage de GitHub, selon le plan.

## Testé
`engine/tests/workflows.test.ts` (actions épinglées par SHA, droits, déclencheurs, environnement, vérification avant création, aucune interpolation d'entrée dans un script, aucun `continue-on-error`) ; `tests/integration/verify.test.ts` (gh simulé : attestation valide, attestation d'une autre archive, échec, gh absent).
