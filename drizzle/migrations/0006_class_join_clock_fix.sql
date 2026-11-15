CREATE OR REPLACE FUNCTION public.join_pisan_class_limited(p_hash text,p_code text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.learning_sessions; recent timestamptz[]; target public.classes; entitled boolean; v_now timestamptz := clock_timestamp();
BEGIN
 SELECT * INTO s FROM public.learning_sessions WHERE token_hash=p_hash FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('status','missing'); END IF;
 SELECT coalesce(array_agg(a),'{}'::timestamptz[]) INTO recent FROM unnest(s.class_join_attempts) a WHERE a > v_now - interval '1 hour';
 IF cardinality(recent) >= 10 THEN RETURN jsonb_build_object('status','limited'); END IF;
 UPDATE public.learning_sessions SET class_join_attempts=array_append(recent,v_now) WHERE token_hash=p_hash;
 IF p_code !~ '^[A-Za-z0-9]{2}-?[A-Za-z0-9]{4}$' THEN RETURN jsonb_build_object('status','invalid'); END IF;
 SELECT * INTO target FROM public.classes WHERE join_code=upper(replace(trim(p_code),'-',''));
 IF target.id IS NULL THEN RETURN jsonb_build_object('status','invalid'); END IF;
 INSERT INTO public.class_members(class_id,token_hash) VALUES(target.id,p_hash) ON CONFLICT DO NOTHING;
 SELECT EXISTS(SELECT 1 FROM public.teachers t JOIN public.partner_codes p ON p.code=t.partner_code WHERE t.id=target.teacher_id AND p.active=true) INTO entitled;
 UPDATE public.learning_sessions SET partner=partner OR entitled WHERE token_hash=p_hash;
 RETURN jsonb_build_object('status','joined','name',target.name);
END $$;
REVOKE ALL ON FUNCTION public.join_pisan_class_limited(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.join_pisan_class_limited(text,text) TO service_role;