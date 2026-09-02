"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Mail } from "lucide-react";
import { Button, Input, Label, ContentCard, toast } from "@finai/ui";
import { apiClient } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.post<{ message: string; resetToken?: string }>(
        "auth/forgot-password",
        { email },
      );
      setSent(true);
      // Dev/demo: backend returns the token so you can test without email
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
      toast.success("Reset instructions sent!");
    } catch (err) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="bg-primary ring-primary/20 flex size-10 items-center justify-center rounded-xl shadow-lg ring-4">
            <Sparkles className="text-primary-foreground size-5 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Forgot your password?</h2>
          <p className="text-muted-foreground text-sm">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <ContentCard className="p-8">
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="bg-primary/10 mx-auto flex size-14 items-center justify-center rounded-full">
                <Mail className="text-primary size-7" />
              </div>
              <div>
                <p className="font-semibold">Check your inbox</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  We&apos;ve sent reset instructions to <strong>{email}</strong>.
                </p>
              </div>

              {/* Dev/demo only: direct link shown when no email provider is configured */}
              {resetToken && (
                <div className="bg-secondary/60 space-y-2 rounded-lg p-4 text-left text-sm">
                  <p className="text-muted-foreground font-medium">
                    🛠 Dev mode — use this link to reset your password:
                  </p>
                  <Link
                    href={`/reset-password?token=${resetToken}`}
                    className="text-primary font-mono text-xs break-all hover:underline"
                  >
                    /reset-password?token={resetToken}
                  </Link>
                </div>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive rounded-lg p-3 text-sm font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-secondary/40 border-border/80"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 w-full cursor-pointer font-semibold shadow-sm"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
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
