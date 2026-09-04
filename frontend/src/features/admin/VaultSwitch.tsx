import { useState } from "react";

export function VaultSwitch({
  role,
  disabled,
  onChange,
}: {
  role: "USER" | "ADMIN";
  disabled?: boolean;
  onChange: (next: "USER" | "ADMIN") => Promise<void> | void;
}) {
  const [pending, setPending] = useState(false);
  const isAdmin = role === "ADMIN";

  const flip = async () => {
    if (disabled || pending) return;
    setPending(true);
    await onChange(isAdmin ? "USER" : "ADMIN");
    setPending(false);
  };

  return (
    <button
      type="button"
      onClick={flip}
      disabled={disabled || pending}
      aria-pressed={isAdmin}
      aria-label={`Toggle role, currently ${role}`}
      className="focusable group relative h-9 w-[92px] shrink-0 rounded-full border transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        perspective: "300px",
        borderColor: "var(--steel-line)",
        background: isAdmin ? "rgba(201,150,60,0.12)" : "var(--steel)",
      }}
    >
      {/* track labels */}
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-between px-2.5 font-mono text-[10px] uppercase tracking-wide"
        style={{ color: "var(--mist-faint)" }}
      >
        <span style={{ opacity: isAdmin ? 0.35 : 1 }}>user</span>
        <span style={{ opacity: isAdmin ? 1 : 0.35 }}>admin</span>
      </span>

      {/* the knob — a real 3D flip card, not a sliding div */}
      <span
        className="absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full transition-[left] duration-300 ease-out"
        style={{
          left: isAdmin ? "calc(100% - 30px)" : "3px",
          transformStyle: "preserve-3d",
        }}
      >
        <span
          className="absolute inset-0 rounded-full transition-transform duration-300"
          style={{
            transform: isAdmin ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}
        >
          {/* face 1: USER */}
          <span
            className="absolute inset-0 grid place-items-center rounded-full"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(160deg, var(--mist), #a9a49a)",
            }}
          >
            <DotIcon color="var(--obsidian)" />
          </span>
          {/* face 2: ADMIN */}
          <span
            className="absolute inset-0 grid place-items-center rounded-full"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(160deg, var(--brass-glow), var(--brass))",
            }}
          >
            <StarIcon color="var(--obsidian)" />
          </span>
        </span>
      </span>
    </button>
  );
}

function DotIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

function StarIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={color}>
      <path d="M12 2 14.5 9h7l-5.7 4.3L18 20l-6-4.3L6 20l2.2-6.7L2.5 9h7Z" />
    </svg>
  );
}
