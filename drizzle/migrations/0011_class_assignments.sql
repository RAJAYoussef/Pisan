CREATE TABLE public.class_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  skill_ids text[] NOT NULL
    CHECK (cardinality(skill_ids) BETWEEN 1 AND 20)
    CHECK (array_to_string(skill_ids, ',') ~ '^[a-z]+(-[a-z]+){1,2}(,[a-z]+(-[a-z]+){1,2})*$'),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 80),
  due_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX class_assignments_class_id_idx ON public.class_assignments (class_id);

GRANT SELECT, INSERT, DELETE ON public.class_assignments TO authenticated;
GRANT ALL ON public.class_assignments TO service_role;

ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY class_assignments_teacher_all
ON public.class_assignments
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.classes c
  WHERE c.id = class_assignments.class_id
    AND c.teacher_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.classes c
  WHERE c.id = class_assignments.class_id
    AND c.teacher_id = auth.uid()
));