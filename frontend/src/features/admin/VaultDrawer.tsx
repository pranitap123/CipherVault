import { useState, type ReactNode } from "react";

export function VaultDrawer({
  label,
  count,
  defaultOpen = false,
  children,
}: {
  label: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="admin-zone overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--steel-line)", background: "var(--graphite)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="focusable flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg border"
            style={{ borderColor: "var(--steel-line)", color: "var(--brass-glow)" }}
          >
            <LatchIcon open={open} />
          </span>
          <span className="font-medium" style={{ color: "var(--mist)" }}>
            {label}
          </span>
          <span
            className="rounded-full px-2 py-0.5 font-mono text-xs"
            style={{ background: "var(--steel)", color: "var(--mist-faint)" }}
          >
            {count}
          </span>
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          className="border-t px-2 pb-2"
          style={{
            borderColor: "var(--steel-line)",
            perspective: "800px",
          }}
        >
          <div
            style={{
              transformOrigin: "top",
              animation: "drawer-unfold 320ms ease-out both",
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function LatchIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{
        transition: "transform 250ms ease",
        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
      }}
    >
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--mist-faint)"
      strokeWidth="2"
      style={{
        transition: "transform 250ms ease",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
