import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, MessageSquareText } from "lucide-react";

import { Disclaimer } from "@/components/Disclaimer";
import { Reveal } from "@/components/Reveal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatVerified, serviceDetailQuery } from "@/lib/services";

export const Route = createFileRoute("/services/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${name} — GovGuide service guide` },
        {
          name: "description",
          content: `Verified requirements, documents, steps, fees and the official source for ${name} in South Africa.`,
        },
        { property: "og:title", content: `${name} — GovGuide service guide` },
        {
          property: "og:description",
          content: `What to bring, what it costs and how long it takes for ${name}, with the official source.`,
        },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(serviceDetailQuery(params.slug));
    if (!result.service) throw notFound();
  },
  component: ServiceDetail,
});

function List({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="rounded-3xl border border-border/70 bg-surface p-6 shadow-soft">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item, index) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[0.65rem] font-semibold text-primary">
              {index + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(serviceDetailQuery(slug));
  const service = data.service!;

  return (
    <div className="mesh-light min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All services
        </Link>

        <Reveal>
          <header className="glass mt-6 rounded-4xl p-7 sm:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <ServiceIcon name={service.icon} className="size-5" />
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-secondary-foreground">
                {service.category}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-secondary-foreground">
                {service.province}
              </span>
            </div>
            <h1 className="text-section mt-6">{service.service_name}</h1>
            <p className="text-lede mt-4">{service.description}</p>

            <dl className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Fees", value: service.fees },
                { label: "Processing time", value: service.processing_time },
                { label: "Last verified", value: formatVerified(service.last_verified) },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-surface/80 px-4 py-3.5">
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-foreground">
                    {item.value ?? "Not verified — check the official source"}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-glow hover:brightness-110"
              >
                <MessageSquareText className="size-4" aria-hidden="true" />
                Ask about this service
              </Link>
              <a
                href={service.source_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {service.source_authority}
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </div>
          </header>
        </Reveal>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Reveal><List title="Who qualifies" items={service.eligibility} /></Reveal>
          <Reveal delay={80}><List title="Documents to bring" items={service.required_documents} /></Reveal>
          <Reveal delay={140}><List title="Application steps" items={service.application_steps} /></Reveal>
          <Reveal delay={200}><List title="Where to apply" items={service.locations} /></Reveal>
        </div>

        {service.important_notes.length > 0 && (
          <Reveal delay={120}>
            <section className="mt-5 rounded-3xl border border-warning/30 bg-warning/10 p-6">
              <h2 className="font-display text-lg font-semibold tracking-tight">Important notes</h2>
              <ul className="mt-4 space-y-2.5">
                {service.important_notes.map((note) => (
                  <li key={note} className="text-sm leading-relaxed text-foreground/85">
                    {note}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        {data.faqs.length > 0 && (
          <Reveal delay={140}>
            <section className="mt-5 rounded-3xl border border-border/70 bg-surface p-6 shadow-soft">
              <h2 className="font-display text-lg font-semibold tracking-tight">Common questions</h2>
              <dl className="mt-4 space-y-5">
                {data.faqs.map((faq) => (
                  <div key={faq.id}>
                    <dt className="text-sm font-semibold text-foreground">{faq.question}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </Reveal>
        )}

        <Disclaimer className="mt-8" />
      </main>

      <SiteFooter />
    </div>
  );
}
