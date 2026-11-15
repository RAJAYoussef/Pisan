CREATE TABLE public.partner_codes (
  code text PRIMARY KEY,
  school_name text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
GRANT ALL ON public.partner_codes TO service_role;
REVOKE ALL ON public.partner_codes FROM anon, authenticated;
ALTER TABLE public.partner_codes ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX partner_codes_case_insensitive ON public.partner_codes (lower(code));