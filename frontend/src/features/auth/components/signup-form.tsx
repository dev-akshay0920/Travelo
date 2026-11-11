"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signUpApi } from "@/features/auth/api/auth.api";

type SignUpFormProps = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  agencyName?: string;
};

export function SignUpForm({
  name = "",
  email = "",
  password = "",
  role = "traveller",
  agencyName = "",
}: SignUpFormProps) {
  const router = useRouter();
  const [formName, setFormName] = useState(name);
  const [formEmail, setFormEmail] = useState(email);
  const [formPassword, setFormPassword] = useState(password);
  const [formRole, setFormRole] = useState<"traveller" | "agency">(role as "traveller" | "agency");
  const [formAgencyName, setFormAgencyName] = useState(agencyName);
  const [agencyNameError, setAgencyNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formRole === "agency" && !formAgencyName.trim()) {
      setAgencyNameError("Agency name is required.");
      return;
    }

    setAgencyNameError("");
    setIsSubmitting(true);

    try {
      await signUpApi({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        agencyName: formRole === "agency" ? formAgencyName : undefined,
      });

      toast.success("Account created successfully!");

      if (formRole === "agency") {
        router.push("/agency");
      } else {
        const returnPath = new URLSearchParams(window.location.search).get("redirectTo");
        const safeReturnPath =
          returnPath?.startsWith("/") && !returnPath.startsWith("//") ? returnPath : null;
        router.push(
          safeReturnPath
            ? `/signin?redirectTo=${encodeURIComponent(safeReturnPath)}`
            : "/traveller",
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Signup failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="signup-name">Full Name</Label>
          <Input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-role">I am a</Label>
          <Select value={formRole} onValueChange={(val) => setFormRole(val as "traveller" | "agency")}>
            <SelectTrigger id="signup-role">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="traveller">Traveller</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formRole === "agency" && (
          <div className="space-y-2">
            <Label htmlFor="signup-agency-name">Agency Name<span className="text-destructive">*</span></Label>
            <Input
              id="signup-agency-name"
              type="text"
              placeholder="Sunrise Tours"
              value={formAgencyName}
              onChange={(e) => {
                setFormAgencyName(e.target.value.slice(0, 100));
                if (agencyNameError) setAgencyNameError("");
              }}
              onBlur={() => {
                if (!formAgencyName.trim()) {
                  setAgencyNameError("Agency name is required.");
                }
              }}
              required
              maxLength={100}
              aria-invalid={!!agencyNameError}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{formAgencyName.length}/100 characters</p>
              {agencyNameError && (
                <p className="text-xs text-destructive">{agencyNameError}</p>
              )}
            </div>
          </div>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </Button>
      </form>
    </div>
  );
}
