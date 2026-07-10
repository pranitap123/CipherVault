import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Button, Field, useToast } from "../components/ui";

type Tab = "profile" | "appearance" | "password";

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "appearance", label: "Appearance" },
    { id: "password", label: "Password" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <div className="mt-6 flex gap-6">
        <nav className="w-40 shrink-0">
          <ul className="flex flex-col gap-1">
            {tabs.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setTab(t.id)}
                  className={`focusable w-full rounded-lg px-3 py-2 text-left text-sm ${
                    tab === t.id ? "bg-accent-soft text-accent" : "text-ink-muted hover:bg-base-800"
                  }`}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 flex-1">
          {tab === "profile" && <ProfileTab />}
          {tab === "appearance" && <AppearanceTab />}
          {tab === "password" && <PasswordTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user } = useAuth();
  const { push } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    const res = await api.updateProfile({ name });
    setLoading(false);
    push(res.ok ? { kind: "ok", text: "Profile saved." } : { kind: "error", text: res.error.message });
  };

  return (
    <div className="card max-w-lg p-6">
      <h2 className="mb-4 text-sm font-semibold text-ink">Profile</h2>
      <div className="flex flex-col gap-4">
        <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" value={user?.email ?? ""} disabled hint="Contact support to change your email." />
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${user?.emailVerified ? "bg-ok" : "bg-warn"}`} />
          <span className="text-xs text-ink-muted">
            {user?.emailVerified ? "Email verified" : "Email not verified"}
          </span>
        </div>
        <div><Button onClick={save} loading={loading}>Save changes</Button></div>
      </div>
    </div>
  );
}

function AppearanceTab() {
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  return (
    <div className="card max-w-lg p-6">
      <h2 className="mb-4 text-sm font-semibold text-ink">Appearance</h2>
      <p className="mb-4 text-sm text-ink-muted">SecureVault uses a dark theme tuned for long working sessions.</p>
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-ink-muted">Density</span>
        <div className="flex gap-2">
          {(["comfortable", "compact"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`focusable rounded-lg border px-4 py-2 text-sm capitalize ${
                density === d ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-muted hover:bg-base-800"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PasswordTab() {
  const { push } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setError(null);
    setLoading(true);
    const res = await api.changePassword(current, next);
    setLoading(false);
    if (res.ok) {
      push({ kind: "ok", text: "Password changed." });
      setCurrent(""); setNext("");
    } else setError(res.error.message);
  };

  return (
    <div className="card max-w-lg p-6">
      <h2 className="mb-4 text-sm font-semibold text-ink">Change password</h2>
      <div className="flex flex-col gap-4">
        <Field label="Current password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <Field label="New password" type="password" value={next} onChange={(e) => setNext(e.target.value)} error={error ?? undefined} hint="At least 8 characters." />
        <div><Button onClick={save} loading={loading}>Update password</Button></div>
      </div>
    </div>
  );
}
