ALTER TABLE public.learning_sessions ADD COLUMN IF NOT EXISTS timezone_changed_at timestamptz;

CREATE OR REPLACE FUNCTION public.record_pisan_streak(p_hash text, p_day date) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.learning_sessions; v_count int; v_free int; v_used boolean := false; v_restart boolean := false; v_gap int;
BEGIN
  SELECT * INTO s FROM public.learning_sessions WHERE token_hash = p_hash FOR UPDATE;
  IF NOT FOUND THEN RETURN NULL; END IF;
  v_count := s.streak_count; v_free := LEAST(2, GREATEST(0, s.freezes));
  IF p_day IS NULL OR p_day > (now() AT TIME ZONE 'UTC')::date + 1 OR (s.streak_last_day IS NOT NULL AND p_day <= s.streak_last_day) THEN
    RETURN jsonb_build_object('count', v_count, 'last_day', s.streak_last_day, 'freezes', v_free, 'used_freeze', false, 'restarted', false);
  END IF;
  IF s.streak_last_day IS NULL OR v_count <= 0 THEN v_count := 1;
  ELSE
    v_gap := p_day - s.streak_last_day;
    IF v_gap = 1 THEN v_count := v_count + 1;
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
  IF NOT FOUND OR p_day IS NULL OR p_day > (now() AT TIME ZONE 'UTC')::date + 1 OR (s.challenge_day IS NOT NULL AND p_day <= s.challenge_day) THEN RETURN false; END IF;
  UPDATE public.learning_sessions SET challenge_day = p_day, challenge_correct = p_correct WHERE token_hash = p_hash;
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.claim_pisan_challenge(text, date, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_pisan_challenge(text, date, boolean) TO service_role;

CREATE OR REPLACE FUNCTION public.append_pisan_attempt(p_hash text, p_attempt jsonb, p_day date) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.learning_sessions; v_attempts jsonb; v_unlocked jsonb; v_progress jsonb; v_streak jsonb;
BEGIN
  SELECT * INTO s FROM public.learning_sessions WHERE token_hash = p_hash FOR UPDATE;
  IF NOT FOUND THEN RETURN NULL; END IF;
  v_attempts := COALESCE(s.progress->'attempts', '[]'::jsonb) || jsonb_build_array(p_attempt);
  IF jsonb_array_length(v_attempts) > 500 THEN
    SELECT COALESCE(jsonb_agg(e ORDER BY i), '[]'::jsonb) INTO v_attempts FROM jsonb_array_elements(v_attempts) WITH ORDINALITY AS t(e, i) WHERE i > jsonb_array_length(v_attempts) - 500;
  END IF;
  v_unlocked := COALESCE(s.progress->'unlocked', '[]'::jsonb);
  IF p_attempt->>'kind' = 'consolidation' AND (p_attempt->>'correct') = (p_attempt->>'total') AND NOT v_unlocked ? (p_attempt->>'notion') THEN
    v_unlocked := v_unlocked || jsonb_build_array(p_attempt->>'notion');
  END IF;
  v_progress := jsonb_build_object('attempts', v_attempts, 'unlocked', v_unlocked);
  UPDATE public.learning_sessions SET progress = v_progress, last_active_at = now() WHERE token_hash = p_hash;
  v_streak := public.record_pisan_streak(p_hash, p_day);
  RETURN jsonb_build_object('progress', v_progress, 'streak', v_streak);
END; $$;
REVOKE ALL ON FUNCTION public.append_pisan_attempt(text, jsonb, date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.append_pisan_attempt(text, jsonb, date) TO service_role;