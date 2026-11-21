CREATE TABLE public.question_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  skill_id text NOT NULL CHECK (skill_id ~ '^[a-z]+(-[a-z]+){1,3}$'),
  seed integer NOT NULL CHECK (seed BETWEEN 0 AND 1000000),
  step integer NOT NULL CHECK (step BETWEEN 0 AND 30),
  context text NOT NULL CHECK (context IN ('pathway','review','placement','other')),
  lang text NOT NULL CHECK (lang IN ('fr','en','ar','es')),
  reason text NOT NULL CHECK (reason IN ('wrong-answer','unclear','display','other')),
  message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 500),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','done'))
);
CREATE INDEX question_reports_status_created_at_idx ON public.question_reports (status, created_at DESC);
ALTER TABLE public.question_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.question_reports FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.question_reports TO service_role;