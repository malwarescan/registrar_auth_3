import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { GUIDES, getGuide } from "@/lib/guides/guides";
import { SIGNAL_MODEL } from "@/lib/guides/signal-model";
import { guideJsonLd } from "@/lib/guides/schema";
import { getSiteUrl, jsonLdString, ogBase, SITE_NAME } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const url = `${getSiteUrl()}/guides/${guide.slug}`;
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      ...ogBase(),
      title: guide.metaTitle,
      description: guide.metaDescription,
      type: "article",
      url,
      publishedTime: guide.datePublished,
      modifiedTime: guide.dateModified,
    },
  };
}

const h2 = "text-xl font-bold text-[var(--on-surface)]";
const muted = "text-[var(--on-surface-variant)]";
const card = "rounded-[var(--radius-lg)] border border-[var(--outline-variant)] bg-white p-4";
const link = "font-medium text-[var(--theme-primary)] underline";

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const related = guide.related
    .map((s) => getGuide(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <PageShell headerTitle="Guides" showSearch={false} backHref="/guides">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(guideJsonLd(guide)) }}
      />
      <article className="mx-auto max-w-3xl space-y-8 text-[var(--on-surface)]">
        <nav aria-label="Breadcrumb" className={`text-sm ${muted}`}>
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides" className="hover:underline">Guides</Link>
        </nav>

        <header className="space-y-3">
          <h1 className="text-2xl font-bold md:text-3xl">{guide.question}</h1>
          <p className="text-lg leading-relaxed">{guide.answer}</p>
          <p className={`text-xs ${muted}`}>
            Updated <time dateTime={guide.dateModified}>{guide.dateModified}</time> · {SITE_NAME}
          </p>
        </header>

        <section className="space-y-3">
          <h2 className={h2}>{guide.framework.heading}</h2>
          <p className={muted}>{guide.framework.intro}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--outline-variant)] text-left">
                  <th className="py-2 pr-3 font-semibold">Criterion</th>
                  <th className="py-2 pr-3 font-semibold">What to check</th>
                  <th className="py-2 font-semibold">What the scores cover</th>
                </tr>
              </thead>
              <tbody>
                {guide.framework.criteria.map((c) => (
                  <tr key={c.name} className="border-b border-[var(--outline-variant)] align-top">
                    <td className="py-2 pr-3 font-medium">{c.name}</td>
                    <td className="py-2 pr-3">{c.check}</td>
                    <td className={`py-2 ${muted}`}>{c.inApp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {guide.steps && (
          <section className="space-y-3">
            <h2 className={h2}>{guide.steps.heading}</h2>
            <ol className="list-decimal space-y-2 pl-6">
              {guide.steps.items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>
        )}

        {guide.table && (
          <section className="space-y-3">
            <h2 className={h2}>{guide.table.heading}</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <caption className={`mb-2 text-left text-xs ${muted}`}>{guide.table.caption}</caption>
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-left">
                    {guide.table.columns.map((col) => (
                      <th key={col} scope="col" className="py-2 pr-3 font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.table.rows.map((row) => (
                    <tr key={row[0]} className="border-b border-[var(--outline-variant)] align-top">
                      {row.map((cell, i) =>
                        i === 0 ? (
                          <th key={i} scope="row" className="py-2 pr-3 text-left font-medium">{cell}</th>
                        ) : (
                          <td key={i} className="py-2 pr-3">{cell}</td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {guide.example && (
          <section className="space-y-3">
            <h2 className={h2}>{guide.example.heading}</h2>
            <p>{guide.example.intro}</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <caption className={`mb-2 text-left text-xs ${muted}`}>{guide.example.table.caption}</caption>
                <thead>
                  <tr className="border-b border-[var(--outline-variant)] text-left">
                    {guide.example.table.columns.map((col) => (
                      <th key={col} scope="col" className="py-2 pr-3 font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.example.table.rows.map((row) => (
                    <tr key={row[0]} className="border-b border-[var(--outline-variant)] align-top">
                      {row.map((cell, i) =>
                        i === 0 ? (
                          <th key={i} scope="row" className="py-2 pr-3 text-left font-medium">{cell}</th>
                        ) : (
                          <td key={i} className="py-2 pr-3">{cell}</td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="font-medium">{guide.example.verdict}</p>
          </section>
        )}

        <section className="space-y-3">
          <h2 className={h2}>{guide.signalsHeading}</h2>
          <ul className="list-disc space-y-2 pl-6">
            {guide.signalNotes.map(({ key, note }) => (
              <li key={key}>
                <Link href={`/methodology#${key}`} className="font-semibold hover:underline">
                  {SIGNAL_MODEL[key].label}
                </Link>
                : {note}
              </li>
            ))}
          </ul>
          <p className={`text-sm ${muted}`}>
            Scores are 0–100 heuristics computed from the name and your search words, not traffic or ranking data.{" "}
            <Link href="/methodology" className={link}>Full definitions of every score</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>{guide.whenNotHeading}</h2>
          <ul className="list-disc space-y-2 pl-6">
            {guide.whenNot.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>

        
<section className="space-y-3">
          <h2 className={h2}>{guide.mistakesHeading}</h2>
          <ul className="list-disc space-y-2 pl-6">
            {guide.mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>

        <section className={`${card} space-y-3 bg-[var(--surface-container-low)]`}>
          <h2 className={h2}>Next step</h2>
          <p>{guide.nextStep.text}</p>
          <div className="flex flex-wrap gap-3">
            {guide.nextStep.links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  i === 0
                    ? "rounded-[var(--radius-md)] bg-[var(--theme-primary)] px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-[var(--radius-md)] border border-[var(--outline-variant)] bg-white px-4 py-2 text-sm font-semibold text-[var(--theme-primary)]"
                }
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className={h2}>Frequently asked questions</h2>
          <div className="space-y-4">
            {guide.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold">{f.q}</h3>
                <p className="mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {guide.sources.length > 0 && (
          <section className="space-y-2">
            <h2 className={h2}>Sources</h2>
            <ul className={`list-disc space-y-1 pl-6 text-sm ${muted}`}>
              {guide.sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener" className="underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="space-y-2">
            <h2 className={h2}>Related guides</h2>
            <ul className="list-disc space-y-1 pl-6">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/guides/${r.slug}`} className={link}>
                    {r.question}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-sm">
              <Link href="/guides" className={link}>All guides</Link>
            </p>
          </section>
        )}
      </article>
    </PageShell>
  );
}
