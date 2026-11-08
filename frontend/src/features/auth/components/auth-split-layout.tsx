import type { ReactNode } from "react";

import Link from "next/link";
import Image from "next/image";

type AuthSplitLayoutProps = {
  title: string;
  subtitle: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthSplitLayout({ title, subtitle, footer, children }: AuthSplitLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <span className="text-xl">🌿</span>
            Travora
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
        {footer && (
          <div className="text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/placeholder.svg"
          alt="Travora"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
