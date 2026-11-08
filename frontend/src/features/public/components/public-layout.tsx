"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Menu, X, Search, User, LogIn, LayoutDashboard, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePackageFilters } from "@/features/public/hooks/use-package-filters";
import { usePathname } from "next/navigation";

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { setFilters } = usePackageFilters();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const query = formData.get("q")?.toString().trim();
    if (query) {
      setFilters({ destination: query, page: 1 }, true);
      setSearchOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:opacity-80 transition-opacity">
              <span className="hidden sm:block">Travora</span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="q"
                  placeholder="Search destinations, packages..."
                  className="pl-10 pr-10 h-10 rounded-lg bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  autoComplete="off"
                />
              </form>
            </div>

            {/* Desktop Actions */}
            <nav className="hidden md:flex items-center gap-3">
              <Link href="/packages" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Browse Packages
              </Link>
              <Link href="/agencies" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Agencies
              </Link>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin" className="text-gray-700 hover:text-blue-600">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup" className="text-white">
                  Get Started
                </Link>
              </Button>
            </nav>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Mobile Search Drawer */}
          {searchOpen && (
            <div className="md:hidden py-4 animate-slide-down">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  name="q"
                  placeholder="Search destinations, packages..."
                  className="pl-10 pr-10 h-10 rounded-lg bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  autoComplete="off"
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <Link href="/packages" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium">
                Browse Packages
              </Link>
              <Link href="/agencies" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium">
                Agencies
              </Link>
              <hr className="my-4 border-gray-100" />
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/signin" className="text-gray-700 hover:text-blue-600">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button className="w-full justify-start" asChild>
                <Link href="/signup" className="text-white">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="text-xl font-bold text-white">Travora</Link>
              <p className="mt-2 text-sm">Discover handpicked travel packages from verified local agencies.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/packages" className="hover:text-white transition-colors">All Packages</Link></li>
                <li><Link href="/agencies" className="hover:text-white transition-colors">Agencies</Link></li>
                <li><Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link></li>
                <li><Link href="/themes" className="hover:text-white transition-colors">Trip Themes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 Travora. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Facebook"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </div>
  );
}