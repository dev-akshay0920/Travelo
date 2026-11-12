"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import Link from "next/link";
import { LogIn, Menu, Plane, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/shared/page-container";
import { usePackageFilters } from "@/features/public/hooks/use-package-filters";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { setFilters } = usePackageFilters();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q")?.toString().trim();
    if (query) {
      setFilters({ destination: query, page: 1 }, true);
      setSearchOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
        <PageContainer className="py-0">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Plane aria-hidden="true" className="size-4" />
              </span>
              <span>Travora</span>
            </Link>

            <div className="mx-6 hidden max-w-xl flex-1 md:block">
              <form onSubmit={handleSearch} className="relative">
                <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  aria-label="Search destinations and packages"
                  placeholder="Search destinations, packages..."
                  className="h-9 rounded-md border-border bg-muted pl-10 pr-3"
                  autoComplete="off"
                />
              </form>
            </div>

            <nav aria-label="Main navigation" className="hidden items-center gap-2 md:flex">
              <Link href="/packages" className="rounded-md px-3 py-2 text-body-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                Browse Packages
              </Link>
              <Link href="/agencies" className="rounded-md px-3 py-2 text-body-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                Agencies
              </Link>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin">
                  <LogIn aria-hidden="true" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </nav>

            <div className="flex items-center gap-1 md:hidden">
              <Button variant="ghost" size="icon-sm" aria-label="Search destinations" onClick={() => setSearchOpen(true)}>
                <Search aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Open navigation menu" onClick={() => setMobileMenuOpen(true)}>
                <Menu aria-hidden="true" />
              </Button>
            </div>
          </div>
        </PageContainer>
      </header>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right">
          <SheetHeader className="items-start">
            <div>
              <SheetTitle>Explore Travora</SheetTitle>
              <SheetDescription>Browse trips and verified travel agencies.</SheetDescription>
            </div>
          </SheetHeader>
          <SheetBody className="p-4">
            <nav aria-label="Mobile navigation" className="space-y-1">
              <Link href="/packages" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2.5 text-body-sm font-medium text-foreground transition-colors hover:bg-muted">
                Browse Packages
              </Link>
              <Link href="/agencies" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2.5 text-body-sm font-medium text-foreground transition-colors hover:bg-muted">
                Agencies
              </Link>
            </nav>
          </SheetBody>
          <SheetFooter className="grid gap-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                <LogIn aria-hidden="true" />
                Sign In
              </Link>
            </Button>
            <Button className="w-full" asChild>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent side="right">
          <SheetHeader className="items-start">
            <div>
              <SheetTitle>Search trips</SheetTitle>
              <SheetDescription>Find packages by destination.</SheetDescription>
            </div>
          </SheetHeader>
          <SheetBody className="p-4">
            <form id="mobile-destination-search-form" onSubmit={handleSearch} className="relative">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                aria-label="Search destinations and packages"
                placeholder="Search destinations, packages..."
                className="pl-10"
                autoComplete="off"
                autoFocus
              />
            </form>
          </SheetBody>
          <SheetFooter className="grid gap-2">
            <Button type="submit" form="mobile-destination-search-form" className="w-full">Search</Button>
            <Button variant="outline" className="w-full" onClick={() => setSearchOpen(false)}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <main className="flex-1">{children}</main>

      <footer className="bg-foreground text-background/70">
        <PageContainer className="py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <Link href="/" className="text-lg font-semibold text-background">Travora</Link>
              <p className="mt-2 text-body-sm">Discover handpicked travel packages from verified local agencies.</p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-background">Explore</h4>
              <ul className="space-y-2 text-body-sm">
                <li><Link href="/packages" className="transition-colors hover:text-background">All Packages</Link></li>
                <li><Link href="/agencies" className="transition-colors hover:text-background">Agencies</Link></li>
                <li><Link href="/destinations" className="transition-colors hover:text-background">Destinations</Link></li>
                <li><Link href="/themes" className="transition-colors hover:text-background">Trip Themes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-background">Support</h4>
              <ul className="space-y-2 text-body-sm">
                <li><Link href="/help" className="transition-colors hover:text-background">Help Center</Link></li>
                <li><Link href="/contact" className="transition-colors hover:text-background">Contact Us</Link></li>
                <li><Link href="/faq" className="transition-colors hover:text-background">FAQ</Link></li>
                <li><Link href="/terms" className="transition-colors hover:text-background">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-background">Legal</h4>
              <ul className="space-y-2 text-body-sm">
                <li><Link href="/privacy" className="transition-colors hover:text-background">Privacy Policy</Link></li>
                <li><Link href="/terms" className="transition-colors hover:text-background">Terms of Service</Link></li>
                <li><Link href="/refund" className="transition-colors hover:text-background">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-background/15 pt-5 md:flex-row">
            <p className="text-body-sm">© 2026 Travora. All rights reserved.</p>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
}