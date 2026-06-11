import Link from "next/link";

type LegalPageLayoutProps = {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
};

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <article className="mx-auto max-w-3xl py-8 sm:py-12">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        {lastUpdated && (
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        )}
      </header>
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-foreground [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6">
        {children}
      </div>
      <footer className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          Questions? Visit our{" "}
          <Link href="/contact" className="font-medium text-primary hover:underline">
            Contact page
          </Link>{" "}
          or review our{" "}
          <Link href="/privacy-policy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </footer>
    </article>
  );
}
