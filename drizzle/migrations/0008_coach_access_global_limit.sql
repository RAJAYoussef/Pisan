CREATE TABLE public.coach_global_usage (day date PRIMARY KEY, count integer NOT NULL DEFAULT 0);
GRANT ALL ON public.coach_global_usage TO service_role;
ALTER TABLE public.coach_global_usage ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.consume_pisan_coach_gated(p_hash text, p_limit integer, p_global integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; g integer;
BEGIN
  SELECT coach_count, coach_date, partner INTO r FROM public.learning_sessions WHERE token_hash = p_hash FOR UPDATE;
  IF NOT FOUND THEN RETURN -3; END IF;
  IF NOT r.partner AND NOT EXISTS (SELECT 1 FROM public.class_members WHERE token_hash = p_hash) THEN RETURN -3; END IF;
  IF r.coach_date <> current_date THEN r.coach_count := 0; END IF;
  IF r.coach_count >= p_limit THEN RETURN -1; END IF;
  INSERT INTO public.coach_global_usage(day, count) VALUES (current_date, 0) ON CONFLICT (day) DO NOTHING;
  SELECT count INTO g FROM public.coach_global_usage WHERE day = current_date FOR UPDATE;
  IF g >= p_global THEN RETURN -2; END IF;
  UPDATE public.coach_global_usage SET count = g + 1 WHERE day = current_date;
  UPDATE public.learning_sessions SET coach_count = r.coach_count + 1, coach_date = current_date WHERE token_hash = p_hash;
  RETURN p_limit - r.coach_count - 1;
END $$;
REVOKE ALL ON FUNCTION public.consume_pisan_coach_gated(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_pisan_coach_gated(text, integer, integer) TO service_role;
COMMENT ON FUNCTION public.consume_pisan_coach(text, integer) IS 'DEPRECATED: replaced by consume_pisan_coach_gated';