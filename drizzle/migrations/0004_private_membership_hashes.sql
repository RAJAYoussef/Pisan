REVOKE SELECT ON public.class_members FROM authenticated;
GRANT SELECT (id,class_id,joined_at) ON public.class_members TO authenticated;