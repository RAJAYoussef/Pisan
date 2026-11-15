-- PiSan : schéma Postgres (Supabase). Première migration.
-- Toutes les heures en timestamptz (UTC). Textes traduits en jsonb : {"fr": "...", "ar": "...", "en": "..."}.
-- Accès : Row Level Security (RLS) sur toutes les tables.

create extension if not exists pgcrypto;

-- ───────────── Établissements, personnes, classes ─────────────

create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null check (country in ('FR','MA','BE','CH','UK','US')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Un profil par compte Supabase Auth. Les élèves n'ont pas besoin d'email :
-- ils rejoignent avec un code de classe et un pseudo (données minimales, RGPD mineurs).
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete set null,
  role text not null default 'student' check (role in ('student','teacher','admin')),
  display_name text not null,                       -- pseudo ou prénom, jamais le nom complet obligatoire
  locale text not null default 'fr' check (locale in ('fr','ar','en')),
  curriculum_id uuid,                               -- FK ajoutée plus bas
  level_id uuid,                                    -- FK ajoutée plus bas
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on profiles (school_id);

create table classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  level_id uuid,                                    -- FK ajoutée plus bas
  join_code text not null unique,                   -- ex. "PI-7KQ2"
  leaderboard_enabled boolean not null default false, -- classement désactivé par défaut
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on classes (teacher_id);

create table class_members (
  class_id uuid not null references classes(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);
create index on class_members (student_id);

-- ───────────── Référentiels (pays → niveau → chapitre → compétence) ─────────────

create table curricula (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                        -- 'FR-EN' (Éducation nationale), 'MA-MEN', 'BE-FWB', 'CH-PER', 'UK-NC', 'US-CCSS'
  country text not null,
  title jsonb not null,
  locales text[] not null,                          -- langues proposées pour ce référentiel
  source_url text,                                  -- lien vers le programme officiel
  created_at timestamptz not null default now()
);

create table levels (
  id uuid primary key default gen_random_uuid(),
  curriculum_id uuid not null references curricula(id) on delete cascade,
  code text not null,                               -- 'FR-2NDE', 'MA-TC'
  title jsonb not null,
  position int not null,
  unique (curriculum_id, code)
);
create index on levels (curriculum_id, position);

create table domains (                              -- Nombres et calculs, Fonctions, Géométrie...
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title jsonb not null,
  position int not null
);

create table chapters (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references levels(id) on delete cascade,
  domain_id uuid references domains(id) on delete set null,
  slug text not null,
  title jsonb not null,
  position int not null,
  unique (level_id, slug)
);
create index on chapters (level_id, position);
create index on chapters (domain_id);

create table skills (                               -- les « compétences » (nœuds du chemin)
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  slug text not null,
  official_ref text,                                -- référence dans le programme officiel
  title jsonb not null,
  position int not null,
  is_chapter_test boolean not null default false,   -- l'épreuve de fin de chapitre
  unique (chapter_id, slug)
);
create index on skills (chapter_id, position);

-- Notions communes à tous les pays : on écrit le contenu UNE fois par notion,
-- puis on le relie aux compétences de chaque référentiel.
create table notions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                        -- 'fonction.image-antecedent'
  title jsonb not null
);
create table skill_notions (
  skill_id uuid not null references skills(id) on delete cascade,
  notion_id uuid not null references notions(id) on delete cascade,
  primary key (skill_id, notion_id)
);
create index on skill_notions (notion_id);

-- ───────────── Contenu (écrit par nous, versionné dans le dépôt, importé ici) ─────────────

create table sheets (                               -- fiches cours et méthode
  id uuid primary key default gen_random_uuid(),
  notion_id uuid not null references notions(id) on delete cascade,
  kind text not null check (kind in ('cours','methode')),
  locale text not null check (locale in ('fr','ar','en')),
  body_md text not null,                            -- markdown + LaTeX
  speech_text text,                                 -- version « à lire à voix haute » (formules en mots)
  version int not null default 1,
  updated_at timestamptz not null default now(),
  unique (notion_id, kind, locale)
);

create table exercises (
  id uuid primary key default gen_random_uuid(),
  notion_id uuid not null references notions(id) on delete cascade,
  tier text not null check (tier in ('manipuler','expliquer','raisonner')),
  kind text not null check (kind in ('numeric','expression','mcq','interactive','drag')),
  position int not null,
  content jsonb not null,                           -- {fr:{statement, hints[], why_steps[]}, ar:{...}}
  answer jsonb not null,                            -- réponse attendue et tolérances ; JAMAIS envoyé au client
  widget jsonb,                                     -- config de l'activité interactive (graphique, figure)
  version int not null default 1
);
create index on exercises (notion_id, tier, position);

-- ───────────── Activité de l'élève ─────────────

create table attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  answer jsonb not null,
  is_correct boolean not null,
  hints_used int not null default 0,
  asked_why boolean not null default false,
  duration_ms int,
  client_attempt_id uuid not null,                  -- idempotence (double clic, réseau lent)
  created_at timestamptz not null default now(),
  unique (student_id, client_attempt_id)
);
create index on attempts (student_id, created_at desc);
create index on attempts (skill_id);
create index on attempts (exercise_id);

