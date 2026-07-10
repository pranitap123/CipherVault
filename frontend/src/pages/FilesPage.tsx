import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import type { VaultFile } from "../types";
import { formatBytes, formatDate, fileKind } from "../lib/format";
import { UploadZone } from "../features/upload/UploadZone";
import { Button, EmptyState, Spinner, useToast } from "../components/ui";

type View = "grid" | "list";

export function FilesPage() {
  const { push } = useToast();
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [view, setView] = useState<View>("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<VaultFile | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await api.listFiles();
    setLoading(false);
    if (res.ok) setFiles(res.data);
    else push({ kind: "error", text: res.error.message });
  };

  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => {
    let out = files;
    if (favoritesOnly) out = out.filter((f) => f.favorite);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((f) => f.name.toLowerCase().includes(q));
    }
    return out;
  }, [files, search, favoritesOnly]);

  const toggleSelect = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const onUploaded = (f: VaultFile) => setFiles((prev) => [f, ...prev]);

  const remove = async (ids: string[]) => {
    for (const id of ids) {
      const res = await api.deleteFile(id);
      if (!res.ok) { push({ kind: "error", text: res.error.message }); return; }
    }
    setFiles((prev) => prev.filter((f) => !ids.includes(f.id)));
    setSelected(new Set());
    if (active && ids.includes(active.id)) setActive(null);
    push({ kind: "ok", text: `Deleted ${ids.length} file${ids.length > 1 ? "s" : ""}.` });
  };

  const favorite = async (id: string) => {
    const res = await api.toggleFavorite(id);
    if (res.ok) {
      setFiles((prev) => prev.map((f) => (f.id === id ? res.data : f)));
      if (active?.id === id) setActive(res.data);
    }
  };

  const download = async (id: string) => {
    const res = await api.getDownloadUrl(id);
    if (res.ok) push({ kind: "ok", text: "Download link ready (mock)." });
    else push({ kind: "error", text: res.error.message });
  };

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Files</h1>
        </div>

        <UploadZone onUploaded={onUploaded} />

        {/* Toolbar */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files"
              className="focusable w-full rounded-lg border border-line bg-base-850 py-2 pl-9 pr-3 text-sm placeholder:text-ink-faint"
            />
          </div>
          <Button variant={favoritesOnly ? "primary" : "subtle"} onClick={() => setFavoritesOnly((v) => !v)}>
            Favorites
          </Button>
          <div className="flex overflow-hidden rounded-lg border border-line">
            <button
              className={`focusable px-3 py-2 ${view === "grid" ? "bg-base-700 text-ink" : "text-ink-muted hover:bg-base-800"}`}
              onClick={() => setView("grid")}
              aria-label="Grid view"
            ><GridIcon /></button>
            <button
              className={`focusable px-3 py-2 ${view === "list" ? "bg-base-700 text-ink" : "text-ink-muted hover:bg-base-800"}`}
              onClick={() => setView("list")}
              aria-label="List view"
            ><ListIcon /></button>
          </div>
        </div>

        {/* Selection bar */}
        {selected.size > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-accent/40 bg-accent-soft/40 px-4 py-2 text-sm">
            <span>{selected.size} selected</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
              <Button variant="danger" onClick={() => remove([...selected])}>Delete</Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center py-16 text-ink-muted"><Spinner /></div>
          ) : visible.length === 0 ? (
            <EmptyState
              title={search || favoritesOnly ? "No matching files" : "Your vault is empty"}
              body={
                search || favoritesOnly
                  ? "Try a different search, or clear your filters."
                  : "Drop a file above to store it encrypted. Only you can read it back."
              }
            />
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visible.map((f) => (
                <FileCard
                  key={f.id}
                  file={f}
                  selected={selected.has(f.id)}
                  onSelect={() => toggleSelect(f.id)}
                  onOpen={() => setActive(f)}
                  onFavorite={() => favorite(f.id)}
                />
              ))}
            </div>
          ) : (
            <FileTable
              files={visible}
              selected={selected}
              onToggle={toggleSelect}
              onOpen={setActive}
              onFavorite={favorite}
            />
          )}
        </div>
      </div>

      {/* Metadata panel */}
      {active && (
        <MetadataPanel
          file={active}
          onClose={() => setActive(null)}
          onFavorite={() => favorite(active.id)}
          onDownload={() => download(active.id)}
          onDelete={() => remove([active.id])}
        />
      )}
    </div>
  );
}

