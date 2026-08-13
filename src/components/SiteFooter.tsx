import { Link } from "@tanstack/react-router";

import { BrandLogo } from "@/components/BrandLogo";

const SOURCES = [
  { label: "South African Government", url: "https://www.gov.za/services" },
  { label: "Department of Home Affairs", url: "https://www.dha.gov.za/" },
  { label: "SASSA", url: "https://www.sassa.gov.za/" },
  { label: "Employment and Labour", url: "https://www.labour.gov.za/" },
  { label: "CIPC", url: "https://www.cipc.co.za/" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-surface-muted/60">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" aria-label="GovGuide AI — home" className="inline-flex items-center">
            <BrandLogo size="md" />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            An AI-powered public-service information assistant that explains South African government
            procedures in plain language, with a link to the official source behind every answer.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            GovGuide is an educational prototype built for an AI Bootcamp. It is not an official
            government service and does not represent any government department.
          </p>
        </div>

        <nav aria-label="Site">
          <p className="text-eyebrow text-muted-foreground">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { to: "/services", label: "Service explorer" },
              { to: "/chat", label: "Ask GovGuide" },
              { to: "/about", label: "About & responsible AI" },
            ].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-muted-foreground transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-eyebrow text-muted-foreground">Official sources</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SOURCES.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 px-5 py-6 text-center text-xs text-muted-foreground sm:px-8">
        Always confirm fees, documents and deadlines with the relevant government authority before you
        travel to an office.
      </div>
    </footer>
  );
}
