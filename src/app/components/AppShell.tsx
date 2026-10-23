/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FileText, FolderOpen, LogOut, Plus, Trash2, User } from "lucide-react";
import { ConfirmDialog } from "./Dialog";

export type ShellProfile = {
  name: string;
  email?: string;
  avatar?: string;
};

type Section = "notes" | "groups" | "trash" | "profile";

const NAV_ITEMS = [
  { id: "notes", label: "Notes", short: "Notes", href: "/dashboard", icon: FileText },
  { id: "groups", label: "Groups", short: "Groups", href: "/groupnotes", icon: FolderOpen },
  { id: "trash", label: "Recently deleted", short: "Trash", href: "/recently-deleted", icon: Trash2 },
] as const;

const PROFILE_ITEM = { id: "profile", label: "Profile", short: "Profile", href: "/profileinnotes", icon: User } as const;

// Kept at module level so client-side navigation between pages doesn't refetch it
let cachedProfile: ShellProfile | null = null;

function useProfile() {
  const [profile, setProfile] = useState<ShellProfile | null>(cachedProfile);

  useEffect(() => {
    if (cachedProfile) return;
    fetch("/api/profile", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        cachedProfile = { name: data.name, email: data.email, avatar: data.avatar };
        setProfile(cachedProfile);
      })
      .catch((err) => console.error("Profile fetch error:", err));
  }, []);

  return profile;
}

export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to logout");
  cachedProfile = null;
}

export function BrandMark({ className = "size-9 text-base" }: { className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl bg-ink font-black tracking-tighter text-canvas ${className}`}
      aria-hidden="true"
    >
      <span>
        G<span className="text-accent">.</span>
      </span>
    </span>
  );
}

export function Avatar({
  profile,
  className = "size-9 text-sm",
}: {
  profile: ShellProfile | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (profile?.avatar && !failed) {
    return (
      <img
        src={profile.avatar}
        alt=""
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover ring-1 ring-line ${className}`}
      />
    );
  }
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-surface-2 font-semibold text-ink ring-1 ring-line ${className}`}
      aria-hidden="true"
    >
      {profile?.name?.charAt(0).toUpperCase() || "G"}
    </span>
  );
}

interface AppShellProps {
  active: Section;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  onCreate?: () => void;
  createLabel?: string;
  children: React.ReactNode;
}

export function AppShell({
  active,
  title,
  subtitle,
  actions,
  onCreate,
  createLabel = "New note",
  children,
}: AppShellProps) {
  const router = useRouter();
  const profile = useProfile();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleCreate = onCreate ?? (() => router.push("/dashboard?new=1"));

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out. Stay hard.");
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Couldn't log out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="app-theme min-h-dvh bg-canvas text-ink">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgb(var(--surface))",
            color: "rgb(var(--ink))",
            border: "1px solid rgb(var(--line))",
            borderRadius: "14px",
            fontSize: "14px",
          },
        }}
      />

      {/* Sidebar: icon rail on tablets, full width from `lg` */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col border-r border-line bg-surface md:flex lg:w-64">
        <Link
          href="/dashboard"
          className="flex h-16 shrink-0 items-center justify-center gap-3 px-4 lg:justify-start lg:px-5"
          aria-label="Goggins NoteBook"
        >
          <BrandMark />
          <span className="hidden min-w-0 leading-tight lg:block">
            <span className="block font-bold tracking-tight">Goggins</span>
            <span className="block text-xs text-ink-3">NoteBook</span>
          </span>
        </Link>

        <div className="px-3 pt-2 lg:px-4">
          <button
            onClick={handleCreate}
            className="btn btn-primary w-full px-0 lg:px-4"
            title={createLabel}
          >
            <Plus className="size-5" />
            <span className="sr-only lg:not-sr-only">{createLabel}</span>
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1 px-3 lg:px-4" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === active;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                title={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-11 items-center justify-center gap-3 rounded-xl px-3 text-sm transition-colors lg:justify-start ${
                  isActive
                    ? "bg-surface-2 font-semibold text-ink"
                    : "font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <Icon className={`size-5 shrink-0 ${isActive ? "text-accent" : ""}`} />
                <span className="sr-only lg:not-sr-only">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-line p-3 lg:p-4">
          <div className="flex flex-col items-center gap-2 lg:flex-row">
            <Link
              href="/profileinnotes"
              title="Profile"
              aria-current={active === "profile" ? "page" : undefined}
              className={`flex min-w-0 items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-surface-2 lg:flex-1 ${
                active === "profile" ? "bg-surface-2" : ""
              }`}
            >
              <Avatar profile={profile} />
              <span className="hidden min-w-0 lg:block">
                <span className="block truncate text-sm font-medium">
                  {profile?.name ?? "Your profile"}
                </span>
                {profile?.email && (
                  <span className="block truncate text-xs text-ink-3">{profile.email}</span>
                )}
              </span>
            </Link>
            <button
              onClick={() => setIsLogoutOpen(true)}
              className="icon-btn"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="size-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      <div className="md:pl-[76px] lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-line/70 bg-canvas/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="md:hidden" aria-label="Goggins NoteBook">
              <BrandMark className="size-8 text-sm" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
              {subtitle && <p className="truncate text-xs text-ink-3 sm:text-sm">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-1 sm:gap-2">{actions}</div>}
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6 md:pb-12 lg:px-8">
          {children}
        </main>
      </div>

      {/* Bottom tab bar on phones */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Main"
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-1">
          {[NAV_ITEMS[0], NAV_ITEMS[1], null, NAV_ITEMS[2], PROFILE_ITEM].map((item) => {
            if (!item) {
              return (
                <div key="create" className="flex justify-center">
                  <button
                    onClick={handleCreate}
                    aria-label={createLabel}
                    className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-ink shadow-lg shadow-accent/30 transition-transform active:scale-95"
                  >
                    <Plus className="size-6" strokeWidth={2.5} />
                  </button>
                </div>
              );
            }
            const isActive = item.id === active;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive ? "text-ink" : "text-ink-3"
                }`}
              >
                <Icon className={`size-[22px] ${isActive ? "text-accent" : ""}`} strokeWidth={isActive ? 2.25 : 2} />
                {item.short}
              </Link>
            );
          })}
        </div>
      </nav>

      <ConfirmDialog
        open={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Log out?"
        description="You'll need to sign in again to get back to your notes."
        confirmLabel="Log out"
        tone="danger"
        busy={isLoggingOut}
      />
    </div>
  );
}
