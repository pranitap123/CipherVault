import { useRef, useState, type DragEvent } from "react";
import { api } from "../../api";
import { formatBytes } from "../../lib/format";
import { Button, Spinner } from "../../components/ui";
import type { VaultFile } from "../../types";

type QueueItem = {
  id: string;
  file: File;
  progress: number;
  state: "queued" | "uploading" | "done" | "error";
  error?: string;
};

export function UploadZone({ onUploaded }: { onUploaded: (f: VaultFile) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const patch = (id: string, p: Partial<QueueItem>) =>
    setQueue((q) => q.map((it) => (it.id === id ? { ...it, ...p } : it)));

  const runUpload = async (item: QueueItem) => {
    patch(item.id, { state: "uploading", progress: 0, error: undefined });
    const res = await api.uploadFile(item.file, (frac) =>
      patch(item.id, { progress: frac })
    );
    if (res.ok) {
      patch(item.id, { state: "done", progress: 1 });
      onUploaded(res.data);
      setTimeout(() => setQueue((q) => q.filter((x) => x.id !== item.id)), 1500);
    } else {
      patch(item.id, { state: "error", error: res.error.message });
    }
  };

  const enqueue = (files: FileList | File[]) => {
    const items: QueueItem[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      progress: 0,
      state: "queued",
    }));
    setQueue((q) => [...items, ...q]);
    items.forEach(runUpload);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) enqueue(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`focusable flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver ? "border-accent bg-accent-soft/40" : "border-line hover:border-base-600"
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <div className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 16V4m0 0 4 4m-4-4L8 8" />
            <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-ink">Drop files to upload</p>
        <p className="text-xs text-ink-faint">or click to browse · encrypted on arrival</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && enqueue(e.target.files)}
        />
      </div>

      {queue.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {queue.map((it) => (
            <li key={it.id} className="card flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-ink">{it.file.name}</span>
                  <span className="shrink-0 text-xs text-ink-faint">{formatBytes(it.file.size)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      it.state === "error" ? "bg-danger" : "bg-accent"
                    }`}
                    style={{ width: `${Math.round(it.progress * 100)}%` }}
                  />
                </div>
                {it.state === "error" && (
                  <p className="mt-1 text-xs text-danger">{it.error}</p>
                )}
              </div>
              <div className="shrink-0">
                {it.state === "uploading" && <Spinner size={16} />}
                {it.state === "done" && (
                  <span className="text-xs font-medium text-ok">Done</span>
                )}
                {it.state === "error" && (
                  <Button variant="subtle" onClick={() => runUpload(it)}>Retry</Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
