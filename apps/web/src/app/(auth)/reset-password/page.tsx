"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button, Input, Label, ContentCard, FinAILogo, toast } from "@finai/ui";
import { apiClient } from "@/lib/api-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!token.trim()) errs.token = "Reset token is required";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      errs.password = "Password must contain uppercase, lowercase, and a number";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await apiClient.post("auth/reset-password", { token, password, confirmPassword });
      setDone(true);
      toast.success("Password reset! You can now log in.");
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      const apiErr = err as { message?: string };
      setErrors({ root: apiErr?.message || "Reset failed. The link may have expired." });
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
  };

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-primary/10 mx-auto flex size-14 items-center justify-center rounded-full">
          <CheckCircle className="text-primary size-7" />
        </div>
        <div>
          <p className="font-semibold">Password updated!</p>
          <p className="text-muted-foreground mt-1 text-sm">Redirecting you to login…</p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.root && (
        <div className="bg-destructive/15 text-destructive rounded-lg p-3 text-sm font-medium">
          {errors.root}
        </div>
      )}

      {/* Show token field only when not pre-filled from URL */}
      {!tokenFromUrl && (
        <div className="space-y-1.5">
          <Label htmlFor="token">Reset Token</Label>
          <Input
            id="token"
            type="text"
            placeholder="Paste your reset token here"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              clearError("token");
            }}
            disabled={loading}
            className="bg-secondary/40 border-border/80 font-mono text-xs"
          />
          {errors.token && <p className="text-destructive text-xs">{errors.token}</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError("password");
          }}
          disabled={loading}
          className="bg-secondary/40 border-border/80"
        />
        {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearError("confirmPassword");
          }}
          disabled={loading}
          className="bg-secondary/40 border-border/80"
        />
        {errors.confirmPassword && (
          <p className="text-destructive text-xs">{errors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="mt-2 w-full cursor-pointer font-semibold shadow-sm"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <FinAILogo showName={false} />
          <h2 className="text-2xl font-bold tracking-tight">Set a new password</h2>
          <p className="text-muted-foreground text-sm">
            Choose a strong password to secure your account.
          </p>
        </div>

        <ContentCard className="p-8">
          <Suspense fallback={<div className="text-muted-foreground text-sm">Loading…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </ContentCard>

        <div className="text-muted-foreground text-center text-sm">
          <Link
            href="/login"
            className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
