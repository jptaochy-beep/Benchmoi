# McCANN Creative Intelligence — prototype V1

Outil web privé : **Search** (benchmark mondial de campagnes réelles) → **Decode** (fiches d'intelligence créative) → **Create** (territoires et scripts).

- Cahier des charges : [`docs/CAHIER_DES_CHARGES.md`](docs/CAHIER_DES_CHARGES.md)

## Démarrer

```bash
cd mccann-creative-intelligence
npm install
cp .env.example .env.local   # puis renseigner ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Node 20+ requis. Les données (projets, campagnes, recherches) sont stockées dans `data/db.json` (non versionné).

## Tester en ligne (Vercel, possible depuis un iPhone)

1. vercel.com → se connecter avec GitHub → **Add New… → Project** → importer `benchmoi`.
2. **Environment Variables** : `ANTHROPIC_API_KEY` = votre clé.
3. **Deploy**, puis ouvrir l'URL `https://….vercel.app`.

Sur Vercel, les données sont stockées dans `/tmp` : elles peuvent disparaître entre deux sessions. Suffisant pour tester ; base PostgreSQL nécessaire pour un usage d'équipe.

## Les 6 écrans

| Écran | URL | Rôle |
|---|---|---|
| Recherche + Résultats | `/` | Requête en langage naturel, filtres créatifs, « hors catégorie », « focus Afrique » ; benchmark vérifié + synthèse |
| Analyse de campagne | `/campagne/[id]` | Lecteur vidéo, fiche : insight, big idea, mécanique, narration, reconnaissances et efficacité **sourcées** |
| Comparateur | `/comparer?ids=…` | 2–4 campagnes : points communs, différences, conventions, territoires peu exploités |
| Creative Lab | `/lab?project=…` | Brief → benchmark → 3–10 territoires → Script Studio (TV, radio, affichage, social), versions, contrôle de ressemblance |
| Mes projets | `/projets`, `/projets/[id]` | Projets par bureau et niveau de confidentialité, bibliothèque interne McCann, export Markdown / PDF |

## Garantie anti-fausses références

1. Le modèle cherche sur le web (`web_search`) ; **le serveur** enregistre la liste exacte des URL renvoyées par le moteur.
2. Une seconde passe extrait le benchmark en JSON strict ; chaque campagne doit citer une URL de cette liste.
3. `lib/verify.ts` vérifie côté serveur : URL ∈ résultats réels, lien non mort, page qui mentionne la marque ou le titre.
4. Échec → « Non confirmée — ne pas citer », repliée, exclue du Creative Lab. Les prix et résultats sans URL collectée sont supprimés.

Le modèle ne peut pas faire passer une référence inventée pour vérifiée : la décision est prise par le code.

## Architecture

```
app/api/search       recherche outillée → extraction structurée → vérification
app/api/decode       web_fetch de la source + recherches complémentaires → fiche
app/api/compare      comparaison structurée
app/api/territories  territoires créatifs (effort élevé)
app/api/script       Script Studio, versions successives
app/api/projects     projets, brief, sélection de campagnes
app/api/library      bibliothèque interne McCann
lib/claude.ts        client IA (Claude Opus 5.5, fallback serveur, sorties JSON validées par Zod)
lib/verify.ts        vérification des sources
lib/store.ts         stockage JSON (à remplacer par PostgreSQL + pgvector)
```

## Écarts vs cible (cf. cahier des charges § 7)

- Stockage fichier JSON au lieu de PostgreSQL + pgvector ; pas de recherche vectorielle interne.
- Pas d'authentification ni de rôles (à brancher sur le SSO de l'agence).
- Exports Markdown + impression PDF ; PPT/Word à venir.
- YouTube Data API, AdForum/AskMaud, The Work, shots : non branchés (la recherche web couvre les pages publiques).
- Coût indicatif : une recherche ≈ 12 requêtes web + 2 appels modèle ; prévoir un suivi des coûts avant déploiement.
