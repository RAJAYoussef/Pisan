ALTER TABLE public.classes ADD COLUMN track text NULL CHECK (track IS NULL OR track ~ '^[a-z0-9-]{1,20}$');
GRANT SELECT (track), INSERT (track), UPDATE (track) ON public.classes TO authenticated;

ALTER TABLE public.class_assignments ADD COLUMN kind text NOT NULL DEFAULT 'skills' CHECK (kind IN ('skills','review'));
ALTER TABLE public.class_assignments ADD COLUMN member_ids uuid[] NULL CHECK (member_ids IS NULL OR (cardinality(member_ids) BETWEEN 1 AND 200));
ALTER TABLE public.class_assignments DROP CONSTRAINT class_assignments_skill_ids_check;
ALTER TABLE public.class_assignments ADD CONSTRAINT class_assignments_skill_ids_check CHECK (cardinality(skill_ids) BETWEEN 1 AND 60);
GRANT UPDATE (title, skill_ids, due_date, kind, member_ids) ON public.class_assignments TO authenticated;

ALTER TABLE public.class_members DROP CONSTRAINT class_members_token_hash_fkey;
ALTER TABLE public.class_members ADD CONSTRAINT class_members_token_hash_fkey FOREIGN KEY (token_hash) REFERENCES public.learning_sessions(token_hash) ON UPDATE CASCADE;
ALTER TABLE public.fraction_learning_journal DROP CONSTRAINT fraction_learning_journal_token_hash_fkey;
ALTER TABLE public.fraction_learning_journal ADD CONSTRAINT fraction_learning_journal_token_hash_fkey FOREIGN KEY (token_hash) REFERENCES public.learning_sessions(token_hash) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION public.rekey_pisan_session(p_old_hash text, p_new_hash text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_new_hash IS NULL OR p_new_hash !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM learning_sessions WHERE token_hash = p_new_hash) THEN RETURN false; END IF;
  PERFORM 1 FROM learning_sessions WHERE token_hash = p_old_hash FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE learning_sessions SET token_hash = p_new_hash WHERE token_hash = p_old_hash;
  UPDATE fraction_learning_journal SET token_hash = p_new_hash WHERE token_hash = p_old_hash;
  UPDATE skill_runs SET token_hash = p_new_hash WHERE token_hash = p_old_hash;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.rekey_pisan_session(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rekey_pisan_session(text, text) TO service_role;