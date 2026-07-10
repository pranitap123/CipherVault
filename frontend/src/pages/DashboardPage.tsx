import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { StorageStats, VaultFile } from "../types";
import { formatBytes, formatDate, fileKind } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/ui";

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [recent, setRecent] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, f] = await Promise.all([api.storageStats(), api.listFiles()]);
      if (s.ok) setStats(s.data);
      if (f.ok) setRecent(f.data.slice(0, 5));
      setLoading(false);
    };
    void load();
  }, []);

  const pct = stats ? Math.min(100, (stats.usedBytes / stats.quotaBytes) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back, {user?.name?.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">Here's the state of your vault.</p>

      {loading ? (
        <div className="flex justify-center py-16 text-ink-muted"><Spinner /></div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Files stored" value={String(stats?.fileCount ?? 0)} />
            <Stat label="Storage used" value={formatBytes(stats?.usedBytes ?? 0)} />
            <Stat label="Encryption" value="AES-256" sub="at rest" />
          </div>

          {/* Storage bar */}
          <div className="card mt-4 p-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-ink-muted">Storage</span>
              <span className="text-ink-faint">
                {formatBytes(stats?.usedBytes ?? 0)} of {formatBytes(stats?.quotaBytes ?? 0)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-base-800">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {/* Recent files */}
            <div className="card p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">Recent files</h2>
                <Link to="/app/files" className="text-xs text-accent hover:text-accent-hover">View all</Link>
              </div>
              {recent.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-faint">No files yet.</p>
              ) : (
                <ul className="divide-y divide-line/60">
                  {recent.map((f) => (
                    <li key={f.id} className="flex items-center justify-between py-3 text-sm">
                      <span className="truncate text-ink">{f.name}</span>
                      <span className="shrink-0 text-xs text-ink-faint">
                        {fileKind(f.mimeType)} · {formatDate(f.updatedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick actions */}
            <div className="card p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">Quick actions</h2>
              <div className="flex flex-col gap-2">
                <Link to="/app/files" className="focusable rounded-lg bg-accent px-4 py-2 text-center text-sm font-medium text-white hover:bg-accent-hover">
                  Upload a file
                </Link>
                <Link to="/app/files" className="focusable rounded-lg bg-base-800 px-4 py-2 text-center text-sm text-ink hover:bg-base-700">
                  Browse vault
                </Link>
                <Link to="/app/settings" className="focusable rounded-lg bg-base-800 px-4 py-2 text-center text-sm text-ink hover:bg-base-700">
                  Account settings
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
        {value} {sub && <span className="text-sm font-normal text-ink-faint">{sub}</span>}
      </p>
    </div>
  );
}
