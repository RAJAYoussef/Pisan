# Prompts à coller dans Lovable, dans l'ordre

Un prompt à la fois. Attends que Lovable ait fini, **teste dans l'aperçu**, puis passe au suivant.
Si quelque chose casse, écris dans Lovable : « Annule la dernière modification » (ou utilise l'historique), puis renvoie-moi ce que tu vois.

---

## 1. Sécurité du code partenaire (à faire avant de montrer l'app à des élèves)

```
Sécurité du code partenaire, sans changer le design :
1. Retire de l'interface le bouton « Simuler Code PILOTE2026 » et toute mention écrite du code PILOTE2026 (dans i18n.ts aussi). Le champ « Code Établissement Partenaire » reste.
2. Le code ne doit plus être dans le code envoyé au navigateur : supprime PARTNER_CODE de src/lib/plan.ts côté client. Crée une table partner_codes (code text primary key, school_name text, active boolean default true, created_at timestamptz) accessible uniquement par le service_role, et vérifie le code dans la server function openSession en interrogeant cette table (comparaison insensible à la casse). Ajoute PILOTE2026 comme première ligne.
3. Cache la barre de test « Vue Élève / Vue Parent/Prof » quand l'app tourne en production (garde-la en développement et dans l'aperçu Lovable).
4. Mets à jour les tests de src/test pour ces changements.
```

## 2. Mode DYS (la promesse principale de PiSan)

```
Ajoute un « Mode DYS » accessible depuis le bouton Réglages (icône engrenage) et depuis un bouton visible « Aa » dans l'en-tête. Les réglages s'appliquent immédiatement à TOUTE l'app, avec un aperçu en direct, et sont enregistrés dans le profil de la session (profile.dys dans learning_sessions) pour être retrouvés sur un autre appareil.

Réglages :
- Police : Par défaut (Nunito) / Lexend / OpenDyslexic / Andika. Pour l'arabe, garder Tajawal mais avec les réglages d'espacement. Charger Lexend et Andika depuis Google Fonts, et OpenDyslexic depuis cdn.jsdelivr.net (licence libre).
- Taille du texte : 100 % à 175 % (curseur).
- Interligne : normal / large / très large.
- Espacement des lettres et des mots : normal / large.
- Couleur de fond : blanc / crème (#FBF5E6) / bleu pâle (#EAF2FB) / sombre. Le texte doit garder un contraste d'au moins 4,5:1.
- Règle de lecture : une bande horizontale semi-transparente qui suit le pointeur ou le doigt, pour lire une ligne à la fois.
- Une consigne à la fois : dans les exercices, afficher les étapes une par une avec un bouton « Étape suivante ».
- Lecture automatique : lire l'énoncé à voix haute dès qu'il s'affiche, avec un réglage de vitesse (0,75x / 1x / 1,25x).
- Sans chrono : masquer tous les comptes à rebours (consolidation, contrôles) et ne jamais limiter le temps.

Implémentation : tout passe par des variables CSS sur l'élément racine (--pisan-font, --pisan-scale, --pisan-line-height, --pisan-letter-spacing, --pisan-word-spacing, --pisan-bg), pas en modifiant chaque composant. Ne jamais appliquer l'espacement des lettres aux formules (les éléments avec dir="ltr" qui affichent des expressions mathématiques). Ajoute des tests Vitest pour l'enregistrement et l'application des réglages. Textes en FR, EN, AR et ES.
```

## 3. Espace enseignant avec de vraies classes

```
Ajoute un vrai espace enseignant, séparé de la vue élève :
- Un enseignant crée un compte avec son email (Supabase Auth, lien magique). Les élèves restent anonymes, avec un pseudo, sans email.
- Tables : teachers (id = auth.uid, display_name, school_name), classes (id, teacher_id, name, country, grade, join_code unique de 6 caractères, leaderboard_enabled default false, created_at), class_members (class_id, session token_hash, joined_at). Row Level Security : un enseignant ne voit que ses classes et leurs élèves.
- L'enseignant crée une classe et obtient un code (ex. PI-7KQ2) à donner aux élèves. Sur l'écran d'accueil élève, ajoute un champ facultatif « Code de classe » ; un élève peut aussi rejoindre une classe plus tard depuis les Réglages. Rejoindre une classe d'un établissement partenaire donne l'accès illimité.
- Tableau de bord de classe : une grille élèves × notions avec la maîtrise en couleur (0-39 % rouge clair, 40-79 % jaune, 80-100 % vert), les élèves inactifs depuis 3 jours, et les notions où plusieurs élèves bloquent. Clic sur un élève : sa vue de progrès actuelle.
- L'enseignant peut activer le Mode DYS pour un élève (les réglages de l'élève s'appliquent alors par défaut, l'élève peut encore les ajuster).
- Export CSV de la classe.
- Textes en FR, EN, AR et ES.
```

## 4. Référentiel détaillé : 2nde France et Tronc commun Maroc

```
Aujourd'hui, les 11 notions sont les mêmes pour tous les pays. Ajoute une couche « référentiel » sans dupliquer le contenu :
- Dans src/lib/curriculum.ts, pour chaque pays et chaque niveau, une liste de chapitres officiels (titre en FR, EN, AR, ES, et la référence du programme officiel). Chaque chapitre pointe vers une ou plusieurs notions existantes (NotionId).
- Commence par deux niveaux : France Seconde (programme de mathématiques de seconde générale et technologique) et Maroc Tronc commun scientifique. Uniquement des chapitres réellement au programme ; s'il manque une notion pour un chapitre, crée-la avec au moins 6 questions.
- L'atelier, les contrôles et le parcours affichent les chapitres du pays de l'élève, dans l'ordre du programme, au lieu de la liste générique.
- En arabe, les chiffres restent 0-9.
- Ajoute des tests : chaque chapitre pointe vers une notion existante, chaque notion a ses 4 traductions.
```

## 5. Exercices au-delà du QCM

```
Ajoute deux types d'exercices dans l'atelier, en plus du QCM :
1. Réponse libre : l'élève tape un nombre ou une fraction. Accepte 0,5 / 0.5 / 1/2 comme la même réponse, ainsi que les espaces. La vérification se fait côté serveur.
2. Graphique manipulable : un repère avec une droite ou une courbe et un point que l'élève déplace au doigt ou à la souris (ex. « place le point d'abscisse 3 sur la droite y = 2x - 1 », « trouve l'antécédent de 5 »). Coordonnées affichées en direct.
Après chaque réponse : « Bravo ! » ou « Presque ! », et un bouton « Pourquoi ? » qui affiche la correction étape par étape (et peut la lire à voix haute). Respecte le Mode DYS (une étape à la fois si activé).
```

## 6. Coach IA « Pi » (plus tard)

```
Ajoute un coach IA qui aide l'élève sur l'exercice en cours, via le gateway IA de Lovable (jamais de clé dans le navigateur) :
- Il guide par questions et indices, il ne donne JAMAIS directement la réponse finale.
- Il répond dans la langue de l'élève, avec des phrases courtes ; en Mode DYS, une idée par message, et lecture à voix haute.
- Il refuse poliment ce qui n'est pas des maths. Si l'élève exprime de la détresse, il répond avec bienveillance et l'invite à parler à un adulte de confiance.
- Maximum 20 messages par élève et par jour (compteur côté serveur, comme le quota d'exercices).
- Les conversations restent privées : l'enseignant ne les voit pas.
```
