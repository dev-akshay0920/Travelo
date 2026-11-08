"use client";

import Link from "next/link";

import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { SignUpForm } from "@/features/auth/components/signup-form";

export default function SignUpPage() {
  return (
    <AuthSplitLayout
      title="Create Account"
      subtitle="Join Travora and start your journey"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthSplitLayout>
  );
}
