import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),_rgba(255,255,255,0))]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl animate-float motion-reduce:animate-none" />
      <div className="pointer-events-none absolute bottom-10 right-[-6rem] h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl animate-float-slow motion-reduce:animate-none" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-12 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-10">
          <Link href="/" className="inline-flex items-center gap-3 text-slate-900">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-sm font-bold text-white shadow-soft">
              Aq
            </span>
            <span className="text-lg font-semibold">Aquora</span>
          </Link>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
              Water clarity hub
            </p>
            <h1 className="text-balance font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
              Keep billing calm, transparent, and entirely under control.
            </h1>
            <p className="max-w-xl text-base text-slate-600">
              Aquora syncs usage, alerts, and payments into one serene dashboard so teams and
              residents always know what is happening next.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Sync cadence", value: "15 min", detail: "Live meter updates" },
              { label: "Saved time", value: "38%", detail: "Ops effort reduction" }
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm shadow-sky-100/70 backdrop-blur"
              >
                <p className="text-xs font-semibold uppercase text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-display font-semibold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500">{stat.detail}</p>
              </div>
            ))}
          </div>

          <ul className="space-y-3 text-sm text-slate-600">
            {[
              "Proactive alerts for abnormal usage spikes.",
              "Resident-friendly receipts with mobile-first clarity.",
              "Secure billing controls for every property type."
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3 w-3"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8.5 13.2 4.8 9.6l1.4-1.4 2.3 2.2 5.4-5.4 1.4 1.4-6.8 6.8z" />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <main className="flex w-full items-center justify-center">{children}</main>
      </div>
    </div>
  );
}
