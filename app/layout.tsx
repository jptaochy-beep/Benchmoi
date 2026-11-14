import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative Intelligence",
  description: "Benchmark mondial, décodage et création publicitaire — McCann Abidjan, Douala, Dakar",
};

const NAV = [
  { href: "/", label: "Recherche" },
  { href: "/comparer", label: "Comparateur" },
  { href: "/lab", label: "Creative Lab" },
  { href: "/projets", label: "Mes projets" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <nav className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <Link href="/" className="text-sm font-black tracking-tight">
              McCANN <span className="text-accent">CREATIVE INTELLIGENCE</span>
            </Link>
            <div className="flex flex-wrap gap-4 text-sm">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="text-muted hover:text-ink">
                  {n.label}
                </Link>
              ))}
            </div>
            <span className="ml-auto text-xs text-muted">Prototype V1 · Search · Decode · Create</span>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
