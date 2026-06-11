import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="w-full border-b border-border bg-background/95 py-6 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 sm:px-5 lg:px-12">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/" className="group flex items-center">
              <span className="text-[22px] font-black leading-none tracking-tight text-foreground md:text-[26px]">
                TheUrbanRealEstate<span className="text-[26px] font-black md:text-[30px]">Saudi</span>
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-6 md:flex md:gap-8" aria-label="Main navigation">
            <Link href="/" className="text-[15px] font-semibold tracking-wide text-foreground/80 transition-opacity hover:text-foreground">
              Home
            </Link>
            <Link href="/properties" className="text-[15px] font-semibold tracking-wide text-foreground/80 transition-opacity hover:text-foreground">
              Properties
            </Link>
            <Link href="/products" className="text-[15px] font-semibold tracking-wide text-foreground/80 transition-opacity hover:text-foreground">
              Products
            </Link>
            <Link href="/maintenance" className="text-[15px] font-semibold tracking-wide text-foreground/80 transition-opacity hover:text-foreground">
              Maintenance
            </Link>
            <Link href="/about" className="text-[15px] font-semibold tracking-wide text-foreground/80 transition-opacity hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="text-[15px] font-semibold tracking-wide text-foreground/80 transition-opacity hover:text-foreground">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-[14px] font-bold text-primary-foreground shadow-[0_4px_6px_-1px_hsl(var(--primary)/0.2)] transition-all hover:bg-primary/90 md:inline-flex"
            >
              Agent Login
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-12">{children}</main>

      <SiteFooter />
    </div>
  );
}
