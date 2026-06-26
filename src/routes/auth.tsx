import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Logo } from "@/components/Logo";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import i18n from "@/lib/i18n";
import { pageHead } from "@/lib/route-seo";

export const Route = createFileRoute("/auth")({
  head: () =>
    pageHead({
      routeKey: "auth",
      title: i18n.t("auth.metaTitle"),
      path: "/auth",
    }),
  component: AuthPage,
});


const emailSchema = z.string().email();
const passwordSchema = z.string().min(8);

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup" | "forgot">("signin");

  // Redirect if already signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="block mb-4">
          <Logo variant="horizontal" theme="on-light" className="h-48 mx-auto" />
        </Link>
        <h1 className="sr-only">{t("auth.metaTitle")}</h1>
        <div className="rounded-xl bg-card border border-border shadow-[0_1px_3px_rgba(15,27,61,0.05)] p-8">

          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">{t("auth.signIn")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm onSwitchForgot={() => setTab("forgot")} />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
            <TabsContent value="forgot">
              <ForgotForm onBack={() => setTab("signin")} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}

function GoogleButton() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const handleGoogle = async () => {
    setLoading(true);

    // In the Lovable editor the page runs inside an iframe — use the popup-based
    // OAuth so the embed isn't broken by a full-page redirect to the broker.
    // Everywhere else (production, localhost) go straight to Supabase OAuth.
    let isInIframe = false;
    try {
      isInIframe = window.self !== window.top;
    } catch {
      isInIframe = true;
    }

    if (isInIframe) {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth/callback",
      });
      if (result.error) {
        toast.error(result.error.message ?? t("auth.googleError"));
        setLoading(false);
        return;
      }
      if (!result.redirected) {
        // Popup returned tokens directly — session already set by lovable wrapper.
        window.location.href = "/dashboard";
      }
      return;
    }

    // Production path: direct Supabase OAuth (no /~oauth/initiate broker needed).
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });
    if (error) {
      toast.error(error.message ?? t("auth.googleError"));
      setLoading(false);
    }
  };
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11"
      onClick={handleGoogle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <GoogleIcon />
          <span className="ml-2">{t("auth.continueWithGoogle")}</span>
        </>
      )}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function Divider() {
  const { t } = useTranslation();
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{t("auth.or")}</span>
      </div>
    </div>
  );
}

function SignInForm({ onSwitchForgot }: { onSwitchForgot: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSchema.safeParse(email).success) {
      toast.error(t("auth.invalidEmail"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes("Invalid")
          ? t("auth.invalidCredentials")
          : error.message.includes("Email not confirmed")
            ? t("auth.emailNotConfirmed")
            : error.message,
      );
      return;
    }
    toast.success(t("auth.signedIn"));
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <GoogleButton />
      <Divider />
      <div className="space-y-2">
        <Label htmlFor="signin-email">{t("auth.email")}</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">{t("auth.password")}</Label>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="button"
        onClick={onSwitchForgot}
        className="text-xs text-secondary hover:underline"
      >
        {t("auth.forgotLink")}
      </button>
      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.signIn")}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSchema.safeParse(email).success) {
      toast.error(t("auth.invalidEmail"));
      return;
    }
    if (!passwordSchema.safeParse(password).success) {
      toast.error(t("auth.passwordTooShort"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? t("auth.emailExists")
          : error.message,
      );
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center space-y-3 py-4">
        <h2 className="text-lg font-semibold">{t("auth.checkInbox")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("auth.verifySent", { email })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <GoogleButton />
      <Divider />
      <div className="space-y-2">
        <Label htmlFor="signup-name">{t("auth.fullName")}</Label>
        <Input
          id="signup-name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">{t("auth.email")}</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">{t("auth.password")}</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">{t("auth.passwordHint")}</p>
      </div>
      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.createAccount")}
      </Button>
    </form>
  );
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSchema.safeParse(email).success) {
      toast.error(t("auth.invalidEmail"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center space-y-3 py-4">
        <h2 className="text-lg font-semibold">{t("auth.checkInbox")}</h2>
        <p className="text-sm text-muted-foreground">{t("auth.resetSent", { email })}</p>
        <Button variant="outline" className="w-full" onClick={onBack}>
          {t("auth.backToSignIn")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("auth.forgotIntro")}</p>
      <div className="space-y-2">
        <Label htmlFor="forgot-email">{t("auth.email")}</Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.sendResetLink")}
      </Button>
    </form>
  );
}
