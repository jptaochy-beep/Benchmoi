# McCANN CREATIVE INTELLIGENCE
## Cahier des charges fonctionnel et technique — V1

**Destinataires :** Stéphane et l'équipe de développement
**Périmètre :** McCann Abidjan, Douala, Dakar
**Version :** 1.0 — novembre 2026
**Statut :** à valider. Un prototype fonctionnel accompagne ce document (`mccann-creative-intelligence/`).

---

## 0. En une phrase

Un outil web privé qui **cherche** des campagnes publicitaires réelles dans le monde entier à partir d'une idée (pas d'un mot-clé), les **décode** (insight, big idea, mécanique, narration), puis **crée** des territoires et des scripts originaux à partir de ce benchmark sourcé.

**Règle n° 1, non négociable :** aucune campagne n'est présentée comme une référence réelle sans un lien source vérifiable. Une campagne non confirmée est soit écartée, soit affichée explicitement comme « non confirmée — ne pas citer ».

---

## 1. Objectifs et indicateurs

| Objectif | Indicateur | Cible V1 |
|---|---|---|
| Références fiables | Part des campagnes affichées « vérifiées » dont le lien ouvre bien la campagne annoncée (audit manuel) | ≥ 95 % |
| Zéro fausse référence | Campagnes inventées affichées comme réelles | **0** |
| Diversité | Nombre de pays distincts par benchmark de 8 campagnes | ≥ 4 |
| Pertinence | Note créatifs (1–5) sur l'adéquation au brief | ≥ 4 |
| Gain de temps | Temps d'un benchmark + 3 pistes, avant / après | – 60 % |
| Qualité de création | Pistes jugées « présentables en interne » par un DC | ≥ 1 sur 3 |

---

## 2. Utilisateurs et rôles

| Rôle | Droits |
|---|---|
| **Créatif** (CR, DA) | Recherche, fiches, comparateur, Creative Lab, ses projets et projets partagés |
| **Planneur stratégique** | Idem + édition des briefs, annotations stratégiques |
| **Directeur de création** | Idem + validation des pistes, verrouillage des versions |
| **Admin bureau** (Abidjan / Douala / Dakar) | Gestion des comptes du bureau, bibliothèque interne, niveaux de confidentialité |
| **Admin réseau** | Paramétrage des sources, quotas IA, journaux |

Confidentialité des projets : `Public réseau` / `Bureau` / `Équipe projet` / `Confidentiel client` (visible uniquement par les membres nommés). Les campagnes internes non diffusées sont par défaut `Confidentiel client`.

---

## 3. Parcours utilisateur de référence

> Un CR travaille sur un brief assurance. Il écrit : *« Je cherche des pubs internationales sur le sacrifice des parents pour leurs enfants, émouvantes, avec une révélation finale, film 60 s. »*

1. **Recherche** — l'outil reformule l'intention, l'élargit (sacrifice → dévouement, héritage, transmission, gratitude filiale) et la traduit (EN, ES, PT, + langues pertinentes : thaï, hindi…).
2. **Résultats** — 6 à 12 campagnes réelles, de plusieurs pays, chacune avec marque, agence, pays, année, format, lien source, statut de vérification.
3. **Fiche** — pour chaque campagne retenue : insight, big idea, mécanique, narration (accroche → développement → bascule → résolution → signature), efficacité documentée ou « non disponible ».
4. **Comparateur** — 2 à 4 campagnes : points communs, différences, conventions du secteur, territoires peu exploités.
5. **Creative Lab** — brief client + benchmark → 5 à 10 territoires créatifs originaux.
6. **Script Studio** — une piste → script TV 15/30/45/60 s, radio, film digital, affichage. Itérations en langage naturel (« rends le dialogue plus camerounais, propose deux chutes »). Historique des versions. Alerte de ressemblance avec les références.
7. **Projet** — tout est sauvegardé dans un espace projet, exportable (PDF / PPT / Word).

---

## 4. Les six écrans de la V1

