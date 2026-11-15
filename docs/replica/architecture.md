# Architecture : PiSan

> ## ⚠️ Révision du 2026-11-15 : on part de l'app Lovable existante
> Le code Lovable (dépôt `RAJAYoussef/Pisan`, synchronisé avec Lovable) est déjà bien avancé. **On garde sa stack** au lieu de passer à Next.js :
>
> | couche | dans l'app Lovable | décision |
> | --- | --- | --- |
> | web | **TanStack Start** (React 19, Vite) + TypeScript, server functions | on garde |
> | style | Tailwind 4 + shadcn/ui ; polices Nunito, Fredoka, Tajawal (arabe) | on garde ; on ajoute les polices DYS |
> | langues | dictionnaire maison `src/lib/i18n.ts` (FR, EN, AR, ES), `dir="rtl"` pour l'arabe | on garde |
> | base de données | **Lovable Cloud (Supabase)** : 1 table `learning_sessions` (profil et progrès en JSON), quota de 3 exercices par jour | **le schéma se change via Lovable**, pas à la main (règle d'`AGENTS.md`) |
> | élèves | session anonyme : un jeton aléatoire stocké dans le navigateur, haché côté serveur ; pseudo, sans email | on garde (c'est déjà ce qu'on voulait) |
> | lecture audio | Web Speech API du navigateur | on garde |
> | IA | gateway IA de Lovable (`LOVABLE_API_KEY`) | **le coach passera par là : pas besoin d'une clé Anthropic à part** |
> | tests | Vitest (`src/test/`) | on garde |
>
> **Conséquence :** `schema.sql` ci-dessous n'est plus une migration à lancer. C'est la **cible**, à faire construire par Lovable étape par étape, avec des prompts courts (voir `prompts-lovable.md`).

## Plan d'origine (cible à long terme)

Premier jalon : **2nde France + Tronc commun Maroc, FR + AR, un chapitre complet (« Notion de fonction »), mode DYS, espace enseignant, web.**

## Stack

| couche | choix | pourquoi |
| --- | --- | --- |
| web | **Next.js (App Router) + TypeScript** | un seul projet pour les pages et le serveur ; marche sur téléphone, tablette, ordinateur |
| style | **Tailwind** + tokens de /replica-design | les réglages DYS se font en changeant des variables CSS, sans toucher les composants |
| langues | **next-intl** (FR, AR, EN, ES), `dir="rtl"` pour l'arabe | routes `/fr`, `/ar`, `/en` ; l'arabe en droite à gauche, les formules en gauche à droite |
| formules | **KaTeX** avec sortie MathML | rapide, et le MathML est lisible par les lecteurs d'écran |
| activités interactives | **Mafs** (React, MIT) | graphiques avec points déplaçables, comme l'exercice de l'intégrale vu sur la capture |
| saisie mathématique | **MathLive** (MIT) | clavier mathématique virtuel ; accepte 0,5 et 0.5 |
| base de données | **Postgres sur Supabase, région UE** | données d'élèves mineurs hébergées en Europe ; RLS intégré |
| ORM | **Drizzle** | SQL lisible, migrations versionnées |
| auth | **Supabase Auth** : email pour les profs, **code de classe + pseudo** pour les élèves, plus tard Google / Microsoft (SSO école) | pas d'email demandé aux élèves = moins de données personnelles |
| coach IA | **API Claude** (Anthropic), clé de l'école, appelée seulement côté serveur | texte et photo (vision) ; consignes pour guider sans donner la réponse ; plafond de messages par élève et par jour |
| lecture audio (DYS) | **Web Speech API** du navigateur + champ `speech_text` écrit à la main | gratuit, sans serveur ; les formules sont lues depuis un texte relu par un humain (FR, AR) |
| polices DYS | **Lexend, OpenDyslexic, Andika** ; arabe : **Noto Naskh Arabic** | toutes sous licence libre (OFL) |
| contenu | **fichiers Markdown + YAML dans le dépôt** (`content/`), importés en base par un script | les profs relisent et corrigent comme du texte, avec historique |
| paiement | **aucun** | usage école |
| email | **Resend** (profs seulement) | invitations et réinitialisation de mot de passe |
| tâches planifiées | **Vercel Cron** | calcul des flammes et alertes chaque nuit, suppression des photos de plus de 30 jours |
| fichiers | **Supabase Storage** (bucket privé) | photos d'exercices envoyées au coach |
| hébergement | **Vercel** (fonctions en région UE) | déploiement à chaque `git push` |

Une seule base. Pas de microservices.

## Schéma

21 tables + 1 vue, toutes sous **Row Level Security** : voir `replica/schema.sql`.

```
schools ─< profiles >─ curricula ─< levels ─< chapters ─< skills >─< notions ─< sheets
                │                              │            │                  └─< exercises
                ├─< class_members >─ classes ──┘            │
                ├─< attempts ───────────────────────────────┤
                ├─< mastery ────────────────────────────────┘
                ├─< daily_activity
                ├─< coach_conversations ─< coach_messages
                └── dys_preferences
classes ─< assignments ─< assignment_skills >─ skills
```

**L'idée clé pour les pays :** le contenu (fiches et exercices) est rattaché à une **notion** commune (`notions`), pas à un pays. Chaque référentiel a ses niveaux, chapitres et compétences, reliés aux notions par `skill_notions`. « Image et antécédent d'une fonction » s'écrit une seule fois, puis sert à la 2nde en France comme au Tronc commun au Maroc.

**Règles d'accès :**
- l'élève voit ses propres données ;
- le prof voit les données des élèves de **ses** classes (fonction `is_teacher_of`) ;
- les **conversations avec le coach sont privées**, comme chez Mathflow : ni le prof ni un parent ne les lit ;
- la **bonne réponse** d'un exercice n'est jamais envoyée au navigateur : la correction se fait sur le serveur.

## API (actions serveur Next.js)

| méthode et chemin | rôle | qui | entrée | sortie | flow |
| --- | --- | --- | --- | --- | --- |
| POST `/api/auth/join` | rejoindre une classe | visiteur | code de classe, pseudo, PIN à 4 chiffres | session élève | F01 |
| POST `/api/auth/teacher` | inscription / connexion prof | visiteur | email | lien magique | F06 |
| PATCH `/api/me` | langue, pays, niveau | connecté | locale, curriculum_id, level_id | profil | F01 |
| GET `/api/diagnostic` | questions du diagnostic | élève | level_id | 10 exercices | F01 |
| POST `/api/diagnostic` | fin du diagnostic | élève | réponses | maîtrise initiale | F01 |
| GET `/api/home` | accueil : reprendre, défi du jour, devoirs, flamme | élève | — | données de l'accueil | F02 |
| GET `/api/chapters/:id` | chemin du chapitre | élève | — | compétences et leur état | F02 |
| GET `/api/skills/:id/sheet?kind=` | fiche cours ou méthode | élève | locale | markdown, speech_text | F02 |
| GET `/api/skills/:id/next` | prochain exercice adapté | élève | — | exercice (sans la réponse) | F02 |
| POST `/api/attempts` | corriger une réponse | élève | exercise_id, answer, client_attempt_id | juste / faux, « Pourquoi ? », nouvelle maîtrise | F02 |
| POST `/api/coach` | message au coach (en streaming) | élève | conversation_id?, texte, photo? | réponse en flux | F03 |
| GET / PUT `/api/dys` | réglages DYS | élève, ou son prof | préférences | préférences | F05 |
| GET / POST `/api/classes` | lister ou créer une classe | prof | nom, level_id | classe et code | F06 |
| GET `/api/classes/:id/heatmap` | élèves × compétences | prof de la classe | — | grille de maîtrise | F06 |
| POST `/api/assignments` | créer et publier un devoir | prof de la classe | compétences, date, niveau minimum | devoir | F06 |
| GET `/api/classes/:id/export` | export CSV | prof de la classe | — | CSV | F06 |

Webhooks entrants : aucun (pas de paiement). Webhooks sortants : aucun.

**Tâches planifiées (Vercel Cron) :**
- `streaks`, chaque nuit à 2 h UTC : calcule les flammes et utilise le gel si besoin ;
- `alerts`, chaque nuit : repère les élèves inactifs depuis 3 jours et les compétences avec des difficultés répétées, puis les montre au prof dans S18 ;
- `purge-photos`, chaque jour : supprime les photos de plus de 30 jours ;
- `content-import`, à chaque déploiement : importe `content/` dans la base.

Uniquement des API officielles (Anthropic, Supabase, Resend) avec les clés de l'école. Rien de Mathflow.

## Les parties qui piquent

- **Contenu** : c'est le vrai travail. Il faut un format simple (un fichier par notion, avec les blocs `fr:` et `ar:`), un script qui vérifie qu'aucune traduction ne manque et que chaque exercice a sa réponse, et une relecture humaine par un prof de maths **arabophone** pour l'AR.
- **Arabe et formules** : le texte s'écrit de droite à gauche, les formules de gauche à droite. Chiffres : **0-9 partout, y compris en arabe** (décision de l'utilisateur, 2026-11-15). Il faut tester chaque composant en RTL.
- **Correction des réponses** : comparer « 1/2 », « 0,5 » et « 0.5 » ; vérifier qu'une expression équivaut à la bonne (par exemple avec une bibliothèque de calcul formel côté serveur, compute-engine de MathLive). Toujours côté serveur.
- **Coach IA et mineurs** : il guide, il ne donne pas la réponse ; il refuse le hors-sujet ; il signale la détresse (`safety_flag`) à un adulte référent sans montrer la conversation. Plafond de messages par jour pour maîtriser le coût.
- **Coût du coach** : un petit modèle (Haiku) par défaut, un plus gros seulement pour les photos. Compteur de jetons par élève.
- **Lecture audio des formules** : les voix du navigateur lisent mal les formules. On écrit un `speech_text` pour chaque fiche ; plus tard, on pourra le générer puis le faire relire.
- **Idempotence** : `client_attempt_id` unique, pour qu'un double clic ou un réseau lent ne compte pas deux réponses.
- **Fuseaux horaires** : la flamme se calcule au jour local de l'élève (Paris, Casablanca, La Réunion, qui est à UTC+4).
- **Données d'élèves (RGPD, loi 09-08 au Maroc)** : pseudos au lieu de noms ; hébergement en UE ; suppression de compte réelle (cascade) ; registre des traitements et information des parents à faire par l'école ; pas de traceurs publicitaires.
- **Classement et anxiété** : désactivé par défaut (`leaderboard_enabled = false`) ; le prof choisit.
- **Plusieurs écoles** : chaque classe appartient à une école ; les règles d'accès passent par la classe, donc deux profs ne voient jamais les élèves l'un de l'autre.

