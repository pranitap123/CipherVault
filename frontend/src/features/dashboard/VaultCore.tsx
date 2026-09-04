import { useRef, useState } from "react";

export function VaultCore({
  storagePercent,
  fileCount,
  encryptionLabel = "AES-256",
}: {
  storagePercent: number;
  fileCount: number;
  encryptionLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      setTilt({ x: py * -10, y: px * 14 });
    });
  };

  // Ring fill maps directly to real storage usage — the visual is data, not decoration.
  const fillDeg = Math.max(6, Math.min(360, (storagePercent / 100) * 360));

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative overflow-hidden rounded-2xl border p-8"
      style={{
        background: "radial-gradient(120% 140% at 15% 0%, var(--graphite) 0%, var(--obsidian) 65%)",
        borderColor: "var(--steel-line)",
        perspective: "1400px",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brass) 1px, transparent 1px), linear-gradient(90deg, var(--brass) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <div className="font-mono text-xs uppercase tracking-wider" style={{ color: "var(--mist-faint)" }}>
            vault status
          </div>
          <div className="mt-1 text-2xl font-semibold" style={{ color: "var(--mist)" }}>
            {fileCount === 0 ? "Empty and ready" : `${fileCount} file${fileCount === 1 ? "" : "s"} sealed`}
          </div>
          <div className="mt-2 font-mono text-sm" style={{ color: "var(--brass-glow)" }}>
            {encryptionLabel} at rest
          </div>
        </div>

        {/* the core */}
        <div
          className="relative h-40 w-40 shrink-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 220ms ease-out",
          }}
        >
          {/* outer dashed ring, slow ambient spin */}
          <div
            className="absolute inset-0 rounded-full border border-dashed"
            style={{
              borderColor: "var(--brass)",
              opacity: 0.3,
              transform: "translateZ(-30px)",
              animation: "core-idle-spin 48s linear infinite",
            }}
          />
          {/* storage fill ring — conic gradient sized to real usage */}
          <div
            className="absolute inset-3 rounded-full"
            style={{
              transform: "translateZ(0px)",
              background: `conic-gradient(var(--brass) ${fillDeg}deg, var(--steel) ${fillDeg}deg)`,
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 10px), black calc(100% - 9px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 10px), black calc(100% - 9px))",
            }}
          />
          {/* center hub */}
          <div
            className="absolute inset-8 grid place-items-center rounded-full border-2 text-center"
            style={{
              transform: "translateZ(26px)",
              borderColor: "var(--brass)",
              background: "radial-gradient(circle at 35% 30%, #2a2011, var(--obsidian) 75%)",
              boxShadow: "0 0 20px 1px rgba(201,150,60,0.22)",
            }}
          >
            <div className="font-mono text-lg font-semibold" style={{ color: "var(--brass-glow)" }}>
              {Math.round(storagePercent)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
