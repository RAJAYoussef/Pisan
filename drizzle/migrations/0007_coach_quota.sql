ALTER TABLE public.learning_sessions ADD COLUMN IF NOT EXISTS coach_count integer NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS coach_date date NOT NULL DEFAULT current_date;
CREATE OR REPLACE FUNCTION public.consume_pisan_coach(p_hash text, p_limit integer DEFAULT 20)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  SELECT coach_count, coach_date INTO r FROM public.learning_sessions WHERE token_hash = p_hash FOR UPDATE;
  IF NOT FOUND THEN RETURN -1; END IF;
  IF r.coach_date <> current_date THEN r.coach_count := 0; END IF;
  IF r.coach_count >= p_limit THEN RETURN -1; END IF;
  UPDATE public.learning_sessions SET coach_count = r.coach_count + 1, coach_date = current_date WHERE token_hash = p_hash;
  RETURN p_limit - r.coach_count - 1;
END $$;
REVOKE ALL ON FUNCTION public.consume_pisan_coach(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_pisan_coach(text, integer) TO service_role;