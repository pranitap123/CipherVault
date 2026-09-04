import { useRef, useState } from "react";

const ORBIT_FILES = [
  { label: ".pdf", radius: 150, depth: 30, speed: 26, startDeg: 10 },
  { label: ".png", radius: 190, depth: -10, speed: 34, startDeg: 130 },
  { label: ".zip", radius: 165, depth: 50, speed: 40, startDeg: 250 },
];

export function VaultHero() {
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
      setTilt({ x: py * -8, y: px * 10 });
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative grid h-[26rem] w-full max-w-xl place-items-center"
      style={{ perspective: "1600px" }}
    >
      <div
        className="relative h-72 w-72"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 220ms ease-out",
        }}
      >
        {/* orbiting encrypted-file chips — each one a small 3D card on its own
            ring, at a different depth so they visibly pass in front of/behind
            the core as they rotate */}
        {ORBIT_FILES.map((f, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              animation: `core-idle-spin ${f.speed}s linear infinite`,
              animationDelay: `-${(f.startDeg / 360) * f.speed}s`,
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 grid h-11 w-11 place-items-center rounded-lg border font-mono text-[10px]"
              style={{
                transform: `translate(-50%,-50%) translate(${f.radius}px, 0) translateZ(${f.depth}px) rotateZ(${-f.startDeg}deg)`,
                borderColor: "var(--steel-line)",
                background: "linear-gradient(160deg, var(--steel), var(--obsidian))",
                color: "var(--brass-glow)",
                boxShadow: "0 6px 16px -4px rgba(0,0,0,0.5)",
              }}
            >
              {f.label}
            </div>
          </div>
        ))}

        {/* the vault body */}
        <div
          className="absolute inset-6 rounded-full border-2"
          style={{
            borderColor: "var(--steel-line)",
            background: "radial-gradient(circle at 30% 25%, var(--steel), var(--obsidian) 70%)",
            transform: "translateZ(0px)",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.65)",
          }}
        />
        <div
          className="absolute inset-12 rounded-full border-2 border-dashed"
          style={{
            borderColor: "var(--brass)",
            opacity: 0.5,
            transform: "translateZ(24px)",
            animation: "core-idle-spin 50s linear infinite reverse",
          }}
        />
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2.5 w-2.5 rounded-full"
            style={{
              background: "var(--brass)",
              top: "50%",
              left: "50%",
              transform: `translateZ(34px) rotate(${i * 36}deg) translate(96px) translate(-5px,-5px)`,
              boxShadow: "0 0 8px 1px rgba(201,150,60,0.4)",
            }}
          />
        ))}
        <div
          className="absolute inset-24 grid place-items-center rounded-full border-2"
          style={{
            borderColor: "var(--brass)",
            background: "radial-gradient(circle at 35% 30%, #2a2011, var(--obsidian) 75%)",
            transform: "translateZ(55px)",
            boxShadow: "0 0 36px 6px rgba(201,150,60,0.28)",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--brass-glow)" strokeWidth="2">
            <circle cx="12" cy="8" r="3.2" />
            <path d="M12 11.2 9.5 20h5L12 11.2Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
