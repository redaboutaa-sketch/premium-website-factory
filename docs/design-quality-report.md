# Rapport de qualité de conception — fixture A (Ostral, démonstration fictive)

Objet : **prototypes de direction** (incrément 1), pas le site final. Évaluation de l'agent, motivée ; aucune approbation du propriétaire n'est encore enregistrée.

États : à corriger · prêt pour revue · validé par le propriétaire.

## Revue du 2026-11-24 — captures `examples/fixture-a-services/design/captures/` (Chromium 158, 390×844 et 1440×900, @2x, mouvement réduit, CSP active)

| Dimension | Piste A — Registre | Piste B — Plan d'atelier | Preuve |
|---|---|---|---|
| Clarté | Prêt pour revue — premier écran : cible (kicker), promesse sans chiffre, deux actions | Prêt pour revue — idem + fiche de diagnostic visible dès l'arrivée | Captures desktop/mobile |
| Identité | Prêt pour revue — repères « § », registre en sous-grille, italique rouge : reconnaissable sans logo | Prêt pour revue — trame ardoise, fiche technique, bande jaune | idem |
| Typographie | Prêt pour revue — hiérarchie nette à 390 et 1440 px ; **textes anglais/allemand longs non testés** | Prêt pour revue — titres en capitales à surveiller en traduction | idem |
| Composition | Prêt pour revue après correction (voir ci-dessous) | Prêt pour revue | idem |
| Médias | Sans objet — aucune image, choix assumé faute d'actif autorisé | Sans objet | Brief `availableResources` |
| Usage | **À corriger avant livraison** — ancres seulement, pas de formulaire réel ; clavier, zoom texte, 360 px non testés | idem | — |
| Crédibilité | Prêt pour revue — faits `proposed` signalés « à confirmer », aucun chiffre ni témoignage inventé | idem | Brief `facts`, captures |
| Finition | Prêt pour revue — défauts listés ci-dessous | Une pastille « à confirmer » passe à la ligne de façon peu élégante dans le module 01 (desktop) | Capture B desktop |

## Défauts trouvés et corrigés pendant la revue
1. **Piste A, desktop** : les repères « § » et le « Registre des prestations » s'empilaient au lieu d'occuper leurs colonnes. Cause : la portée des styles d'Astro ajoute un attribut au sélecteur `.grid > *`, dont la spécificité écrasait le placement par colonnes. Correction : placement par défaut déclaré sur les classes. Vérifié par nouvelle capture.
2. **Piste A, clôture** : bloc sombre non aligné sur la grille de page. Correction : fond pleine largeur + grille intérieure. Vérifié par nouvelle capture.

## Non couvert à ce stade
Firefox et WebKit ; 360 px, tablette, orientation ; zoom texte 200 % ; navigation clavier complète ; libellés EN/DE ; performance (aucune mesure Lighthouse sur des prototypes). Ces contrôles accompagneront la démo complète (incrément 3).
