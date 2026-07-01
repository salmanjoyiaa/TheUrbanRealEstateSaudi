"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocale } from "@/providers/locale-provider";

function LoginContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const loginType = searchParams.get("type") as "property" | "visiting" | "seller" | "maintenance" | null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    const redirect = searchParams.get("redirect");

    let data;
    let error;

    try {
      const result = await supabase.auth.signInWithPassword(values);
      data = result.data;
      error = result.error;
    } catch (err: unknown) {
      const isLockTimeout =
        err instanceof Error &&
        (/timed out/i.test(err.message) || /LockManager/i.test(err.message) ||
          (err as { isAcquireTimeout?: boolean }).isAcquireTimeout === true);

      if (isLockTimeout) {
        toast.error(
          "Login is taking longer than usual. Please close other tabs with this site and try again.",
          { duration: 8000 },
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
      return;
    }

    if (error) {
      toast.error(error.message || "Login failed");
      return;
    }

    if (!data.user) {
      toast.error("Could not load your account");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single() as { data: { role: string } | null };

    if (profile?.role === "admin") {
      window.location.href = "/admin";
      return;
    }

    if (profile?.role === "agent") {
      const { data: agent } = await supabase
        .from("agents")
        .select("status")
        .eq("profile_id", data.user.id)
        .single() as { data: { status: string } | null };

      if (agent?.status !== "approved") {
        window.location.href = "/pending-approval";
        return;
      }

      window.location.href = redirect || "/agent";
      return;
    }

    window.location.href = redirect || "/";
  };

  const loginTitle =
    loginType === "property"
      ? t("auth.login.aqariTitle")
      : loginType === "visiting"
        ? t("auth.login.teamTitle")
        : loginType === "seller"
          ? t("auth.login.sellerTitle")
          : loginType === "maintenance"
            ? t("auth.login.maintenanceTitle")
            : t("auth.login.title");

  const signInLabel =
    loginType === "seller"
      ? t("auth.login.signInAsSeller")
      : loginType === "property"
        ? t("auth.login.signInAsAqari")
        : loginType === "visiting"
          ? t("auth.login.signInAsTeam")
          : loginType === "maintenance"
            ? t("auth.login.signInAsMaintenance")
            : t("auth.login.submit");

  const signupLabel =
    loginType === "property"
      ? t("auth.login.applyAqari")
      : loginType === "visiting"
        ? t("auth.login.applyTeam")
        : loginType === "seller"
          ? t("auth.login.applySeller")
          : loginType === "maintenance"
            ? t("auth.login.applyMaintenance")
            : t("auth.login.applyAgent");

  return (
    <Card className="border-border bg-card shadow-xl shadow-foreground/5 dark:shadow-background/5">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-extrabold text-foreground">
          {loginTitle}
        </CardTitle>
        <CardDescription className="text-muted-foreground">{t("auth.login.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.login.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.login.password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("auth.login.submitting")}
              </>
            ) : (
              signInLabel
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.login.noAccount")}{" "}
          <Link href={`/signup/agent${loginType ? `?type=${loginType}` : ""}`} className="font-bold text-primary hover:underline">
            {signupLabel}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-full min-h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