create table mastery (
  student_id uuid not null references profiles(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  score numeric(4,3) not null default 0 check (score between 0 and 1),
  status text not null default 'todo' check (status in ('todo','in_progress','mastered')),
  updated_at timestamptz not null default now(),
  primary key (student_id, skill_id)
);
create index on mastery (skill_id);

create table daily_activity (                       -- pour la flamme et le résumé de la semaine
  student_id uuid not null references profiles(id) on delete cascade,
  day date not null,                                -- jour dans le fuseau de l'élève
  minutes int not null default 0,
  series_done int not null default 0,
  stars int not null default 0,
  freeze_used boolean not null default false,       -- le « gel » qui protège la flamme
  primary key (student_id, day)
);

-- ───────────── Coach IA ─────────────

create table coach_conversations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete set null,
  locale text not null,
  created_at timestamptz not null default now()
);
create index on coach_conversations (student_id, created_at desc);

create table coach_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references coach_conversations(id) on delete cascade,
  role text not null check (role in ('student','coach')),
  content text not null,
  image_path text,                                  -- photo d'exercice (Storage privé, supprimée après 30 jours)
  safety_flag boolean not null default false,       -- message signalé (détresse, contenu inapproprié)
  tokens_in int, tokens_out int,
  created_at timestamptz not null default now()
);
create index on coach_messages (conversation_id, created_at);

-- ───────────── Mode DYS ─────────────

create table dys_preferences (
  student_id uuid primary key references profiles(id) on delete cascade,
  font text not null default 'default' check (font in ('default','lexend','opendyslexic','andika')),
  font_scale numeric(3,2) not null default 1.00 check (font_scale between 0.8 and 2.0),
  line_height numeric(3,2) not null default 1.50,
  letter_spacing numeric(3,2) not null default 0.00,
  background text not null default 'white' check (background in ('white','cream','blue','dark')),
  reading_ruler boolean not null default false,
  syllable_colors boolean not null default false,   -- FR uniquement au départ
  place_value_colors boolean not null default false,-- dyscalculie : unités, dizaines, centaines
  one_step_at_a_time boolean not null default false,
  tts_auto boolean not null default false,
  tts_rate numeric(3,2) not null default 1.00,
  no_timer boolean not null default false,
  voice_answer boolean not null default false,      -- répondre à l'oral (dysgraphie)
  prescribed_by uuid references profiles(id) on delete set null, -- enseignant (PAP / PAI)
  updated_at timestamptz not null default now()
);

-- ───────────── Enseignant : devoirs ─────────────

