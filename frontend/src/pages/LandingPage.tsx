import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Tilt } from "../components/ui/Tilt";
import { VaultHero } from "../features/landing/VaultHero";

const FEATURES = [
  {
    title: "Envelope encryption",
    body: "Every file gets its own random data key, encrypted with AES-256-GCM. That key is then wrapped under a master key — rotating the master key never touches file content.",
    icon: <LockIcon />,
  },
  {
    title: "Role-based access control",
    body: "USER and ADMIN roles, enforced server-side on every /admin route. A regular account gets a 403 from the API itself, not just a hidden button.",
    icon: <ShieldIcon />,
  },
  {
    title: "Tamper detection",
    body: "GCM's authentication tag means a corrupted or tampered file throws on decrypt instead of silently returning garbage bytes.",
    icon: <AlertIcon />,
  },
  {
    title: "Audit logging",
    body: "Every upload, download, delete, and admin action — including role changes — is written to an append-only audit log tied to the acting user.",
    icon: <ListIcon />,
  },
  {
    title: "Rate limiting",
    body: "Global and auth-specific limits via express-rate-limit, tuned tighter on login/register to blunt brute-force attempts.",
    icon: <GaugeIcon />,
  },
  {
    title: "Docker & tested",
    body: "Multi-stage Docker builds, health-gated startup order in compose, and a Vitest suite that proves the RBAC gate actually rejects the wrong role.",
    icon: <BoxIcon />,
  },
];

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="admin-zone min-h-screen" style={{ background: "var(--obsidian)" }}>
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{ background: "var(--brass)", color: "var(--obsidian)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2 4 6v6c0 5 3.5 7.5 8 10 4.5-2.5 8-5 8-10V6l-8-4Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="font-semibold tracking-tight" style={{ color: "var(--mist)" }}>
            CipherVault
          </span>
        </div>
        <Link
          to={user ? "/app" : "/login"}
          className="focusable rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: "var(--brass)", color: "var(--obsidian)" }}
        >
          {user ? "Go to dashboard" : "Sign in"}
        </Link>
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 overflow-hidden px-6 pb-20 pt-8 text-center lg:flex-row lg:text-left">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--brass) 1px, transparent 1px), linear-gradient(90deg, var(--brass) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="relative flex-1">
          <div
            className="mb-5 inline-flex rounded-full px-3 py-1 font-mono text-xs"
            style={{ background: "var(--steel)", color: "var(--brass-glow)" }}
          >
            AES-256-GCM · envelope encryption
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl" style={{ color: "var(--mist)" }}>
            Encrypted file storage,
            <br />
            with access control that's actually enforced.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base lg:mx-0" style={{ color: "var(--mist-faint)" }}>
            Every file gets its own encryption key. Every admin action is
            server-side gated by role, not hidden by a UI toggle. Try both
            below — the difference is real, not cosmetic.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              to="/register"
              className="focusable rounded-lg px-5 py-3 text-sm font-semibold transition-colors"
              style={{ background: "var(--brass)", color: "var(--obsidian)" }}
            >
              Create an account
            </Link>
            <a
              href="#demo"
              className="focusable rounded-lg border px-5 py-3 text-sm font-medium transition-colors"
              style={{ borderColor: "var(--steel-line)", color: "var(--mist)" }}
            >
              Try the live demo
            </a>
          </div>
        </div>
        <div className="relative flex-1">
          <VaultHero />
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold" style={{ color: "var(--mist)" }}>
          What's actually enforced under the hood
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Tilt key={f.title} strength={5}>
              <div
                className="h-full rounded-2xl border p-6"
                style={{ borderColor: "var(--steel-line)", background: "var(--graphite)" }}
              >
                <div
                  className="mb-4 grid h-10 w-10 place-items-center rounded-lg"
                  style={{ background: "var(--steel)", color: "var(--brass-glow)" }}
                >
                  {f.icon}
                </div>
                <h3 className="font-medium" style={{ color: "var(--mist)" }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mist-faint)" }}>
                  {f.body}
                </p>
              </div>
            </Tilt>
          ))}
        </div>
      </section>

      {/* RBAC demo */}
      <section id="demo" className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold" style={{ color: "var(--mist)" }}>
          See RBAC in action — no signup needed
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm" style={{ color: "var(--mist-faint)" }}>
          Sign in as either account. Only the admin sees the "Admin" nav link
          and can reach <code>/app/admin</code> — the regular account gets
          redirected, and the API itself would 403 even with a forged link.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <DemoCard
            role="Member"
            email="demo@ciphervault.dev"
            password="DemoPass123!"
            description="Can upload, download, and manage only their own files. No admin nav link, no access to /app/admin."
          />
          <DemoCard
            role="Admin"
            email="admin@ciphervault.dev"
            password="ChangeMe123!"
            description="Everything a member can do, plus: view every user's files, change any user's role, delete any file — all server-enforced."
            highlight
          />
        </div>
      </section>

      <footer className="border-t px-6 py-8 text-center text-xs" style={{ borderColor: "var(--steel-line)", color: "var(--mist-faint)" }}>
        Built with Node.js, TypeScript, PostgreSQL, and Docker.
      </footer>
    </div>
  );
}

function DemoCard({
  role,
  email,
  password,
  description,
  highlight,
}: {
  role: string;
  email: string;
  password: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        borderColor: highlight ? "var(--brass)" : "var(--steel-line)",
        background: "var(--graphite)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-1 font-mono text-xs"
          style={{
            background: highlight ? "rgba(201,150,60,0.15)" : "var(--steel)",
            color: highlight ? "var(--brass-glow)" : "var(--mist-faint)",
          }}
        >
          {role}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--mist-faint)" }}>
        {description}
      </p>
      <div className="mt-4 space-y-1 font-mono text-xs" style={{ color: "var(--mist)" }}>
        <div>{email}</div>
        <div style={{ color: "var(--mist-faint)" }}>{password}</div>
      </div>
      <Link
        to={`/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`}
        className="focusable mt-4 block rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors"
        style={{
          background: highlight ? "var(--brass)" : "var(--steel)",
          color: highlight ? "var(--obsidian)" : "var(--mist)",
        }}
      >
        Sign in as {role.toLowerCase()}
      </Link>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2 4 6v6c0 5 3.5 7.5 8 10 4.5-2.5 8-5 8-10V6l-8-4Z" />
      <path d="M9.5 12.5 11.2 14 15 10" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function GaugeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 14 15 10" />
      <path d="M3 20a9 9 0 1 1 18 0" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" />
    </svg>
  );
}
