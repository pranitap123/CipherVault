import { useRef, useState } from "react";

export function AccessCore({
  adminCount,
  userCount,
  viewerRole,
}: {
  adminCount: number;
  userCount: number;
  viewerRole: "USER" | "ADMIN";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      setTilt({ x: py * -14, y: px * 18 }); // rotateX, rotateY in degrees
    });
  };

  const onMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="admin-zone">
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative grid h-72 place-items-center overflow-hidden rounded-2xl border"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, var(--graphite) 0%, var(--obsidian) 70%)",
          borderColor: "var(--steel-line)",
          perspective: "1200px",
        }}
      >
        {/* ambient grid texture, purely decorative but ties to "security console" vernacular */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(var(--brass) 1px, transparent 1px), linear-gradient(90deg, var(--brass) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* the core itself */}
        <div
          className="relative h-44 w-44"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 220ms ease-out",
          }}
        >
          <Ring size={176} depth={-40} opacity={0.35} spin={54} />
          <Ring size={140} depth={-16} opacity={0.55} spin={38} reverse />
          <Ring size={104} depth={6} opacity={0.85} spin={26} />

          {/* center hub: the actual clearance readout */}
          <div
            className="absolute inset-0 grid place-items-center"
            style={{ transform: "translateZ(30px)" }}
          >
            <div
              className="grid h-24 w-24 place-items-center rounded-full border-2 text-center"
              style={{
                borderColor: "var(--brass)",
                background:
                  "radial-gradient(circle at 35% 30%, #2a2011, var(--obsidian) 75%)",
                boxShadow: "0 0 24px 2px rgba(201,150,60,0.25)",
              }}
            >
              <KeyholeIcon />
            </div>
          </div>
        </div>

        {/* readouts */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-4 font-mono text-xs"
          style={{ color: "var(--mist-faint)" }}
        >
          <Readout label="admins" value={adminCount} />
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--mist-faint)" }}>
              your clearance
            </div>
            <div
              className="font-mono text-sm font-semibold"
              style={{ color: viewerRole === "ADMIN" ? "var(--brass-glow)" : "var(--mist)" }}
            >
              {viewerRole}
            </div>
          </div>
          <Readout label="members" value={userCount} align="right" />
        </div>
      </div>
    </div>
  );
}

function Ring({
  size,
  depth,
  opacity,
  spin,
  reverse,
}: {
  size: number;
  depth: number;
  opacity: number;
  spin: number;
  reverse?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 m-auto rounded-full border"
      style={{
        width: size,
        height: size,
        borderColor: "var(--brass)",
        borderWidth: 1.5,
        opacity,
        transform: `translateZ(${depth}px)`,
        animation: `core-idle-spin ${spin}s linear infinite ${reverse ? "reverse" : ""}`,
        borderStyle: "dashed",
      }}
    />
  );
}

function Readout({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: number;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div className="text-[10px] uppercase tracking-wider">{label}</div>
      <div className="font-mono text-lg font-semibold" style={{ color: "var(--mist)" }}>
        {String(value).padStart(2, "0")}
      </div>
    </div>
  );
}

function KeyholeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--brass-glow)" strokeWidth="2">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M12 11.2 9.5 20h5L12 11.2Z" />
    </svg>
  );
}
