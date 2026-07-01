import { PublicLocaleShell } from "@/components/layout/locale-shells";
import { PublicSiteHeader } from "@/components/layout/public-site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLocaleShell>
      <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
        <PublicSiteHeader />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-12">{children}</main>
        <SiteFooter />
      </div>
    </PublicLocaleShell>
  );
}
