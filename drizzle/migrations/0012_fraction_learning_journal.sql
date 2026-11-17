-- Append-only pedagogical journal. Client-originated evidence is explicitly unverified.
CREATE TABLE IF NOT EXISTS public.fraction_learning_journal (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token_hash text NOT NULL REFERENCES public.learning_sessions(token_hash) ON DELETE CASCADE,
  event_id uuid NOT NULL,
  activity_id text NOT NULL,
  skill_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'manipulation', 'answer', 'verification', 'self_correction',
    'hypothesis', 'diagnostic', 'transfer', 'remediation'
  )),
  evidence_status text NOT NULL DEFAULT 'unverified_client_input'
    CHECK (evidence_status IN ('unverified_client_input', 'server_verified')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_occurred_at timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fraction_learning_journal_event_unique UNIQUE (token_hash, event_id),
  CONSTRAINT fraction_learning_journal_payload_size CHECK (pg_column_size(payload) <= 16384)
);

CREATE INDEX IF NOT EXISTS fraction_learning_journal_session_timeline
  ON public.fraction_learning_journal (token_hash, recorded_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS fraction_learning_journal_activity
  ON public.fraction_learning_journal (token_hash, activity_id, id);

ALTER TABLE public.fraction_learning_journal ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.fraction_learning_journal FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.fraction_learning_journal TO service_role;