function FileCard({ file, selected, onSelect, onOpen, onFavorite }: {
  file: VaultFile; selected: boolean; onSelect: () => void; onOpen: () => void; onFavorite: () => void;
}) {
  return (
    <div className={`card group relative p-4 transition-colors hover:border-base-600 ${selected ? "ring-2 ring-accent" : ""}`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={onSelect}
        className="absolute left-3 top-3 h-4 w-4 accent-accent opacity-0 transition-opacity group-hover:opacity-100 checked:opacity-100"
        aria-label={`Select ${file.name}`}
      />
      <button onClick={onFavorite} className="focusable absolute right-3 top-3 text-ink-faint hover:text-warn" aria-label="Toggle favorite">
        <StarIcon filled={file.favorite} />
      </button>
      <button onClick={onOpen} className="focusable mt-3 flex w-full flex-col items-center gap-3 text-center">
        <FileGlyph mime={file.mimeType} />
        <span className="line-clamp-2 break-all text-sm text-ink">{file.name}</span>
      </button>
      <div className="mt-3 flex items-center justify-between text-xs text-ink-faint">
        <span>{formatBytes(file.sizeBytes)}</span>
        {file.encrypted && <LockBadge />}
      </div>
    </div>
  );
}

function FileTable({ files, selected, onToggle, onOpen, onFavorite }: {
  files: VaultFile[]; selected: Set<string>; onToggle: (id: string) => void; onOpen: (f: VaultFile) => void; onFavorite: (id: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-line text-left text-xs text-ink-faint">
          <tr>
            <th className="w-10 px-4 py-3"></th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Type</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Size</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Modified</th>
            <th className="w-10 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <tr key={f.id} className="border-b border-line/60 last:border-0 hover:bg-base-850/60">
              <td className="px-4 py-3">
                <input type="checkbox" checked={selected.has(f.id)} onChange={() => onToggle(f.id)} className="h-4 w-4 accent-accent" aria-label={`Select ${f.name}`} />
              </td>
              <td className="px-4 py-3">
                <button onClick={() => onOpen(f)} className="focusable flex items-center gap-2 text-left text-ink hover:text-accent">
                  <FileGlyph mime={f.mimeType} small />
                  <span className="truncate">{f.name}</span>
                </button>
              </td>
              <td className="hidden px-4 py-3 text-ink-muted sm:table-cell">{fileKind(f.mimeType)}</td>
              <td className="hidden px-4 py-3 text-ink-muted md:table-cell">{formatBytes(f.sizeBytes)}</td>
              <td className="hidden px-4 py-3 text-ink-muted lg:table-cell">{formatDate(f.updatedAt)}</td>
              <td className="px-4 py-3">
                <button onClick={() => onFavorite(f.id)} className="focusable text-ink-faint hover:text-warn" aria-label="Toggle favorite">
                  <StarIcon filled={f.favorite} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetadataPanel({ file, onClose, onFavorite, onDownload, onDelete }: {
  file: VaultFile; onClose: () => void; onFavorite: () => void; onDownload: () => void; onDelete: () => void;
}) {
  const isImage = file.mimeType.startsWith("image/");
  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="card sticky top-24 p-5">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-sm font-semibold text-ink">Details</h2>
          <button onClick={onClose} className="focusable text-ink-faint hover:text-ink" aria-label="Close details">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18"/></svg>
          </button>
        </div>
        <div className="mb-4 grid place-items-center rounded-lg bg-base-850 py-8">
          {isImage ? (
            <div className="text-center text-xs text-ink-faint">
              <FileGlyph mime={file.mimeType} />
              <p className="mt-2">Preview available after download</p>
            </div>
          ) : (
            <FileGlyph mime={file.mimeType} />
          )}
        </div>
        <p className="break-all text-sm font-medium text-ink">{file.name}</p>
        <dl className="mt-4 space-y-2 text-xs">
          <Row k="Type" v={fileKind(file.mimeType)} />
          <Row k="Size" v={formatBytes(file.sizeBytes)} />
          <Row k="Encrypted" v={file.encrypted ? "AES-256 at rest" : "No"} />
          <Row k="Added" v={formatDate(file.createdAt)} />
          <Row k="Modified" v={formatDate(file.updatedAt)} />
        </dl>
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={onDownload}>Download</Button>
          <Button variant="subtle" onClick={onFavorite}>
            {file.favorite ? "Remove favorite" : "Add to favorites"}
          </Button>
          <Button variant="ghost" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </aside>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-ink-faint">{k}</dt>
      <dd className="text-right text-ink-muted">{v}</dd>
    </div>
  );
}

// --- glyphs ---
function FileGlyph({ mime, small }: { mime: string; small?: boolean }) {
  const size = small ? 18 : 30;
  const color = mime.startsWith("image/") ? "text-accent"
    : mime === "application/pdf" ? "text-danger"
    : mime.startsWith("text/") || mime.includes("markdown") ? "text-ok"
    : "text-ink-muted";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={color}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
function LockBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-ok" title="Encrypted at rest">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
    </span>
  );
}
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={filled ? "text-warn" : ""}>
      <path d="m12 2 3 6.5 7 .6-5.2 4.6 1.5 7L12 17l-6.3 3.7 1.5-7L2 9.1l7-.6L12 2Z" />
    </svg>
  );
}
function SearchIcon() {
  return <svg className="pointer-events-none absolute left-3 top-2.5 text-ink-faint" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
}
function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function ListIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
}
