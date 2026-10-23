/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileDown,
  Flame,
  FolderOpen,
  ShieldCheck,
  Smartphone,
  Target,
  Undo2,
} from "lucide-react";
import { BrandMark } from "./components/AppShell";

const FEATURES = [
  {
    icon: Flame,
    title: "Mental Toughness",
    description:
      "Build your workspace with the same discipline David Goggins applies to his training.",
  },
  {
    icon: ShieldCheck,
    title: "No Compromise",
    description:
      "Your notes and plans without shortcuts or excuses. Be uncommon amongst uncommon.",
  },
  {
    icon: Target,
    title: "Accountable Writing",
    description:
      "Track your progress, face your own truth, and push beyond your perceived limits.",
  },
];

const CAPABILITIES = [
  { icon: FolderOpen, label: "Group related notes" },
  { icon: FileDown, label: "Export to PDF" },
  { icon: Undo2, label: "Restore deleted notes" },
  { icon: Smartphone, label: "Built for every screen" },
];

const POWERED_BY = [
  {
    src: "https://ml.globenewswire.com/Resource/Download/3a54c241-a668-4c94-9747-3d3da9da3bf2",
    alt: "David Goggins",
  },
  {
    src: "https://cdn.rswebsols.com/wp-content/uploads/2024/02/next-js-logo-920x341.png?strip=all&lossy=1&ssl=1",
    alt: "Next.js",
  },
  { src: "https://dotnettrickscloud.blob.core.windows.net/img/nodejs/nodejs.png", alt: "Node.js" },
  {
    src: "https://www.ovhcloud.com/sites/default/files/styles/large_screens_1x/public/2022-03/black.png",
    alt: "OVHcloud",
  },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch("/api/auth/token", {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
        });

        const data = await res.json();
        if (data.token) {
          router.push("/dashboard"); // Redirect if token exists
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();
  }, [router]);

  return (
    <div className="app-theme min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-canvas/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <BrandMark />
            <span className="truncate font-bold tracking-tight">
              Goggins <span className="hidden font-normal text-ink-3 min-[420px]:inline">NoteBook</span>
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link href="/login" className="btn btn-ghost px-3 sm:px-4">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary px-3 sm:px-4">
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-48 right-[-20%] size-[40rem] rounded-full bg-accent/20 blur-3xl sm:right-[-10%]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2">
                <Flame className="size-3.5 text-accent" /> Stay hard. Stay productive.
              </span>
              <h1 className="mt-5 text-[2.75rem] font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                The harder
                <br />
                workspace<span className="text-accent">.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-2 sm:text-xl">
                Write. Plan. Collaborate. With a little help from the toughest mindset.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="btn btn-primary h-12 px-6 text-base">
                  Get started <ArrowRight className="size-4" />
                </Link>
                <Link href="/login" className="btn btn-secondary h-12 px-6 text-base">
                  I have an account
                </Link>
              </div>

              <div className="mt-10">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-3">
                  Powered by the best in performance and technology
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  {POWERED_BY.map((logo) => (
                    <span
                      key={logo.alt}
                      className="flex h-10 items-center rounded-xl bg-white px-3 ring-1 ring-line"
                    >
                      <img src={logo.src} alt={logo.alt} className="h-5 w-16 object-contain" />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 ring-1 ring-black/5 dark:ring-white/10">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-orange-600/40 to-transparent"
                />
                <img
                  src="https://www.gogginsnoexcuses.com/img/Goggins_Head.png"
                  alt="David Goggins"
                  className="absolute inset-0 h-full w-full object-contain p-8 sm:p-12"
                />
              </div>
              <div className="card absolute -left-2 bottom-6 w-52 -rotate-3 p-4 shadow-2xl shadow-black/10 sm:-left-8 sm:bottom-10 sm:w-64">
                <p className="text-xs text-ink-3">Today · 4:02 AM</p>
                <p className="mt-1 font-semibold">10 miles. No excuses.</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink-2">
                  Legs said stop. Mind said go. Callus the mind.
                </p>
              </div>
              <div className="card absolute -right-2 top-6 flex rotate-2 items-center gap-2 px-3.5 py-2.5 shadow-2xl shadow-black/10 sm:-right-6 sm:top-10">
                <span className="size-2 rounded-full bg-accent" />
                <span className="text-sm font-medium">Accountability mirror</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Stay Hard. Stay Productive.</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-2">
                No excuses, just results. Our workspace helps you push through mental barriers.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }, i) => (
                <div
                  key={title}
                  className="rounded-2xl border border-line bg-canvas p-6 sm:last:col-span-2 lg:last:col-span-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-ink text-canvas">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-ink-3">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-2">{description}</p>
                </div>
              ))}
            </div>
            <ul className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
              {CAPABILITIES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium"
                >
                  <Icon className="size-4 shrink-0 text-accent" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Call to action */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-stone-900 px-6 py-12 text-center text-white ring-1 ring-white/10 sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-orange-600/40 blur-3xl"
            />
            <p className="relative text-2xl font-bold tracking-tight sm:text-4xl">
              &ldquo;Who&rsquo;s gonna carry the boats?&rdquo;
            </p>
            <p className="relative mt-3 text-stone-300">You are. Start with a single note.</p>
            <Link
              href="/signup"
              className="btn relative mt-8 h-12 bg-white px-6 text-base text-stone-900 hover:bg-stone-200"
            >
              Create your account <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-8 text-sm text-ink-3 sm:flex-row sm:px-6 lg:px-8">
          <p>Stay hard, stay disciplined.</p>
          <nav className="flex gap-6">
            <a
              href="https://github.com/PremKaneriya"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              About
            </a>
            <Link href="/login" className="hover:text-ink">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-ink">
              Sign up
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