create table assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  created_by uuid not null references profiles(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on assignments (class_id, due_at);

create table assignment_skills (
  assignment_id uuid not null references assignments(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  min_tier text not null default 'manipuler' check (min_tier in ('manipuler','expliquer','raisonner')),
  primary key (assignment_id, skill_id)
);
create index on assignment_skills (skill_id);

-- ───────────── Clés étrangères différées ─────────────

alter table profiles add constraint profiles_curriculum_fk foreign key (curriculum_id) references curricula(id) on delete set null;
alter table profiles add constraint profiles_level_fk foreign key (level_id) references levels(id) on delete set null;
alter table classes  add constraint classes_level_fk foreign key (level_id) references levels(id) on delete set null;
create index on profiles (curriculum_id);
create index on profiles (level_id);
create index on classes (level_id);

-- ───────────── Row Level Security ─────────────

create or replace function is_teacher_of(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from class_members m join classes c on c.id = m.class_id
    where m.student_id = student and c.teacher_id = auth.uid()
  );
$$;

alter table profiles enable row level security;
create policy "moi" on profiles for select using (id = auth.uid() or is_teacher_of(id));
create policy "moi maj" on profiles for update using (id = auth.uid());

alter table classes enable row level security;
create policy "prof" on classes for all using (teacher_id = auth.uid());
create policy "élève voit sa classe" on classes for select
  using (exists (select 1 from class_members m where m.class_id = id and m.student_id = auth.uid()));

alter table class_members enable row level security;
create policy "élève" on class_members for select using (student_id = auth.uid());
create policy "prof" on class_members for all
  using (exists (select 1 from classes c where c.id = class_id and c.teacher_id = auth.uid()));

-- Contenu : lecture pour tout utilisateur connecté (exercises.answer n'est lu que côté serveur, via une vue sans la colonne).
do $$ declare t text; begin
  foreach t in array array['curricula','levels','domains','chapters','skills','notions','skill_notions','sheets'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "lecture" on %I for select using (auth.role() = ''authenticated'')', t);
  end loop;
end $$;
alter table exercises enable row level security;   -- aucune policy client : passer par la vue exercises_public
create view exercises_public with (security_invoker = false) as
  select id, notion_id, tier, kind, position, content, widget, version from exercises;
grant select on exercises_public to authenticated;

alter table attempts enable row level security;
create policy "élève" on attempts for select using (student_id = auth.uid() or is_teacher_of(student_id));
-- les insertions passent par le serveur (correction côté serveur), pas par le client

alter table mastery enable row level security;
create policy "élève ou prof" on mastery for select using (student_id = auth.uid() or is_teacher_of(student_id));

alter table daily_activity enable row level security;
create policy "élève ou prof" on daily_activity for select using (student_id = auth.uid() or is_teacher_of(student_id));

-- Coach : PRIVÉ. Ni le prof ni les parents ne lisent les conversations.
alter table coach_conversations enable row level security;
create policy "élève seul" on coach_conversations for select using (student_id = auth.uid());
alter table coach_messages enable row level security;
create policy "élève seul" on coach_messages for select
  using (exists (select 1 from coach_conversations c where c.id = conversation_id and c.student_id = auth.uid()));

alter table dys_preferences enable row level security;
create policy "élève" on dys_preferences for all using (student_id = auth.uid());
create policy "prof prescrit" on dys_preferences for all using (is_teacher_of(student_id));

alter table assignments enable row level security;
create policy "prof" on assignments for all
  using (exists (select 1 from classes c where c.id = class_id and c.teacher_id = auth.uid()));
create policy "élève publié" on assignments for select
  using (status = 'published' and exists (select 1 from class_members m where m.class_id = assignments.class_id and m.student_id = auth.uid()));

alter table assignment_skills enable row level security;
create policy "lecture" on assignment_skills for select using (
  exists (select 1 from assignments a where a.id = assignment_id));  -- filtré par la policy de assignments
create policy "prof" on assignment_skills for all using (
  exists (select 1 from assignments a join classes c on c.id = a.class_id
          where a.id = assignment_id and c.teacher_id = auth.uid()));
