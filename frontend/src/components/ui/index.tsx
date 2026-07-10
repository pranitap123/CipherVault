import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

// --- Button ---
type Variant = "primary" | "ghost" | "danger" | "subtle";
export function Button({
  variant = "primary",
  loading,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
}) {
  const base =
    "focusable inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles: Record<Variant, string> = {
    primary: "bg-accent hover:bg-accent-hover text-white",
    ghost: "bg-transparent hover:bg-base-800 text-ink-muted hover:text-ink",
    danger: "bg-danger/90 hover:bg-danger text-white",
    subtle: "bg-base-800 hover:bg-base-700 text-ink",
  };
  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

// --- Input ---
export function Field({
  label,
  error,
  hint,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-muted">{label}</span>
      <input
        className={`focusable w-full rounded-lg border bg-base-850 px-3 py-2 text-sm text-ink placeholder:text-ink-faint ${
          error ? "border-danger" : "border-line"
        }`}
        {...rest}
      />
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-faint">{hint}</span>
      ) : null}
    </label>
  );
}

// --- Spinner ---
export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// --- Toast system ---
type Toast = { id: string; kind: "ok" | "error"; text: string };
const ToastCtx = createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`card px-4 py-3 text-sm shadow-lg ${
              t.kind === "error" ? "border-danger/50 text-danger" : "border-ok/50 text-ok"
            }`}
            role="status"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// --- Empty state ---
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2 4 6v6c0 5 3.5 7.5 8 10 4.5-2.5 8-5 8-10V6l-8-4Z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink-muted">{body}</p>
      {action}
    </div>
  );
}
