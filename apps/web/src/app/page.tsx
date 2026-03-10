import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";

const commandBlocks = [
  {
    title: "Client Portal",
    description:
      "Conversational tax-year wizard, AI-guided document intake, and proactive savings nudges.",
    href: "/portal",
    accent: "from-brand-sky to-cyan-400",
  },
  {
    title: "Preparer Workbench",
    description:
      "Review extraction with confidence overlays, source-aware fields, and rapid correction loops.",
    href: "/admin/documents",
    accent: "from-brand-blue to-slate-600",
  },
  {
    title: "Reviewer Command",
    description:
      "Portfolio-level quality controls, battle-plan opportunities, and bottleneck intelligence.",
    href: "/admin",
    accent: "from-slate-700 to-brand-blue-light",
  },
];

const confidenceLegend = [
  {
    level: "Green",
    score: "90-100",
    summary: "Ready for filing or approval with minimal supervision.",
    style: "confidence-green",
  },
  {
    level: "Yellow",
    score: "60-89",
    summary: "Human verification recommended before downstream decisions.",
    style: "confidence-yellow",
  },
  {
    level: "Red",
    score: "0-59",
    summary: "Critical mismatch, missing evidence, or anomaly requiring intervention.",
    style: "confidence-red",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 command-grid opacity-30" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-brand-gold/30 bg-brand-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
              BBA Services Tax Intelligence Platform
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-brand-blue sm:text-5xl lg:text-6xl">
              A Fintech Command Center
              <span className="block text-brand-gold">for Tax Preparation and Advisory</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              AI-powered workflows for clients, preparers, and reviewers with progressive disclosure, confidence scoring, and self-healing correction loops.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/apply" className="btn-primary text-center text-base">
                Start Tax Year Wizard
              </Link>
              <Link
                href="/portal"
                className="rounded-lg border border-brand-blue px-6 py-3 text-center text-base font-semibold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
              >
                Open Client Portal
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-center">
              <div className="command-surface p-4">
                <p className="text-2xl font-bold text-brand-blue">3</p>
                <p className="text-xs text-slate-500">Role-specific views</p>
              </div>
              <div className="command-surface p-4">
                <p className="text-2xl font-bold text-brand-blue">24/7</p>
                <p className="text-xs text-slate-500">AI document triage</p>
              </div>
              <div className="command-surface p-4">
                <p className="text-2xl font-bold text-brand-blue">100%</p>
                <p className="text-xs text-slate-500">Correction learning loop</p>
              </div>
            </div>
          </div>
          <div className="command-surface p-8">
            <BrandLogo priority />
            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-brand-blue">Workflow Health</p>
                <p className="mt-1 text-sm text-slate-500">71 returns in motion. 9 ready-to-file. 4 anomaly alerts.</p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                Green confidence spike detected for W-2 extraction after 11 reviewer corrections.
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Yellow confidence queue: 13 K-1 documents need contextual validation.
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                Red anomaly watchlist triggered for high withholding ratio outliers.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/80 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-bold text-brand-blue">Three Workspaces, One Unified Tax Graph</h2>
          <p className="mt-2 max-w-3xl text-slate-600">
            Each user group sees only what matters now, while the platform continuously syncs source documents, field-level confidence, and review outcomes.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {commandBlocks.map((block) => (
              <Link
                key={block.title}
                href={block.href}
                className="group command-surface p-6 transition-transform hover:-translate-y-1"
              >
                <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${block.accent}`} />
                <h3 className="mt-5 text-xl font-semibold text-brand-blue">{block.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{block.description}</p>
                <p className="mt-4 text-sm font-semibold text-brand-gold">Enter workspace -&gt;</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div className="command-surface p-7">
            <h2 className="font-display text-2xl font-bold text-brand-blue">Confidence-Based Operations</h2>
            <p className="mt-2 text-slate-600">
              Every extracted field, recommendation, and battle-plan card is color-coded so teams can prioritize review effort where it matters.
            </p>
            <div className="mt-5 space-y-3">
              {confidenceLegend.map((item) => (
                <div key={item.level} className={`rounded-xl p-4 ${item.style}`}>
                  <p className="text-sm font-semibold uppercase tracking-wide">
                    {item.level} Confidence · {item.score}
                  </p>
                  <p className="mt-1 text-sm">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="command-surface p-7">
            <h3 className="font-display text-2xl font-bold text-brand-blue">Self-Healing Loop</h3>
            <ol className="mt-4 space-y-3 text-sm text-slate-600">
              <li>1. AI extracts and classifies source documents.</li>
              <li>2. Preparers verify or override low-confidence fields.</li>
              <li>3. Reviewer rationale is captured as learning context.</li>
              <li>4. Future predictions are reweighted by correction patterns.</li>
            </ol>
            <div className="mt-6 rounded-xl border border-brand-gold/40 bg-brand-gold/10 p-4 text-sm text-brand-blue">
              Battle-ready mode continuously hunts for tax savings opportunities before clients ask.
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-brand-blue px-8 py-12 text-center shadow-2xl">
          <h2 className="font-display text-3xl font-bold text-white">Launch the 2026 Tax Intelligence Workflow</h2>
          <p className="mx-auto mt-3 max-w-3xl text-slate-200">
            Start with the client wizard, route documents into AI processing, and drive review cycles with precision confidence signals.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/apply"
              className="rounded-lg bg-brand-gold px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-brand-gold-light"
            >
              Start Intake
            </Link>
            <a
              href="mailto:bruce@bbaservices.org"
              className="rounded-lg border-2 border-brand-gold px-8 py-4 text-lg font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-white"
            >
              Talk With BBA
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
