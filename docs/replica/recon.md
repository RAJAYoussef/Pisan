# Recon map : Mathflow (iOS + Android) → **PiSan**, version web pour une école

Scope : le cœur de Mathflow (parcours personnalisé → fiches cours et méthode → exercices en 3 niveaux → coach IA → suivi de progression), avec trois ajouts : **multilingue (FR, AR, EN)**, **référentiel selon le pays** (France, Maroc, Belgique FWB, Suisse romande PER, anglophone) et **mode DYS**.
Pour : les élèves et les enseignants de l'utilisateur (une école, pas une vente sur les stores).
Plateforme : web responsive (téléphone, tablette, ordinateur).
Date : 2026-11-15

Nom de notre app : **PiSan**. À vérifier à l'étape /replica-brand : marques, nom de domaine.
Maquette existante de l'utilisateur : logo π en blocs avec un visage (bleu marine, turquoise, jaune, brun), slogan « Un petit pas, un grand déclic », « Les maths deviennent enfin visuelles », langues FR / EN / AR / ES, choix du pays et de la classe à l'inscription, pseudonyme sans email, bascule Vue Élève / Vue Parent-Prof, code pilote « PILOTE2026 ». **C'est l'identité de PiSan : on part de là, pas de Mathflow.**
Chiffres en arabe : 0-9.
Premier jalon validé : **2nde France + Tronc commun Maroc, FR + AR, un chapitre complet, mode DYS, espace enseignant.**

> ✅ MAJ : 5 captures du site mathflow.ai fournies par l'utilisateur (gardées hors du dépôt).
> ⚠️ Au départ, cette recon venait **uniquement de sources publiques** (fiches des stores et site officiel, lus à travers des résultats de recherche). Les pages des stores et mathflow.ai étaient bloquées par le réseau de la session, et aucune capture n'a été prise. Les écrans ci-dessous sont **déduits** : à confirmer avec des captures de ton propre compte (à mettre dans `replica/screens/`).

## Sources

| # | source | URL | ce qu'on en tire |
| --- | --- | --- | --- |
| 1 | App Store FR | https://apps.apple.com/fr/app/mathflow-cours-de-maths/id6477834291 | de la 2nde à la Terminale, coach IA, 19,99 €/mois, 4,8/5 (159 notes) |
| 2 | Avis App Store FR | https://apps.apple.com/fr/app/mathflow-cours-de-maths/id6477834291?see-all=reviews&platform=iphone | avis (pour /replica-entrepreneur) |
| 3 | App Store GR | https://apps.apple.com/gr/app/mathflow-ai-cours-de-maths/id6477834291 | lycée « bientôt dispo », 3,90 €/sem, 9,90 €/mois, 49,99 €/an |
| 4 | App Store US | https://apps.apple.com/us/app/mathflow-learn-math-with-ai/id6477834291 | version EN : SAT, AP, adultes |
| 5 | Google Play | https://play.google.com/store/apps/details?id=ai.mathflow.app&hl=en_US&gl=US | 10K+ téléchargements, aide par photo, explications pas à pas, suivi de ce qui est maîtrisé |
| 6 | Site officiel | https://mathflow.ai/en | parcours personnalisés, exercices interactifs, quiz illimités, conforme au programme national, conçu avec Inria, contenu écrit par des docteurs et des agrégés, 20 €/mois ou 100 €/an, offre gratuite et essai |
| 7 | Mentions légales | https://mathflow.ai/mentions-legales | éditeur |
| 8 | mwm.ai | https://mwm.ai/apps/mathflow-learn-math-with-ai/6477834291 | sessions adaptatives, notes visuelles, motivation par le jeu |
| 9 | AppstoreSpy | https://appstorespy.com/android-google-play/ai.mathflow.app-trends-revenue-statistics-downloads-ratings | 4,5★ côté Android |
| 10 | Captures du site (utilisateur, hors dépôt) | — | voir « Ce que montrent les captures » |
| 11 | Ton propre compte | (à faire) | les écrans de l'app elle-même |

