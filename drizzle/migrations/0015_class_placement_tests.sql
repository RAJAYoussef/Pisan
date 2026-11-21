CREATE TABLE public.class_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  form text NOT NULL CHECK (form IN ('A','B')),
  items jsonb NOT NULL CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) BETWEEN 1 AND 80),
  is_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz NULL,
  UNIQUE (class_id, form)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_tests TO authenticated;
GRANT ALL ON public.class_tests TO service_role;
ALTER TABLE public.class_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY class_tests_teacher_all ON public.class_tests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_tests.class_id AND c.teacher_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_tests.class_id AND c.teacher_id = auth.uid()));

CREATE TABLE public.class_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.class_tests(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.class_members(id) ON DELETE CASCADE,
  correct integer NOT NULL CHECK (correct >= 0),
  total integer NOT NULL CHECK (total > 0 AND correct <= total),
  details jsonb NOT NULL,
  started_at timestamptz NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (test_id, member_id)
);
GRANT ALL ON public.class_test_results TO service_role;
ALTER TABLE public.class_test_results ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.class_test_results FROM PUBLIC, anon, authenticated;