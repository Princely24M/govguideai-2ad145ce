import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accessibility,
  ArrowRight,
  BadgeCheck,
  Compass,
  FileSearch,
  Languages,
  MessagesSquare,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import heroImage from "@/assets/hero-service-hall.jpg";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Disclaimer } from "@/components/Disclaimer";
import { Reveal } from "@/components/Reveal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { servicesQuery } from "@/lib/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GovGuide — Government services, made easier" },
      {
        name: "description",
        content:
          "GovGuide is an AI assistant that explains South African government procedures in plain language: documents, steps, fees and official sources for IDs, passports, licences and grants.",
      },
      { property: "og:title", content: "GovGuide — Government services, made easier" },
      {
        property: "og:description",
        content:
          "Understand government procedures, requirements and services through a simple AI-powered assistant, with an official source behind every answer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(servicesQuery);
  },
  component: Landing,
});

const PROBLEMS = [
  {
    icon: FileSearch,
    title: "Scattered information",
    body: "Requirements live across department sites, PDFs and notice boards that rarely agree with each other.",
  },
  {
    icon: ScrollText,
    title: "Formal language",
    body: "Official wording assumes you already know the forms, the codes and the process order.",
  },
  {
    icon: Compass,
    title: "No clear first step",
    body: "People arrive at an office without the one document that would have made the trip worthwhile.",
  },
];

const CAPABILITIES = [
  {
    icon: MessagesSquare,
    title: "Conversational guidance",
    body: "Ask in your own words. Ambiguous questions get one short follow-up instead of a wrong answer.",
  },
  {
    icon: BadgeCheck,
    title: "Verified knowledge base",
    body: "Answers are drafted only from a structured, source-traced record of each government service.",
  },
  {
    icon: ShieldCheck,
    title: "No invented facts",
    body: "If a fee, document or address is not verified, GovGuide says so and sends you to the official source.",
  },
  {
    icon: Accessibility,
    title: "Built for everyone",
    body: "High-contrast text, keyboard navigation, generous tap targets and reduced-motion support.",
  },
];