## Ce que montrent les captures (mathflow.ai)

- **Niveaux** : de la 6e à la Terminale, plus un parcours Adultes. Spécialités comprises. « 1 500+ séries interactives, 15 000+ missions, 130 épreuves de chapitre ».
- **8 domaines** : Nombres et calculs, Expressions et équations, Fonctions, Géométrie, Grandeurs et mesures, Probabilités et statistiques, Analyse, Maths au quotidien.
- **Structure** : Domaine → Chapitre (« Notion de fonction », « Chapitre 3 sur 5 ») → Compétences (« Compétence 1 : vocabulaire et notations », « Compétence 2 : image ou antécédent par le calcul »), affichées comme un **chemin de nœuds hexagonaux**. Une **épreuve de chapitre** à la fin.
- **Exercice interactif** : graphique manipulable (déplacer un point *b* pour que ∫₀ᵇ f = 0, avec les aires colorées et leurs valeurs en direct). Après la réponse : « Bien joué ! », 👍/👎, boutons **« Pourquoi ? »** et **« Continuer »**.
- **Accueil de l'app** : salutation et flamme, compteur d'**énergies** (12), badge Premium, carte « Reprendre » du chapitre en cours, **Défi du jour** (« Fabrique à formules »). Barre du bas : Accueil, Alphi, Mini-jeux, Plus. Mascotte : un renard magicien.
- **Jeu** : **flamme** (série de jours) avec un **gel** qui la protège, **duels et championnat** (classement de la semaine entre amis), **quêtes de la semaine** qui ouvrent un **coffre**, **défi du jour**, **mini-jeux**, étoiles, avatars.
- **Mode parent** : la semaine en un coup d'œil (temps, séries, étoiles, flamme, barres par jour), **alertes** (3 jours sans activité, difficultés répétées sur une notion), conversations avec Alphi **privées**, jusqu'à 5 enfants.
- **Tarifs** : gratuit avec énergies limitées et publicité. Premium : 19,99 €/mois, ou 8,33 €/mois facturé 99,99 €/an avec 7 jours d'essai, ou Famille à 149,99 €/an (5 enfants et 1 parent). Premium débloque les énergies illimitées, toutes les séries dans n'importe quel ordre, les mini-jeux, les avatars et la suppression des pubs.
- **Bouton « Essayer une activité »** : une activité jouable sans compte.
- **Ce qu'on ne voit nulle part** : réglages d'accessibilité ou DYS, choix de pays ou de référentiel (seulement l'Éducation nationale), arabe (seulement FR et EN), espace enseignant ou classe.

## Core loop

L'élève fait un diagnostic, reçoit un parcours de compétences adapté à son niveau, apprend chaque compétence (fiche cours et fiche méthode), s'entraîne sur des exercices en 3 niveaux (Manipuler → Expliquer → Raisonner), se fait aider par le coach IA (texte ou photo) et voit sa maîtrise progresser.

## Screens

Légende : ✅ = vu dans une source publique · ❓ = déduit · ➕ = nouveau dans notre version

| ID | écran | accès | rôle | composants clés | états |
| --- | --- | --- | --- | --- | --- |
| S01 | Connexion | `/login` | compte élève ou enseignant ❓ | champs, SSO école ➕ | vide, erreur, chargement |
| S02 | Onboarding | 1re connexion | **pays ➕, langue ➕**, niveau, objectif ❓ | sélecteurs, étapes | chaque étape, retour |
| S03 | Diagnostic | après l'onboarding | repérer les notions à travailler ✅ (source 6) | question QCM ou saisie, barre de progression | en cours, fini, abandonné |
| S04 | Accueil | `/` | reprendre le chapitre en cours, défi du jour ✅ (capture) | salutation, flamme, carte « Reprendre », carte défi, barre du bas | vide, rempli |
| S05 | Programme | `/programme` | domaines → chapitres → compétences du **référentiel du pays** ➕ | grille de domaines ✅ | chargement, vide |
| S05b | Chemin du chapitre | `/chapitre/:id` | compétences en chemin de nœuds, puis l'épreuve de chapitre ✅ | nœud (verrouillé, ouvert, fait) | — |
| S06 | Fiche cours | `/competence/:id/cours` | la notion expliquée ✅ (MAJ App Store) | texte et formules, figures, **lecture audio ➕** | normal, mode DYS ➕ |
| S07 | Fiche méthode | `/competence/:id/methode` | recette pas à pas ✅ | étapes numérotées, exemple corrigé | normal, mode DYS ➕ |
| S08 | Exercice | `/competence/:id/exo` | s'entraîner sur 3 niveaux ✅ (Manipuler, Expliquer, Raisonner) | énoncé, saisie maths, QCM, indice | non répondu, juste, faux, indice affiché |
| S09 | Retour après réponse | après une réponse | « Bien joué ! », 👍/👎, **Pourquoi ?**, Continuer ✅ (capture) | bandeau, étapes de l'explication | juste, faux |
| S08b | Activité interactive | dans S08 | graphique ou figure manipulable ✅ (capture) | point déplaçable, valeurs en direct | — |
| S10 | Coach IA (chat) | bouton partout | questions, aide sans donner la réponse ❓ | bulles, rendu des formules, **micro ➕** | vide, en train d'écrire, erreur, limite atteinte |
| S11 | Photo d'exercice | depuis S10 | photographier un exercice pour une explication ✅ | caméra, recadrage | autorisation refusée, illisible |
| S12 | Révision / quiz | `/reviser` | quiz illimités et révisions espacées ✅ / ❓ | cartes, minuteur **désactivable ➕** | — |
| S13 | Progression | `/progression` | ce qui est maîtrisé, là où ça bloque ✅ | jauges par chapitre, historique | vide, rempli |
| S14 | Paramètres | `/parametres` | profil, **langue ➕, pays ➕** | — | — |
| S15 | Réglages DYS ➕ | `/parametres/accessibilite` | police, espacement, couleurs, audio | aperçu en direct, interrupteurs | — |
| S16 | Abonnement, énergies, pubs | — | paywall ✅ | — | **skip** : école |
| S20 | Mini-jeux et défi du jour | onglet Mini-jeux | calcul ludique ✅ | — | — |
| S21 | Quêtes et classement | — | quêtes de la semaine, coffre, duels ✅ | — | **classement désactivable** (anxiété, DYS) |
| S22 | Mode parent | — | la semaine de l'enfant, alertes ✅ | barres par jour, 3 chiffres clés, alerte | — |
| S17 | Espace enseignant : classes ➕ | `/prof` | classes, élèves, invitations | tableau, code de classe | vide, rempli |
| S18 | Enseignant : suivi d'un élève ou d'une classe ➕ | `/prof/classe/:id` | qui bloque où | carte de chaleur par compétence | — |
| S19 | Enseignant : assigner un travail ➕ | `/prof/devoirs/nouveau` | choisir des compétences, une date, un niveau | sélecteur de compétences | brouillon, publié |

## Flows

```
F01 Premier pas de l'élève
    S01 -> S02 (pays, langue, niveau) -> S03 diagnostic -> S04 parcours
    happy path : environ 6 clics et 10 questions de diagnostic
    edge : pays sans référentiel complet, changement de langue en plein diagnostic,
           arabe (affichage de droite à gauche), abandon du diagnostic

F02 Apprendre et s'entraîner sur une compétence (cœur)
    S04 -> S06 cours -> S07 méthode -> S08 exos (Manipuler -> Expliquer -> Raisonner) -> S09 -> S04 (maîtrise à jour)
    happy path : environ 4 clics plus les exercices
    edge : 3 erreurs d'affilée (proposer le coach ou redescendre d'un niveau), saisie mathématique ambiguë (0,5 / 0.5 / 1/2)

F03 Se faire aider par le coach
    S08 ou S09 -> S10 -> (S11 photo) -> réponse guidée -> retour à l'exercice
    edge : demande « donne-moi la réponse », photo illisible, hors sujet, élève mineur (garde-fous)

F04 Réviser
    S04 -> S12 -> résultat -> S13

F05 Activer le mode DYS ➕
    S14 -> S15 -> le réglage s'applique partout tout de suite
    edge : l'enseignant le prescrit pour un élève (PAP / PAI)

F06 Enseignant : suivre une classe et donner un travail ➕
    S17 -> S18 -> S19 -> l'élève le voit en haut de S04
```

## Components

| composant | variantes | états | utilisé sur |
| --- | --- | --- | --- |
| Bouton | principal, secondaire, discret | défaut, survol, focus, désactivé, chargement | tous |
| Carte de compétence | à faire, en cours, maîtrisée, assignée ➕ | — | S04, S05 |
| Rendu de formule (KaTeX / MathML) | en ligne, en bloc | **lu à voix haute ➕** | S06 à S10 |
| Saisie mathématique | nombre, expression, QCM, glisser-déposer | vide, juste, faux | S08, S12 |
| Jauge de maîtrise | barre, anneau | 0 à 100 % | S04, S13, S18 |
| Bulle de chat | élève, coach | en train d'écrire, erreur | S10 |
| Indice / aide | — | fermé, ouvert | S08 |
| Sélecteur de langue et pays ➕ | — | gauche à droite / droite à gauche | S02, S14 |
| Panneau DYS ➕ | police, taille, interligne, espacement des lettres, fond, règle de lecture, coloration syllabique, audio | — | S15, accessible partout |
| Lecteur audio (synthèse vocale) ➕ | lire, pause, vitesse | — | S06, S07, S08 |

## Inferred data model

```
User           id, role (eleve | enseignant | admin), nom, langue, pays_id, niveau_id
               evidence : onboarding par niveau (sources 1, 6) ; rôle enseignant = ajout
               confidence : medium

Pays / Referentiel ➕  id, code (FR, MA, BE-FWB, CH-PER, UK, US), langues[], niveaux[]
               confidence : ajout

Niveau         id, referentiel_id, code (ex. FR-2nde, MA-TC, CH-9H, UK-Y10), ordre
Chapitre       id, niveau_id, titre (traduit), ordre
Competence     id, chapitre_id, code_officiel, titre (traduit)
               evidence : « chaque compétence inclut fiches cours et méthode » (MAJ App Store)
               confidence : high
NotionPivot ➕  id, libelle : une notion mathématique commune, reliée aux compétences de chaque
               pays (table competence_notion) pour réutiliser le même contenu partout

Fiche          id, competence_id, type (cours | methode), langue, contenu (markdown + LaTeX), audio_url
Exercice       id, competence_id, niveau (manipuler | expliquer | raisonner), type, enonce, solution, etapes[], langue
               evidence : « séries en 3 niveaux » (source Play / mwm)
               confidence : medium
Tentative      id, user_id, exercice_id, reponse, juste, indice_utilise, duree, created_at
Maitrise       user_id, competence_id, score (0-1), updated_at          confidence : medium (suivi de maîtrise, source 5)
ConversationCoach  id, user_id, exercice_id?, messages (json), image_url?
PreferencesDYS ➕   user_id, police, taille, interligne, espacement, fond, coloration_syllabique, audio_auto, sans_chrono
Classe ➕       id, enseignant_id, nom, code_invitation
Devoir ➕       id, classe_id, competences[], date_limite
```

Relations : Referentiel 1-n Niveau 1-n Chapitre 1-n Competence ; Competence 1-n Fiche et 1-n Exercice ; User 1-n Tentative ; User n-n Competence via Maitrise ; Classe n-n User (élèves) ; Competence n-n NotionPivot.

## Feature matrix

Voir `features.csv`. Must : 20, should : 17, could : 12, skip : 4.

## Out of scope (cannot or should not be cloned)

- **Le contenu de Mathflow** (cours, exercices, fiches écrits par leurs docteurs et agrégés) : il leur appartient. On écrit le nôtre, à partir des **programmes officiels publics** de chaque pays.
- Leur nom, leur logo, leur coach « Alphi » et sa personnalité, leurs textes.
- L'abonnement et le paywall : inutiles pour une école.
- Les parcours adultes et la prépa SAT/AP de la version US : hors du public visé.

## Size

Écrans 23 (dont 7 nouveaux), flows 6, entités 14.

Parties difficiles :
1. **Le contenu** : 4 à 6 référentiels × plusieurs niveaux × 3 langues. C'est de loin le plus gros chantier, bien plus que le code.
2. Le coach IA : guidage sans donner la réponse, lecture de photos, garde-fous pour des mineurs, coût par élève.
3. L'arabe, qui s'affiche de droite à gauche alors que les formules restent de gauche à droite.
4. Le mode DYS bien fait : lecture audio des formules, coloration syllabique en FR, AR et EN.
5. Les données d'élèves mineurs : RGPD (FR, BE), LPD (CH), loi 09-08 (MA).

Taille : **L** pour tout le périmètre. **Recommandation** : un premier jalon **M** = un seul niveau (par exemple 2nde France et Tronc commun Maroc), FR et AR, un chapitre complet, avec le mode DYS et l'espace enseignant. Ensuite, on ajoute les pays un par un via la table NotionPivot.

## État de l'app PiSan (code Lovable lu le 2026-11-15)

**Déjà fait (et différent de Mathflow) :**
- 4 langues (FR, EN, AR en RTL, ES) ; **9 pays** avec leurs niveaux (`src/lib/curriculum.ts`) ; pseudo sans email.
- **Diagnostic adaptatif** de 6 questions : il trouve la notion ratée et la **lacune de prérequis**, puis propose une consolidation de 2 minutes.
- **Atelier CPA** (Concret → Imagé → Abstrait, modèles en barres de Singapour) avec jetons manipulables au doigt ; démonstrations selon la classe.
- **Contrôles blancs notés sur 20**, parcours avec badges, lecture audio des énoncés.
- Vue « Parent/Prof » : maîtrise par chapitre, activité sur 7 jours, contrôles. Mais elle ne montre que **l'élève lui-même** : pas de classes.
- Offre Découverte (3 exercices par jour), code partenaire `PILOTE2026` = illimité ; prix 12 €/mois ou 89 €/an, paiement non branché.
- 11 notions de contenu (entiers, fractions, proportionnalité, puissances, calcul littéral, équations, fonctions, second degré, dérivées, suites, exponentielle), avec des **QCM**.

**Manque par rapport au plan :**
1. **Mode DYS** : rien pour l'instant (aucun réglage de police, d'espacement ou de fond). C'est la promesse n° 1 : à faire en premier.
2. **Vrai espace enseignant** : classes, code de classe, carte de chaleur, devoirs. Aujourd'hui, la vue Prof = la vue de l'élève.
3. **Référentiel détaillé par pays** : les pays changent les niveaux, mais le contenu est le même partout (11 notions). Il manque les chapitres et compétences officiels propres à chaque pays (2nde France, Tronc commun Maroc).
4. **Exercices au-delà du QCM** : saisie libre, graphiques manipulables, bouton « Pourquoi ? ».
5. **Coach IA** : absent (le « Tutor » est un texte fixe).

**Points de sécurité à corriger :**
- Le code `PILOTE2026` est **écrit en clair dans l'interface** (bouton « Simuler Code PILOTE2026 ») et dans le code envoyé au navigateur : n'importe qui obtient l'accès illimité. Avant d'ouvrir l'app à des élèves : retirer le bouton de test, garder le code seulement côté serveur, et donner un code différent à chaque établissement.
- La barre de test « Vue Élève / Vue Parent-Prof » est visible de tous : à cacher en production.