### 4.1 Recherche
- Champ texte libre (français, ou toute autre langue).
- Filtres : Pays/région, Format, Secteur, Approche créative, Émotion, Insight humain, Mécanique, Forme narrative, Période.
- Option **« Inspiration hors catégorie »** : exclure le secteur du brief et chercher le même ressort créatif ailleurs (ex. BTP → fiabilité dans l'automobile).
- Option **« Focus Afrique »** : priorise Loeries, Pitcher, presse spécialisée africaine, marchés NG/ZA/KE/CI/CM/SN.
- Bouton « Lancer un benchmark ». Durée affichée (une recherche sourcée prend 30 s à 2 min).

**Valeurs de filtres V1**

| Dimension | Valeurs |
|---|---|
| Insight humain | Famille, peur, liberté, fierté, réussite, appartenance, transmission, sacrifice, dignité, solidarité |
| Émotion | Humour, nostalgie, tendresse, surprise, colère, admiration, espoir, fierté |
| Mécanique | Twist final, métaphore, exagération, démonstration produit, storytelling, ellipse temporelle, renversement, accumulation |
| Forme narrative | Dialogue, voix off, film muet, documentaire, témoignage, manifeste, comédie de situation |
| Format | TV 15/30/45/60 s, film long, radio, print, affichage, activation, social, digital |
| Secteur | Banque, assurance, BTP/ciment, automobile, boissons, télécoms, santé, FMCG, distribution, énergie, institutionnel |
| Géographie | Monde, Afrique (+ Afrique de l'Ouest, Afrique centrale, Afrique australe, Afrique de l'Est), Côte d'Ivoire, Cameroun, Sénégal, Nigeria, Afrique du Sud, Kenya, Asie (Thaïlande, Inde…), Amérique latine (Brésil, Argentine…), Europe, Amérique du Nord, Moyen-Orient |

### 4.2 Résultats
- Grille de cartes : vignette (si droits), titre, marque, agence, pays, année, format, 1 ligne « pourquoi c'est pertinent ».
- Badge de statut : **Vérifiée** (vert) / **Non confirmée** (gris, repliée sous « Pistes à vérifier — ne pas citer »).
- Distinction obligatoire du **type de reconnaissance** : `Primée` (prix cité + source), `Populaire` (vues/partages sourcés), `Efficacité prouvée` (résultats business sourcés, Effie, IPA…), `Non documentée`. Ces trois notions ne doivent jamais être confondues.
- Synthèse du benchmark : ressorts créatifs récurrents, approches moins exploitées.
- Sélection multiple → « Comparer » ou « Ajouter au projet ».

### 4.3 Analyse de campagne (fiche d'intelligence créative)

| Champ | Contenu | Règle |
|---|---|---|
| Média | Lecteur vidéo (embed YouTube/Vimeo officiel) ou visuel | Embed uniquement si la plateforme le permet ; sinon lien |
| Identité | Nom, marque, agence, pays, année, format | Chaque champ incertain marqué « à confirmer » |
| Insight | Vérité humaine exploitée | Analyse McCann (marquée « analyse IA ») |
| Big Idea | Idée fondamentale en une phrase | Analyse |
| Mécanique | Comment l'idée est mise en scène | Analyse |
| Narration | Accroche / développement / bascule / résolution / signature | Analyse |
| Signature | Claim / tagline | Citée seulement si trouvée dans une source |
| Reconnaissance | Prix, résultats, audience | **Uniquement si sourcé**, sinon « non disponible » |
| Sources | Liens originaux + date de vérification | Obligatoire |

Distinction visuelle entre **faits sourcés** et **analyse interprétative de l'IA**.

### 4.4 Comparateur
- 2 à 4 fiches côte à côte.
- Sortie : points communs, différences, conventions du secteur, clichés à éviter, territoires peu exploités, angle recommandé pour le brief en cours.

### 4.5 Creative Lab + Script Studio
**Brief** : marque, secteur, cible, problème, promesse, preuve, ton, budget (fourchette), marché, médias, mandatories, interdits.

**Territoires** (5 à 10) — chaque territoire :
`titre`, `registre émotionnel`, `insight`, `idée`, `synopsis`, `mécanique`, `signature proposée`, `potentiel d'exécution` (formats, déclinaisons), `références d'inspiration` (ids de campagnes du benchmark — jamais de campagne extérieure non sourcée), `risque de ressemblance` (faible/moyen/élevé + justification).

**Script Studio** — formats : TV 15/30/45/60 s, film digital, radio 30/60 s, affichage (accroche + visuel + body), social (séquence de posts / vidéo verticale).
- Script TV : tableau image / son, timecodes, voix off, dialogues, super, packshot, signature.
- Itération en langage naturel, sur la dernière version.
- **Historique des versions** (v1, v2…) avec la consigne qui a produit chaque version ; restauration possible.
- **Adaptation culturelle** : français ivoirien, camerounais, sénégalais ; nouchi, camfranglais, wolof — avec glossaire en marge pour le client.
- **Contrôle de ressemblance** à chaque version : comparaison sémantique avec les campagnes du benchmark et de la bibliothèque ; alerte si similarité de structure narrative + chute + signature.

### 4.6 Mes projets
- Liste des projets (client, marque, statut, bureau, confidentialité, date).
- Contenu : brief, benchmarks, fiches, comparaisons, territoires, scripts et versions, commentaires.
- Exports : **PDF** (benchmark sourcé, fiches), **PPT** (présentation client : concept boards, références, synopsis), **Word** (scripts).

---

## 5. Sources de données

### 5.1 Principe juridique
**Consulter une base ne donne pas le droit de l'aspirer.** Trois régimes distincts :

| Régime | Ce qu'on stocke | Exemples |
|---|---|---|
| **A. API officielle / licence** | Métadonnées + médias selon contrat | YouTube Data API, Meta Ad Library API, Google Ads Transparency, TikTok Commercial Content API, licences pro (The Work, AdForum Enterprise, shots Vault) |
| **B. Recherche web avec lien source** | Métadonnées minimales (titre, marque, agence, pays, année, URL) + **analyse originale McCann**. Pas de copie de média ni de texte intégral | Ads of the World, D&AD, Loeries, Pitcher, presse pro (Campaign, Adweek, Muse by Clio, LBBOnline, Stratégies, Brand Africa…) |
| **C. Contenus internes McCann** | Tout, avec droits d'accès | Campagnes finalisées, scripts, analyses de briefs, références de production |

Interdits : scraping contournant une authentification, un paywall ou des CGU ; téléchargement de vidéos tierces sans droits ; réutilisation de textes d'analyse tiers au-delà de la courte citation.

### 5.2 Priorisation

| Source | Régime V1 | Phase |
|---|---|---|
| Recherche web générale (via le modèle IA, outil web_search) | B | **MVP** |
| YouTube Data API v3 (recherche, métadonnées, embed) | A | **MVP** |
| Ads of the World, D&AD Archive, Loeries, Pitcher (liens) | B | **MVP** |
| Bibliothèque interne McCann | C | **MVP** |
| AdForum / AskMaud (Enterprise, MCP annoncé) | A | Test immédiat, puis Scale si contrat |
| The Work — Cannes Lions | A | Scale (licence) |
| shots Vault | A | Scale (licence) |
| Meta Ad Library | A | Scale (veille concurrentielle ; périmètre API limité) |
| Google Ads Transparency Center | A/B | Scale |
| TikTok Top Ads / Commercial Content API | A | Scale (sélection autorisée par les annonceurs seulement) |

---

## 6. Système d'analyse IA

### 6.1 Pipeline de recherche (anti-hallucination)

```
Requête FR + filtres
   │
   ▼
[1] Expansion d'intention ─ synonymes conceptuels, traductions EN/ES/PT/…, secteurs voisins
   │
   ▼
[2] Recherche web outillée ─ le modèle interroge le web ; le serveur COLLECTE la liste
   │                         exacte des URL réellement retournées par le moteur
   ▼
[3] Extraction structurée ─ JSON strict (schéma) ; chaque campagne DOIT citer une URL
   │                         issue de la liste [2]
   ▼
[4] Vérification serveur ─ (a) URL ∈ résultats réels de [2]
   │                       (b) URL répond (HTTP 2xx/3xx)
   │                       (c) la page mentionne la marque ou le titre
   ▼
[5] Statut : (a) ET (b) ET (c) non négatif → « Vérifiée »
             confiance « élevée » si la page a été relue et mentionne la campagne,
             « moyenne » si la page est protégée (anti-robot) mais l'URL vient du moteur
             sinon → « Non confirmée » (repliée, non citable, exclue du Creative Lab)
```

Le modèle n'a **aucun moyen** de faire passer une référence inventée en « Vérifiée » : la vérification est faite par le code, pas par le modèle.

### 6.2 Décodage d'une campagne
1. Lecture de la page source (outil web_fetch) + recherches complémentaires (prix, résultats, crédits).
2. Extraction structurée de la fiche (§ 4.3). Les champs factuels (prix, résultats, crédits) ne sont remplis que s'ils sont présents dans une source collectée, sinon `non disponible`.
3. Phase Scale : analyse multimodale (images clés, transcription, rythme, musique, chute) **uniquement sur contenus autorisés** (régimes A et C).

### 6.3 Création
- Les territoires partent du brief + du benchmark ; consigne explicite d'**originalité** : réutiliser des ressorts, jamais une exécution.
- Chaque territoire déclare ses inspirations (ids de campagnes) et son risque de ressemblance.
- Le Script Studio reçoit : brief, territoire, format, version précédente, consigne de révision.
- Contrôle de ressemblance : en V1 jugement du modèle sur les fiches du benchmark ; en Scale, similarité vectorielle (pgvector) sur synopsis + chute + signature, seuil paramétrable.

### 6.4 Règles de génération (prompt système, résumé)
- Ne jamais inventer de campagne, de prix, de chiffre d'efficacité, d'agence ou d'année.
- Distinguer « fait sourcé » et « analyse ».
- Distinguer prix / popularité / efficacité commerciale.
- Écrire pour les marchés d'Afrique francophone sans caricature ; les expressions locales doivent être justes et glosées.
- Respecter les mandatories et interdits du brief, la réglementation publicitaire locale (ARPP-like, CNP, lois sur l'alcool, la santé, la finance) — signaler tout risque.
- Pas de mention de marques concurrentes dans les scripts sauf demande explicite.

### 6.5 Modèle
- Modèle de langage multimodal de dernière génération (prototype : Claude Opus 5.5 via l'API Anthropic, outils serveur `web_search` / `web_fetch`, sorties structurées JSON).
- Fallback serveur activé en cas de refus de sécurité.
- Journalisation : requête, sources collectées, coût en tokens, durée — pour l'audit qualité et le suivi budgétaire.

---

## 7. Architecture technique cible

| Composant | Solution |
|---|---|
| Interface | Next.js (App Router), application web privée, SSO Microsoft 365 / Google Workspace |
| Backend | Python / FastAPI (cible) — le prototype utilise les routes API Next.js |
| Base de données | PostgreSQL + **pgvector** |
| Recherche | Hybride : plein texte (BM25 / `tsvector`) + vecteurs + filtres structurés |
| Découverte | API officielles, recherche web outillée, connecteurs sous licence |
| IA | Modèle multimodal (analyse + génération), sorties JSON validées par schéma |
| Files de traitement | Redis + worker (RQ / Celery) ; n8n pour les automatisations de veille si pertinent |
| Stockage médias | S3-compatible, uniquement contenus autorisés (régimes A et C) |
| Exports | PDF (WeasyPrint / Playwright), PPTX (python-pptx), DOCX (python-docx) |
| Hébergement | Cloud UE ou Afrique (données clients), sauvegardes quotidiennes |

### 7.1 Modèle de données (extrait)

```
campaign(id, title, brand, agency, country, region, year, sector, format[],
         source_url, source_type[A|B|C], verification_status, verified_at,
         recognition_type[award|popular|effectiveness|none], recognition_detail,
         recognition_source_url, media_embed_url, rights_status, embedding vector)

campaign_analysis(id, campaign_id, insight, big_idea, mechanic,
         narrative{hook,development,turn,resolution,signature}, tags{insight[],emotion[],
         mechanic[],narrative_form[]}, sources[], model, created_at)

search(id, user_id, project_id, query, filters, expanded_queries[], collected_urls[],
       result_campaign_ids[], synthesis, cost_tokens, created_at)

project(id, name, client, brand, office, confidentiality, members[], status)
brief(id, project_id, fields…)
territory(id, project_id, brief_id, fields…, inspiration_campaign_ids[], similarity_risk)
script(id, territory_id, format, current_version)
script_version(id, script_id, n, instruction, content, similarity_report, author, created_at)
```

### 7.2 Sécurité et conformité
- Comptes nominatifs, rôles (§ 2), cloisonnement par projet.
- Les données client confidentielles ne sont envoyées au fournisseur IA que sous contrat garantissant la non-utilisation pour l'entraînement et une rétention limitée.
- Journal d'audit des accès aux projets confidentiels.
- Conformité aux lois sur les données personnelles (CI : loi 2013-450 ; CM : loi 2024-017 ; SN : loi 2008-12) et RGPD pour les données hébergées en UE.

---

## 8. Plan de lancement

| Phase | Contenu | Durée indicative |
|---|---|---|
| **01 — Test** | AskMaud (offre gratuite 10 req./jour puis payante) sur ~20 briefs McCann réels. Grille de notation : pertinence, diversité pays, fiabilité des liens, profondeur d'analyse. **En parallèle :** le prototype fourni, sur les mêmes 20 briefs → comparaison objective. | 2 semaines |
| **02 — MVP** | 6 écrans, recherche web outillée + YouTube API + bibliothèque interne, fiches, comparateur, Creative Lab, Script Studio, exports, comptes et rôles, PostgreSQL/pgvector. | 6–10 semaines |
| **03 — Scale** | Licences (AdForum Enterprise / MCP, The Work, shots), base africaine enrichie, analyse multimodale, storyboards et moodboards générés, veille automatisée. | En continu |

Les délais sont des objectifs de cadrage, non des devis. Le coût dépend d'abord des licences et du volume d'appels IA.

---

## 9. Recette (critères d'acceptation V1)

**Test principal :** 5 briefs différents (assurance, ciment/BTP, télécom, boisson, banque).

Pour chaque brief :
1. ☐ Le benchmark renvoie ≥ 6 campagnes **vérifiées**, d'au moins **4 pays**, dont au moins 1 africaine quand le focus Afrique est activé.
2. ☐ **100 %** des campagnes « vérifiées » ont un lien qui ouvre une page décrivant bien cette campagne (contrôle manuel).
3. ☐ **0** campagne inventée présentée comme réelle. Une campagne non confirmée apparaît uniquement dans la zone « non confirmée — ne pas citer ».
4. ☐ Aucun prix ni résultat d'efficacité affiché sans source.
5. ☐ Une fiche complète est générée pour 3 campagnes.
6. ☐ Le comparateur produit points communs / différences / territoires peu exploités sur 3 campagnes.
7. ☐ Le Creative Lab produit ≥ 5 territoires distincts.
8. ☐ 3 scripts distincts (TV 30 s, radio 30 s, affichage) sont générés, révisables, versionnés, exportables.
9. ☐ Le contrôle de ressemblance produit un rapport pour chaque version de script.
10. ☐ Recherche + fiches + 3 pistes en **< 15 minutes** de temps utilisateur.

**Tests négatifs :**
- Demander « la pub Dangote où un maçon pleure sous la pluie en 2019 » (inexistante) → l'outil répond qu'il ne la trouve pas, ne l'invente pas.
- Demander un script qui reprend une campagne existante plan par plan → alerte de ressemblance « élevée ».

---

## 10. Hors périmètre V1
- Génération d'images / vidéos (storyboards, moodboards) → Scale.
- Analyse multimodale des vidéos tierces → Scale, sous licence.
- Application mobile.
- Mesure d'efficacité des campagnes McCann (post-test).

---

## 11. Décisions à prendre (Stéphane / direction)

1. Budget licences Phase 03 (AdForum Enterprise, The Work, shots) — à arbitrer après la Phase 01.
2. Fournisseur IA et conditions contractuelles de confidentialité.
3. Hébergement (UE vs Afrique) et SSO.
4. Qui alimente la bibliothèque interne (un référent par bureau ?).
5. Politique de confidentialité par client (quels clients en « Confidentiel client » par défaut).

---

## Annexe A — Prototype fourni

Le dossier `mccann-creative-intelligence/` contient un prototype Next.js fonctionnel qui implémente les 6 écrans et le pipeline anti-hallucination du § 6.1. Voir `README.md` dans ce dossier. Écarts assumés vs la cible : stockage en fichiers JSON au lieu de PostgreSQL, pas d'authentification, pas d'export PPT/Word (export Markdown/impression PDF), YouTube API non branchée (la recherche web couvre YouTube).
