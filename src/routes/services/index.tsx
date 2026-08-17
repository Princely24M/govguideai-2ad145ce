import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquareText, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Disclaimer } from "@/components/Disclaimer";
import { Reveal } from "@/components/Reveal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CATEGORY_ORDER, servicesQuery } from "@/lib/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Service explorer — GovGuide" },
      {
        name: "description",
        content:
          "Browse South African government services by category: identity documents, travel, transport, social services and business registration, with verified requirements and steps.",
      },
      { property: "og:title", content: "Service explorer — GovGuide" },
      {
        property: "og:description",
        content:
          "Verified requirements, documents, steps and official sources for South African government services.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(servicesQuery);
  },
  component: ServiceExplorer,
});

function ServiceExplorer() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const [category, setCategory] = useState("All");
  const [term, setTerm] = useState("");

  const categories = useMemo(() => {
    const present = new Set(services.map((s) => s.category));
    return ["All", ...CATEGORY_ORDER.filter((c) => present.has(c))];
  }, [services]);

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory = category === "All" || service.category === category;
      const matchesTerm =
        needle.length === 0 ||
        `${service.service_name} ${service.description} ${service.category}`
          .toLowerCase()
          .includes(needle);
      return matchesCategory && matchesTerm;
    });
  }, [category, services, term]);

  return (
    <div className="mesh-light min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
        <Reveal>
          <p className="text-eyebrow text-muted-foreground">Service explorer</p>
          <h1 className="text-section mt-4 max-w-2xl">
            Find the service, then ask GovGuide about it.
          </h1>
          <p className="text-lede mt-5 max-w-2xl">
            Each service page lists the verified requirements, documents and steps in application
            order, together with the authority behind the information.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-9 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="glass-secondary flex items-center gap-2.5 rounded-full px-4 py-2.5 lg:max-w-sm lg:flex-1">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="service-search" className="sr-only">
                Search services
              </label>
              <input
                id="service-search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Search services…"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200",
                    category === item
                      ? "border-primary bg-primary text-primary-foreground shadow-soft"
                      : "border-border bg-surface/70 text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {filtered.length === 0 ? (
          <div className="glass mt-12 rounded-3xl p-10 text-center">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              No services match that search
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              This prototype covers {services.length} services. Try a different word, or ask
              GovGuide directly — it will tell you if a service is outside its knowledge base.
            </p>
            <Link
              to="/chat"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              <MessageSquareText className="size-4" aria-hidden="true" />
              Ask GovGuide
            </Link>
          </div>
        ) : (
          <ul className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service, index) => (
              <Reveal as="li" key={service.id} delay={Math.min(index, 6) * 60}>
                <article className="lift group flex h-full flex-col rounded-3xl border border-border/70 bg-surface p-6 shadow-soft hover:lift-hover">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <ServiceIcon name={service.icon} className="size-5" />
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-secondary-foreground">
                      {service.category}
                    </span>
                  </div>
                  <h2 className="mt-5 font-display text-lg font-semibold tracking-tight">
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      className="hover:underline"
                    >
                      {service.service_name}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link
                      to="/chat"
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:shadow-glow hover:brightness-110"
                    >
                      <MessageSquareText className="size-3.5" aria-hidden="true" />
                      Ask about this
                    </Link>
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      Details
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        )}

        <Disclaimer className="mt-12" />
      </main>

      <SiteFooter />
    </div>
  );
}
