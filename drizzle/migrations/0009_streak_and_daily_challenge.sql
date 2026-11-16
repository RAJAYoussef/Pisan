ALTER TABLE public.learning_sessions
  ADD COLUMN streak_count integer NOT NULL DEFAULT 0,
  ADD COLUMN streak_last_day date,
  ADD COLUMN freezes integer NOT NULL DEFAULT 0 CHECK (freezes BETWEEN 0 AND 2),
  ADD COLUMN challenge_day date,
  ADD COLUMN challenge_correct boolean;

CREATE OR REPLACE FUNCTION public.record_pisan_streak(p_hash text, p_day date) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.learning_sessions; v_count int; v_free int; v_used boolean := false; v_restart boolean := false; v_gap int;
BEGIN
  SELECT * INTO s FROM public.learning_sessions WHERE token_hash = p_hash FOR UPDATE;
  IF NOT FOUND THEN RETURN NULL; END IF;
  v_count := s.streak_count; v_free := LEAST(2, GREATEST(0, s.freezes));
  IF s.streak_last_day IS NULL OR v_count <= 0 THEN v_count := 1;
  ELSE
    v_gap := p_day - s.streak_last_day;
    IF v_gap <= 0 THEN
      RETURN jsonb_build_object('count', v_count, 'last_day', s.streak_last_day, 'freezes', v_free, 'used_freeze', false, 'restarted', false);
    ELSIF v_gap = 1 THEN v_count := v_count + 1;
    ELSIF v_gap = 2 AND v_free > 0 THEN v_count := v_count + 1; v_free := v_free - 1; v_used := true;
    ELSE v_count := 1; v_restart := true;
    END IF;
  END IF;
  IF NOT v_restart AND v_count % 7 = 0 THEN v_free := LEAST(2, v_free + 1); END IF;
  UPDATE public.learning_sessions SET streak_count = v_count, streak_last_day = p_day, freezes = v_free WHERE token_hash = p_hash;
  RETURN jsonb_build_object('count', v_count, 'last_day', p_day, 'freezes', v_free, 'used_freeze', v_used, 'restarted', v_restart);
END; $$;
REVOKE ALL ON FUNCTION public.record_pisan_streak(text, date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_pisan_streak(text, date) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_pisan_challenge(p_hash text, p_day date, p_correct boolean) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.learning_sessions;
BEGIN
  SELECT * INTO s FROM public.learning_sessions WHERE token_hash = p_hash FOR UPDATE;
  IF NOT FOUND OR s.challenge_day = p_day THEN RETURN false; END IF;
  UPDATE public.learning_sessions SET challenge_day = p_day, challenge_correct = p_correct WHERE token_hash = p_hash;
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.claim_pisan_challenge(text, date, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_pisan_challenge(text, date, boolean) TO service_role;