function Landing() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const featured = services.slice(0, 6);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <SiteHeader />

      {/* 01 — HERO */}
      <section className="mesh-light relative isolate overflow-hidden pb-20 pt-10 sm:pb-28 sm:pt-16">
        <div
          className="pointer-events-none absolute -left-40 top-10 -z-10 size-[34rem] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--primary-glow), transparent 68%)", animation: "drift 24s linear infinite" }}
          aria-hidden="true"
        />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal>
              <BrandLogo size="lg" subtitle="AI public-service assistant · South Africa" />
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-hero mt-6">
                Government services,{" "}
                <span className="text-gradient">made easier.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-lede mt-6 max-w-xl">
                Understand government procedures, requirements and services through a simple
                AI-powered assistant.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/chat"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lifted transition-all duration-300 hover:shadow-glow hover:brightness-110 active:scale-[0.98]"
                >
                  Ask GovGuide
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-6 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-secondary"
                >
                  Explore Services
                </Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                {[
                  { value: services.length, suffix: "", label: "Services covered" },
                  { value: 5, suffix: "", label: "Official sources" },
                  { value: 100, suffix: "%", label: "Answers source-traced" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-secondary rounded-2xl px-4 py-3.5">
                    <dt className="font-display text-2xl font-semibold tracking-tight text-primary">
                      <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                    </dt>
                    <dd className="mt-1 text-[0.72rem] font-medium leading-tight text-muted-foreground">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={400}>
              <Disclaimer className="mt-8 max-w-xl" compact />
            </Reveal>
          </div>

          {/* 02 — HERO VISUAL */}
          <Reveal delay={200} className="relative">
            <div className="glass relative overflow-hidden rounded-4xl p-2.5 shadow-floating">
              <img
                src={heroImage}
                alt="People waiting calmly in a bright, modern South African public service hall"
                width={1600}
                height={1200}
                className="h-[22rem] w-full rounded-3xl object-cover sm:h-[26rem]"
              />
              <div className="glass absolute bottom-6 left-6 right-6 rounded-2xl p-4" style={{ animation: "float 9s var(--ease-soft) infinite" }}>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                  Example question
                </p>
                <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">
                  “I need a licence.”
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  GovGuide asks which licence you mean — learner’s, driver’s or vehicle — before it
                  answers.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 03 — THE PROBLEM */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <p className="text-eyebrow text-muted-foreground">02 — The problem</p>
          <h2 className="text-section mt-4 max-w-2xl">
            The information exists. Finding and understanding it is the hard part.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PROBLEMS.map((item, index) => (
            <Reveal key={item.title} delay={index * 90}>
              <article className="lift h-full rounded-3xl border border-border/70 bg-surface p-6 shadow-soft hover:lift-hover">
                <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 04 — GUIDANCE */}
      <section className="mesh-ink relative overflow-hidden py-20 text-ink-foreground sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <Reveal>
            <p className="text-eyebrow text-ink-foreground/60">03 — Guidance</p>
            <h2 className="text-section mt-4 max-w-2xl text-ink-foreground">
              From a vague question to a clear next step.
            </h2>
          </Reveal>
          <ol className="mt-14 grid gap-5 md:grid-cols-4">
            {[
              { step: "01", title: "You ask", body: "In everyday language — no forms, no codes, no jargon required." },
              { step: "02", title: "GovGuide clarifies", body: "One short follow-up when your question could mean several services." },
              { step: "03", title: "Verified retrieval", body: "The matching service record is pulled from the structured knowledge base." },
              { step: "04", title: "Structured answer", body: "Requirements, steps and the official source — with gaps clearly flagged." },
            ].map((item, index) => (
              <Reveal as="li" key={item.step} delay={index * 100}>
                <div className="glass-ink h-full rounded-3xl p-6">
                  <span className="font-display text-sm font-semibold tracking-[0.18em] text-accent">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-foreground/70">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 05 — CAPABILITIES */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <p className="text-eyebrow text-muted-foreground">04 — Capabilities</p>
          <h2 className="text-section mt-4 max-w-2xl">Designed for accuracy before eloquence.</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {CAPABILITIES.map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              <article className="lift flex h-full gap-4 rounded-3xl border border-border/70 bg-surface p-6 shadow-soft hover:lift-hover">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 06 — SERVICE NAVIGATION */}
      <section className="bg-surface-muted/60 py-20 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-eyebrow text-muted-foreground">05 — Service navigation</p>
                <h2 className="text-section mt-4">Start with a service.</h2>
              </div>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                View all {services.length} services
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service, index) => (
              <Reveal key={service.id} delay={index * 70}>
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="lift group flex h-full flex-col rounded-3xl border border-border/70 bg-surface p-6 shadow-soft hover:lift-hover"
                >
                  <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <ServiceIcon name={service.icon} className="size-5" />
                  </span>
                  <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {service.category}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight">
                    {service.service_name}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    View details
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 07 — TRUST */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-eyebrow text-muted-foreground">06 — Trust</p>
            <h2 className="text-section mt-4">Every answer carries its source.</h2>
            <p className="text-lede mt-5">
              Each service record stores the responsible authority, the official page and the date it
              was last verified. GovGuide shows all three under the answer — and never creates a link
              that does not exist.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Never invents fees, documents, addresses or deadlines",
                "Says plainly when verified information is missing",
                "Refuses instructions that try to override its safety rules",
                "Never presents itself as a government department",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground/85">
                  <BadgeCheck className="mt-0.5 size-4.5 shrink-0 text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={140}>
            <div className="glass rounded-4xl p-6 sm:p-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                Answer footer, as shown in chat
              </p>
              <div className="mt-4 rounded-2xl bg-surface-muted/80 px-4 py-3.5">
                <p className="text-sm font-semibold">Source: Department of Home Affairs</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Smart ID Card · last verified 2026-08-11
                </p>
                <p className="mt-2.5 text-xs font-semibold text-primary">View official information →</p>
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3.5">
                <Languages className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-foreground/85">
                  “I couldn’t find verified information for that request. I don’t want to give you an
                  inaccurate answer. Please check the relevant official government source.”
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 08 — CTA */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-4 sm:px-8">
        <Reveal>
          <div className="mesh-ink relative overflow-hidden rounded-4xl px-7 py-14 text-center text-ink-foreground sm:px-14 sm:py-20">
            <h2 className="text-section mx-auto max-w-2xl text-ink-foreground">
              Ask your question in plain language.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[0.98rem] leading-relaxed text-ink-foreground/75">
              GovGuide will tell you what to bring, what happens at the office, and where the official
              information comes from.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                to="/chat"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-lifted transition-all duration-300 hover:brightness-105 active:scale-[0.98]"
              >
                Ask GovGuide
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/25 px-6 py-3.5 text-sm font-semibold text-ink-foreground transition-colors duration-300 hover:bg-ink-foreground/10"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