## Ordre de construction

1. **Tranche verticale** (moche mais complète). Un prof crée une classe, un élève la rejoint avec le code, choisit FR ou AR, ouvre le chapitre « Notion de fonction », lit la fiche, fait 3 exercices (dont une activité Mafs), voit « Bien joué ! / Pourquoi ? », et le prof voit le résultat.
   Écrans : S01, S02, S04, S05b, S06, S08, S08b, S09, S17, S18. Tables : schools, profiles, classes, class_members, curricula, levels, chapters, skills, notions, skill_notions, sheets, exercises, attempts, mastery. Routes : join, teacher, me, chapters, sheet, next, attempts, classes, heatmap.
2. **Must-haves** :
   - mode DYS (S15 : polices, taille, espacement, fond, règle de lecture) ;
   - fiche méthode (S07), épreuve de chapitre, diagnostic (S03) ;
   - coach IA en texte (S10) ;
   - interface entièrement traduite en arabe et en RTL ;
   - le chapitre complet, avec ses 3 niveaux d'exercices, en FR et en AR.
3. **Should-haves** :
   - lecture audio, une consigne à la fois, pas de chronomètre, réponse à l'oral ;
   - devoirs (S19), prescription du mode DYS par le prof ;
   - coach par photo (S11), indices, quiz de révision (S12) ;
   - flamme et défi du jour, alertes, mode parent (S22).
4. **Could-haves** :
   - coloration syllabique, couleurs par rang (dyscalculie) ;
   - mini-jeux, quêtes, classement, avatars ;
   - collège 6e à 3e, Belgique, Suisse, UK, US.
5. **Corrections** venant de /replica-entrepreneur (avis des utilisateurs de Mathflow), une fois cette étape lancée.
