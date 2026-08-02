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
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, f] = await Promise.all([api.storageStats(), api.listFiles()]);
      if (s.ok) setStats(s.data);
      if (f.ok) setFiles(f.data);
      setLoading(false);
    };
    void load();
  }, []);

  const storagePercent = stats ? Math.min(100, (stats.usedBytes / stats.quotaBytes) * 100) : 0;
  const remainingBytes = stats ? stats.quotaBytes - stats.usedBytes : 0;
  const lastUploadDate = files.length > 0 
    ? files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]?.updatedAt 
    : null;
  const recentFiles = files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex-1">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
  Welcome back, {user?.name?.split(" ")[0] ?? "User"}
</h1>
            <p className="mt-3 max-w-2xl text-base text-ink-muted leading-relaxed">
              Your vault is protected with enterprise-grade AES-256 encryption. Manage, upload, and securely access your encrypted files from anywhere.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 rounded-lg border border-ok/30 bg-ok/5 px-4 py-3">
              <ShieldCheckIcon />
              <span className="text-sm font-semibold text-ok">Secured</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32 text-ink-muted">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Stats Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total files"
              value={String(stats?.fileCount ?? 0)}
              icon={<FilesIcon />}
              accentColor="accent"
            />
            <StatCard
              label="Storage used"
              value={formatBytes(stats?.usedBytes ?? 0)}
              subtext={`of ${formatBytes(stats?.quotaBytes ?? 0)}`}
              icon={<HardDriveIcon />}
              accentColor="accent"
            />
            <StatCard
              label="Encryption"
              value="AES-256"
              subtext="at rest"
              icon={<LockIcon />}
              accentColor="ok"
            />
            <StatCard
              label="Last upload"
              value={lastUploadDate ? formatDate(lastUploadDate) : "—"}
              subtext={lastUploadDate ? formatRelativeTime(lastUploadDate) : "no uploads yet"}
              icon={<CloudUploadIcon />}
              accentColor="accent"
            />
          </div>

          {/* Storage Usage Card */}
          <StorageUsageCard stats={stats} storagePercent={storagePercent} remainingBytes={remainingBytes} />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Recent Files Section - 2/3 width */}
            <RecentFilesSection files={recentFiles} />

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <QuickActionsCard />

              {/* Security Panel */}
              <SecurityPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function StatCard({
  label,
  value,
  subtext,
  icon,
  accentColor = "accent",
}: {
  label: string;
  value: string;
  subtext?: string;
  icon?: React.ReactNode;
  accentColor?: "accent" | "ok" | "warn" | "danger";
}) {
  const colorMap = {
    accent: "from-accent/20 to-accent/5 border-accent/20",
    ok: "from-ok/20 to-ok/5 border-ok/20",
    warn: "from-warn/20 to-warn/5 border-warn/20",
    danger: "from-danger/20 to-danger/5 border-danger/20",
  };

  return (
    <div className={`card border bg-gradient-to-br ${colorMap[accentColor]} p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</p>
          {subtext && <p className="mt-2 text-xs text-ink-faint">{subtext}</p>}
        </div>
        {icon && <div className="flex-shrink-0 text-ink-muted opacity-50">{icon}</div>}
      </div>
    </div>
  );
}

function StorageUsageCard({
  stats,
  storagePercent,
  remainingBytes,
}: {
  stats: any;
  storagePercent: number;
  remainingBytes: number;
}) {
  // Minimum visible bar width: 3%
  const displayPercent = Math.max(3, storagePercent);
  const isNearCapacity = storagePercent > 85;
  const isAtCapacity = storagePercent > 95;

  return (
    <div className="card border-line/60 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Storage usage</h2>
        <div className="text-right">
          <p className="text-xs font-medium text-ink-muted">
            {formatBytes(stats?.usedBytes ?? 0)} used
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">
            {formatBytes(remainingBytes)} remaining
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 space-y-2">
        <div className="h-3 w-full overflow-hidden rounded-full bg-base-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAtCapacity ? "bg-danger" : isNearCapacity ? "bg-warn" : "bg-gradient-to-r from-accent to-accent"
            }`}
            style={{ width: `${displayPercent}%` }}
          />
        </div>
      </div>

      {/* Status Text */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-faint">
          {storagePercent < 1 ? "Less than 1% used" : `${Math.round(storagePercent)}% full`}
        </span>
        {isAtCapacity && (
          <span className="text-xs font-medium text-danger flex items-center gap-1">
            <AlertCircleIcon /> Storage full
          </span>
        )}
        {isNearCapacity && !isAtCapacity && (
          <span className="text-xs font-medium text-warn">Upgrade soon</span>
        )}
      </div>
    </div>
  );
}

function RecentFilesSection({ files }: { files: VaultFile[] }) {
  return (
    <div className="lg:col-span-2">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Recent files</h2>
        {files.length > 0 && (
          <Link
            to="/app/files"
            className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
          >
            View all →
          </Link>
        )}
      </div>

      {files.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="card border-line/60 divide-y divide-line/40 overflow-hidden">
          {files.map((file) => (
            <FileRow key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileRow({ file }: { file: VaultFile }) {
  const displayName = file.originalFilename ?? file.name;
    
  return (
    <div className="group flex items-center justify-between px-5 py-4 transition-colors hover:bg-base-850/50">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex-shrink-0 text-ink-muted">
          <FileIcon mimeType={file.mimeType} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink group-hover:text-accent transition-colors">
            {displayName}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            {formatBytes(file.sizeBytes)} · {formatDate(file.updatedAt)}
          </p>
        </div>
      </div>
      <div className="ml-4 flex flex-shrink-0 items-center gap-3">
        {file.encrypted && (
          <div className="text-ok" title="Encrypted at rest">
            <LockCheckIcon />
          </div>
        )}
        <span className="text-xs font-medium text-ink-muted whitespace-nowrap">
          {fileKind(file.mimeType)}
        </span>
      </div>
    </div>
  );
}

function QuickActionsCard() {
  return (
    <div className="card border-line/60 p-6">
      <h3 className="mb-4 text-sm font-semibold text-ink">Quick actions</h3>
      <div className="space-y-3">
        {/* Primary */}
        <Link
          to="/app/files"
          className="focusable flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-center text-sm font-semibold text-white hover:bg-accent-hover transition-colors shadow-sm"
        >
          <CloudUploadIcon size="16" />
          Upload file
        </Link>

        {/* Secondary */}
        <Link
          to="/app/files"
          className="focusable flex w-full items-center justify-center gap-2 rounded-lg border border-line/60 bg-base-850 px-4 py-2.5 text-center text-sm font-medium text-ink hover:bg-base-800 transition-colors"
        >
          <FolderIcon size="16" />
          Browse files
        </Link>

        {/* Tertiary */}
        <Link
          to="/app/settings"
          className="focusable flex w-full items-center justify-center gap-2 rounded-lg border border-line/60 bg-transparent px-4 py-2.5 text-center text-sm font-medium text-ink-muted hover:bg-base-850 transition-colors"
        >
          <GearIcon size="16" />
          Settings
        </Link>
      </div>
    </div>
  );
}

function SecurityPanel() {
  const items = [
    {
      title: "AES-256 Encryption",
      description: "Military-grade encryption at rest",
    },
    {
      title: "JWT Authentication",
      description: "Secure stateless session tokens",
    },
    {
      title: "Secure File Storage",
      description: "Encrypted storage with key derivation",
    },
    {
      title: "Ownership Validation",
      description: "Files accessible only by owner",
    },
  ];

  return (
    <div className="card border-line/60 p-6">
      <h3 className="mb-4 text-sm font-semibold text-ink">Security</h3>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <CheckCircleIcon />
            </div>
            <div>
              <p className="text-xs font-medium text-ink">{item.title}</p>
              <p className="mt-0.5 text-xs text-ink-faint">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card border-line/40 rounded-xl border-2 border-dashed p-12 text-center">
      <div className="mb-4 flex justify-center">
        <div className="rounded-lg bg-base-800/50 p-4">
          <EmptyBoxIcon />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-ink">No files uploaded yet</h3>
      <p className="mt-2 text-sm text-ink-muted">
        Start by uploading your first file. All files are encrypted end-to-end and stored securely.
      </p>
      <Link
        to="/app/files"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
      >
        <CloudUploadIcon size="16" />
        Upload your first file
      </Link>
    </div>
  );
}

// ============================================================================
// UTILITIES
// ============================================================================

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

function FileIcon({ mimeType }: { mimeType: string }) {
  const color = mimeType.startsWith("image/")
    ? "text-accent"
    : mimeType === "application/pdf"
      ? "text-danger"
      : mimeType.startsWith("text/") || mimeType.includes("markdown")
        ? "text-ok"
        : "text-ink-muted";

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={color}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ok"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ok flex-shrink-0"
    >
      <polyline points="20 6 9 17 4 12" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function LockCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ok"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function FilesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
    </svg>
  );
}

function HardDriveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="12" x2="2" y2="12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.07 4H7.93a2 2 0 0 0-1.48.63z" />
      <circle cx="6" cy="15" r="1" />
      <circle cx="18" cy="15" r="1" />
    </svg>
  );
}

function CloudUploadIcon({ size = "18" }: { size?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function FolderIcon({ size = "16" }: { size?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function GearIcon({ size = "16" }: { size?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m3.08 3.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m3.08-3.08l4.24-4.24" />
    </svg>
  );
}

function EmptyBoxIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">
      <path d="M6 9h12M6 9l1.05-4.2A2 2 0 0 1 9 3h6a2 2 0 0 1 1.95 1.8L18 9M6 9v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" />
      <path d="M10 5v.01M14 5v.01" />
    </svg>
  );
}