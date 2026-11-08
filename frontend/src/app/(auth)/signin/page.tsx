"use client";

import Link from "next/link";

import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { SignInForm } from "@/features/auth/components/signin-form";

export default function SignInPage() {
  return (
    <AuthSplitLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      footer={
        <>
          Are you new?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an Account
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthSplitLayout>
  );
}
