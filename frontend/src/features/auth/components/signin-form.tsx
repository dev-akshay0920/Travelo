"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInApi } from "@/features/auth/api/auth.api";

type SignInFormProps = {
  email?: string;
  password?: string;
};

export function SignInForm({ email = "", password = "" }: SignInFormProps) {
  const router = useRouter();
  const [formEmail, setFormEmail] = useState(email);
  const [formPassword, setFormPassword] = useState(password);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await signInApi({
        email: formEmail,
        password: formPassword,
      });

      const { accessToken, user } = result.data;

      localStorage.setItem("travora_access_token", accessToken);
      localStorage.setItem("travora_user", JSON.stringify(user));

      document.cookie = `travora_access_token=${encodeURIComponent(accessToken)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      toast.success("Signed in successfully!");

      const returnPath = new URLSearchParams(window.location.search).get("redirectTo");
      const safeReturnPath =
        returnPath?.startsWith("/") && !returnPath.startsWith("//") ? returnPath : null;

      if (user.role.key === "traveller" && safeReturnPath) {
        router.push(safeReturnPath);
      } else if (user.role.key === "agency") {
        router.push("/agency");
      } else if (user.role.key === "admin") {
        router.push("/admin");
      } else {
        router.push("/traveller");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Signin failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="signin-password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
        </Button>
      </form>
    </div>
  );
}
