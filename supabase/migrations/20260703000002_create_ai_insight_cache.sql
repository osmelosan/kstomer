CREATE TABLE public.ai_insight_cache (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature      TEXT        NOT NULL,
  scope_id     TEXT        NOT NULL DEFAULT 'default',
  content      JSONB       NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature, scope_id)
);

ALTER TABLE public.ai_insight_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own ai cache"
  ON public.ai_insight_cache
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
