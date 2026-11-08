import { siteConfig } from "@/config/site.config";

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-muted-foreground">
          &copy; {year} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
