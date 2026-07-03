import { pageHead } from "@/lib/route-seo";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import i18n from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () =>
    pageHead({
      routeKey: "reset",
      title: i18n.t("auth.resetMetaTitle"),
      path: "/reset-password",
      noindex: true,
    }),
  component: ResetPasswordPage,
});

const passwordSchema = z.string().min(8);

function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    // The recovery link exchanges its token for a session on load; if the
    // user landed here directly (no token), there's no session to update.
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setTokenValid(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || session) setTokenValid(true);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordSchema.safeParse(password).success) {
      toast.error(t("auth.passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      toast.error(t("auth.passwordsDontMatch"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("auth.passwordUpdated"));
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <Logo variant="horizontal" theme="on-light" className="h-12 mx-auto mb-8" />
        <div className="rounded-xl bg-card border border-border shadow-[0_1px_3px_rgba(15,27,61,0.05)] p-8">
          {tokenValid === null ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : tokenValid === false ? (
            <div className="text-center space-y-4">
              <h1 className="text-xl font-semibold">{t("auth.resetInvalidTitle")}</h1>
              <p className="text-sm text-muted-foreground">{t("auth.resetInvalidMessage")}</p>
              <Button asChild className="w-full h-11">
                <Link to="/auth">{t("auth.resetRequestNew")}</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold mb-2">{t("auth.resetTitle")}</h1>
              <p className="text-sm text-muted-foreground mb-6">{t("auth.resetIntro")}</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("auth.newPassword")}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("auth.updatePassword")
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
