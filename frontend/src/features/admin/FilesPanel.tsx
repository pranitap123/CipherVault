import type { AdminFile } from "../../types";
import { formatBytes, formatDate, fileKind } from "../../lib/format";

export function FilesPanel({
  files,
  onDelete,
}: {
  files: AdminFile[];
  onDelete: (fileId: string) => void;
}) {
  if (files.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm" style={{ color: "var(--mist-faint)" }}>
        No files in the vault yet.
      </p>
    );
  }

  return (
    <ul className="divide-y" style={{ borderColor: "var(--steel-line)" }}>
      {files.map((f) => (
        <li key={f.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm" style={{ color: "var(--mist)" }}>
              {f.originalFilename}
            </div>
            <div className="font-mono text-xs" style={{ color: "var(--mist-faint)" }}>
              {fileKind(f.mimeType)} · {formatBytes(f.sizeBytes)} · owner {f.ownerId.slice(0, 8)}… · {formatDate(f.createdAt)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDelete(f.id)}
            className="focusable shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            style={{ borderColor: "var(--steel-line)", color: "var(--copper)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(209,97,74,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
