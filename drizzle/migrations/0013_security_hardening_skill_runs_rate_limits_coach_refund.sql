CREATE TABLE public.skill_runs (
  ref text PRIMARY KEY,
  token_hash text NOT NULL,
  step integer NOT NULL DEFAULT 0,
  missed integer[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON TABLE public.skill_runs FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.skill_runs TO service_role;
ALTER TABLE public.skill_runs ENABLE ROW LEVEL SECURITY;
CREATE INDEX skill_runs_updated_at_idx ON public.skill_runs (updated_at);

CREATE FUNCTION public.pisan_skill_check(p_hash text, p_ref text, p_step integer, p_ok boolean, p_total integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_run public.skill_runs%ROWTYPE;
BEGIN
  DELETE FROM public.skill_runs WHERE updated_at < now() - interval '2 days';
  INSERT INTO public.skill_runs (ref, token_hash)
  VALUES (p_ref, p_hash)
  ON CONFLICT (ref) DO NOTHING;

  SELECT * INTO v_run
  FROM public.skill_runs
  WHERE ref = p_ref
  FOR UPDATE;

  IF v_run.token_hash <> p_hash OR v_run.step <> p_step OR p_step >= p_total THEN
    RETURN jsonb_build_object('stale', true);
  END IF;

  IF p_ok THEN
    v_run.step := v_run.step + 1;
  ELSE
    IF NOT (p_step = ANY(v_run.missed)) THEN
      v_run.missed := array_append(v_run.missed, p_step);
    END IF;
  END IF;

  UPDATE public.skill_runs
  SET step = v_run.step, missed = v_run.missed, updated_at = now()
  WHERE ref = p_ref;

  RETURN jsonb_build_object('stale', false, 'step', v_run.step, 'missed', to_jsonb(v_run.missed));
END;
$$;
REVOKE ALL ON FUNCTION public.pisan_skill_check(text, text, integer, boolean, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pisan_skill_check(text, text, integer, boolean, integer) TO service_role;

CREATE FUNCTION public.pisan_skill_result(p_hash text, p_ref text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object('step', step, 'missed', to_jsonb(missed))
  INTO v_result
  FROM public.skill_runs
  WHERE ref = p_ref AND token_hash = p_hash;
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.pisan_skill_result(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pisan_skill_result(text, text) TO service_role;

CREATE TABLE public.rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  count integer NOT NULL
);
REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.pisan_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';

  INSERT INTO public.rate_limits AS limits (key, window_start, count)
  VALUES (p_key, now(), 1)
  ON CONFLICT (key) DO UPDATE
  SET window_start = CASE
        WHEN limits.window_start < now() - make_interval(secs => p_window_seconds) THEN now()
        ELSE limits.window_start
      END,
      count = CASE
        WHEN limits.window_start < now() - make_interval(secs => p_window_seconds) THEN 1
        ELSE limits.count + 1
      END
  RETURNING count INTO v_count;

  RETURN v_count <= p_limit;
END;
$$;
REVOKE ALL ON FUNCTION public.pisan_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pisan_rate_limit(text, integer, integer) TO service_role;

CREATE FUNCTION public.refund_pisan_coach(p_hash text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.learning_sessions
  SET coach_count = greatest(coach_count - 1, 0)
  WHERE token_hash = p_hash AND coach_date = current_date;

  UPDATE public.coach_global_usage
  SET count = greatest(count - 1, 0)
  WHERE day = current_date;
END;
$$;
REVOKE ALL ON FUNCTION public.refund_pisan_coach(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_pisan_coach(text) TO service_role;
