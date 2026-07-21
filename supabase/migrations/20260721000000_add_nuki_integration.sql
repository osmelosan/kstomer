-- Nuki smart lock integration.
--
-- Two tables, both scoped to an organization and protected by the same
-- "org owner manages ..." RLS pattern already used across the CRM tables
-- (see 20260703200000_migrate_crm_tables_to_organizations.sql):
--   using (organization_id in (select id from public.organizations where owner_id = auth.uid()))
--
--   * nuki_connections   – one Nuki Web API token per organization. The token is
--                          AES-GCM encrypted server-side before it is stored, so
--                          the ciphertext is never useful on the client. Only the
--                          last 4 characters are kept in clear for display.
--   * nuki_access_grants – history of accesses (keypad PIN codes / app keys)
--                          granted to a smart lock from Kstomer, optionally tied
--                          to a CRM contact, so they can be listed and revoked.

-- ---------------------------------------------------------------------------
-- nuki_connections
-- ---------------------------------------------------------------------------
CREATE TABLE public.nuki_connections (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID        NOT NULL UNIQUE
                                    REFERENCES public.organizations(id) ON DELETE CASCADE,
  api_token_encrypted TEXT        NOT NULL,
  token_last4         TEXT,
  connected_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nuki_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org owner manages nuki_connections" ON public.nuki_connections FOR ALL
  USING (organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()));

CREATE TRIGGER update_nuki_connections_updated_at
  BEFORE UPDATE ON public.nuki_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- nuki_access_grants
-- ---------------------------------------------------------------------------
CREATE TABLE public.nuki_access_grants (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID        NOT NULL
                                    REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_id          UUID        REFERENCES public.contacts(id) ON DELETE SET NULL,
  smartlock_id        TEXT        NOT NULL,
  smartlock_name      TEXT,
  nuki_auth_id        TEXT,
  type                TEXT        NOT NULL CHECK (type IN ('keypad', 'app_key')),
  name                TEXT        NOT NULL,
  allowed_from        TIMESTAMPTZ,
  allowed_until       TIMESTAMPTZ,
  status              TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_by_user_id  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_nuki_access_grants_organization_id ON public.nuki_access_grants(organization_id);
CREATE INDEX idx_nuki_access_grants_contact_id ON public.nuki_access_grants(contact_id);

ALTER TABLE public.nuki_access_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org owner manages nuki_access_grants" ON public.nuki_access_grants FOR ALL
  USING (organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid()));

CREATE TRIGGER update_nuki_access_grants_updated_at
  BEFORE UPDATE ON public.nuki_access_grants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Broadcast changes so the useNuki() hook can refresh its list in realtime,
-- matching how the contacts list stays live.
ALTER PUBLICATION supabase_realtime ADD TABLE public.nuki_access_grants;
