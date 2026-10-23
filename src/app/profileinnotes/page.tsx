"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { ChevronRight, ExternalLink, FileText, LogOut, Settings, Trash2 } from "lucide-react";
import { AppShell, Avatar, logout } from "../components/AppShell";
import { ConfirmDialog } from "../components/Dialog";
import { pluralize } from "@/utils/format";

// Define a type for the user data
type UserProfile = {
  firstName: string;
  email: string;
  avatar: string;
  totalNotes: number;
};

const LINKS = [
  {
    href: "/account-settings",
    label: "Account settings",
    description: "Name, photo and account deletion",
    icon: Settings,
  },
  {
    href: "/recently-deleted",
    label: "Recently deleted",
    description: "Restore notes you've deleted",
    icon: Trash2,
  },
];

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profileinnotes");
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out. Stay hard.");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <AppShell active="profile" title="Profile">
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
        <section className="card overflow-hidden">
          <div className="h-20 bg-gradient-to-br from-accent/30 via-accent/10 to-transparent sm:h-28" />
          <div className="-mt-10 flex flex-col items-center px-5 pb-6 text-center sm:-mt-14 sm:pb-8">
            {loading ? (
              <>
                <div className="skeleton size-20 rounded-full ring-4 ring-surface sm:size-28" />
                <div className="skeleton mt-4 h-5 w-40" />
                <div className="skeleton mt-2 h-4 w-52" />
              </>
            ) : (
              user && (
                <>
                  <Avatar
                    profile={{ name: user.firstName, avatar: user.avatar }}
                    className="size-20 text-3xl ring-4 ring-surface sm:size-28 sm:text-4xl"
                  />
                  <h2 className="mt-4 break-words text-2xl font-bold tracking-tight">{user.firstName}</h2>
                  <p className="mt-0.5 break-all text-sm text-ink-2">{user.email}</p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3.5 py-1.5 text-sm font-medium">
                    <FileText className="size-4 text-accent" />
                    {pluralize(user.totalNotes ?? 0, "note")}
                  </div>
                </>
              )
            )}
          </div>
        </section>

        <nav className="card divide-y divide-line overflow-hidden" aria-label="Profile">
          {LINKS.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-2 sm:px-5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-2">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{label}</span>
                <span className="block truncate text-sm text-ink-3">{description}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-ink-3" />
            </Link>
          ))}
          <a
            href="https://github.com/PremKaneriya"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-2 sm:px-5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-2">
              <ExternalLink className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">About</span>
              <span className="block truncate text-sm text-ink-3">Meet the developer on GitHub</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-ink-3" />
          </a>
        </nav>

        <button
          onClick={() => setIsLogoutOpen(true)}
          className="btn btn-secondary h-12 w-full text-danger hover:bg-danger/10"
        >
          <LogOut className="size-4" /> Log out
        </button>

        <p className="pt-2 text-center text-xs text-ink-3">
          © {new Date().getFullYear()} Goggins NoteBook · Stay hard.
        </p>
      </div>

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
    </AppShell>
  );
}
