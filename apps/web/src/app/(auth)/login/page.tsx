"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button, Input, Label, ContentCard, toast } from "@finai/ui";
import { apiClient } from "@/lib/api-client";

import { Workspace } from "@/hooks/useActiveWorkspace";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.post<{ accessToken: string; user: unknown }>("auth/login", {
        email,
        password,
      });
      localStorage.setItem("finai_token", response.accessToken);
      localStorage.setItem("finai_user", JSON.stringify(response.user));
      document.cookie = `finai_token=${response.accessToken}; path=/; max-age=604800; SameSite=Lax`;

      // Fetch user's workspaces
      const workspaces = await apiClient.get<Workspace[]>("workspaces");
      if (workspaces && workspaces.length > 0) {
        localStorage.setItem("finai_workspace_id", workspaces[0].id);
        document.cookie = `finai_workspace_id=${workspaces[0].id}; path=/; max-age=604800; SameSite=Lax`;
      }

      toast.success("Welcome back! Login successful.");
      router.push("/");
    } catch (err) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || "Invalid credentials. Please try again.");
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
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground text-sm">
            Sign in to your FinAI dashboard to manage family wealth
          </p>
        </div>

        <ContentCard className="p-8">
          <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-primary text-xs font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-secondary/40 border-border/80"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full cursor-pointer font-semibold shadow-sm"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </ContentCard>

        <div className="text-muted-foreground text-center text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
