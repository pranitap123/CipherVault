import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui";

const nav = [
  { to: "/app", label: "Dashboard", exact: true, icon: GridIcon },
  { to: "/app/files", label: "Files", icon: FolderIcon },
  { to: "/app/settings", label: "Settings", icon: GearIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initials = (user?.name || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-base-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-line bg-base-900 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 px-5">
          <Logo />
          <span className="font-semibold tracking-tight">SecureVault</span>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.exact}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `focusable flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "text-ink-muted hover:bg-base-800 hover:text-ink"
                }`
              }
            >
              <n.icon />
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-base-950/80 px-4 backdrop-blur lg:px-8">
          <button
            className="focusable rounded-lg p-2 text-ink-muted hover:bg-base-800 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>
          <div className="hidden text-sm text-ink-faint lg:block">
            All files encrypted at rest
          </div>
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
              {initials}
            </div>
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight">{user?.name}</div>
              <div className="text-xs text-ink-faint">{user?.email}</div>
            </div>
            <Button
              variant="ghost"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
            >
              Sign out
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 2 4 6v6c0 5 3.5 7.5 8 10 4.5-2.5 8-5 8-10V6l-8-4Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    </div>
  );
}
function GridIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function FolderIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>;
}
function GearIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9 2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5 2 2 0 1 1 4 0 1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1 2 2 0 1 1 0 4 1.7 1.7 0 0 0-1.5 1Z"/></svg>;
}
function MenuIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
}
