import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  validateSearch: (
    search: Record<string, unknown>,
  ): { code?: string; error?: string; error_description?: string } => ({
    code: typeof search.code === "string" ? search.code : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
    error_description:
      typeof search.error_description === "string"
        ? search.error_description
        : undefined,
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { code, error, error_description } = Route.useSearch();

  useEffect(() => {
    async function handleCallback() {
      if (error) {
        toast.error(error_description ?? error);
        navigate({ to: "/auth", replace: true });
        return;
      }

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          toast.error(exchangeError.message);
          navigate({ to: "/auth", replace: true });
        } else {
          navigate({ to: "/dashboard", replace: true });
        }
        return;
      }

      // Implicit flow fallback: Supabase auto-detects #access_token from hash.
      // Check whether the session was already set by the client.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
      } else {
        navigate({ to: "/auth", replace: true });
      }
    }

    handleCallback();
  }, [code, error, error_description, navigate, t]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </main>
  );
}
