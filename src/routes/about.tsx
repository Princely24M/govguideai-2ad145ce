import { createFileRoute, Link } from "@tanstack/react-router";

import { Disclaimer } from "@/components/Disclaimer";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About GovGuide — how the assistant works" },
      {
        name: "description",
        content:
          "How GovGuide works: a verified knowledge base of South African government services, source-traced answers, and clear limits on what the assistant will claim.",
      },
      { property: "og:title", content: "About GovGuide — how the assistant works" },
      {
        property: "og:description",
        content:
          "GovGuide explains government procedures in plain language and never invents fees, documents or deadlines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const SECTIONS = [
  {
    title: "What GovGuide is",
    body: "An AI assistant that explains South African government procedures, requirements and services in plain language, so you know what to prepare before you travel to an office.",
  },
  {
    title: "Where answers come from",
    body: "A structured knowledge base of service records. Each record stores eligibility, documents, steps, fees, processing time, the responsible authority, an official link and the date it was last verified.",
  },
  {
    title: "What it will not do",
    body: "It never invents fees, documents, addresses, office hours or deadlines, never fabricates links, and never claims to be a government department. Where verified information is missing, it says so and points to the official source.",
  },
  {
    title: "How it handles unclear questions",
    body: "When a request could mean several services — “I need a licence”, for example — GovGuide asks one short clarifying question rather than guessing.",
  },
  {
    title: "Accessibility",
    body: "High-contrast text, keyboard-navigable controls, generous tap targets, screen-reader labels and full respect for reduced-motion preferences.",
  },
];

function About() {
  return (
    <div className="mesh-light min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
        <Reveal>
          <p className="text-eyebrow text-muted-foreground">About</p>
          <h1 className="text-section mt-4">Accuracy before eloquence.</h1>
          <p className="text-lede mt-5">
            GovGuide is an independent guidance tool. It is not a government service and cannot
            submit applications on your behalf.
          </p>
        </Reveal>

        <div className="mt-11 space-y-4">
          {SECTIONS.map((section, index) => (
            <Reveal key={section.title} delay={index * 70}>
              <section className="rounded-3xl border border-border/70 bg-surface p-6 shadow-soft">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  {section.title}
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {section.body}
                </p>
              </section>
            </Reveal>
          ))}
        </div>

        <Disclaimer className="mt-10" />

        <Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-glow hover:brightness-110"
            >
              Ask GovGuide
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Explore services
            </Link>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
