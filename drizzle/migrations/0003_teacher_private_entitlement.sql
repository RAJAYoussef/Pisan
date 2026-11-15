ALTER TABLE public.teachers DROP CONSTRAINT teachers_id_fkey;
REVOKE SELECT ON public.teachers FROM authenticated;
GRANT SELECT (id,display_name,school_name) ON public.teachers TO authenticated;