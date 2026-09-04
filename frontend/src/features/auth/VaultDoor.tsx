import { useRef, useState } from "react";

export function VaultDoor() {
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
      setTilt({ x: py * -10, y: px * 12 });
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative grid h-72 w-72 place-items-center"
      style={{ perspective: "1400px" }}
    >
      <div
        className="relative h-64 w-64"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 220ms ease-out",
        }}
      >
        {/* door body */}
        <div
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderColor: "var(--steel-line)",
            background: "radial-gradient(circle at 30% 25%, var(--steel), var(--obsidian) 70%)",
            transform: "translateZ(0px)",
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
          }}
        />
        {/* bolt ring, slow ambient spin */}
        <div
          className="absolute inset-6 rounded-full border-2 border-dashed"
          style={{
            borderColor: "var(--brass)",
            opacity: 0.55,
            transform: "translateZ(20px)",
            animation: "core-idle-spin 40s linear infinite",
          }}
        />
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-3 w-3 rounded-full"
            style={{
              background: "var(--brass)",
              top: "50%",
              left: "50%",
              transform: `translateZ(30px) rotate(${i * 45}deg) translate(92px) translate(-6px,-6px)`,
              boxShadow: "0 0 10px 1px rgba(201,150,60,0.4)",
            }}
          />
        ))}
        {/* center wheel */}
        <div
          className="absolute inset-20 grid place-items-center rounded-full border-2"
          style={{
            borderColor: "var(--brass)",
            background: "radial-gradient(circle at 35% 30%, #2a2011, var(--obsidian) 75%)",
            transform: "translateZ(45px)",
            boxShadow: "0 0 30px 4px rgba(201,150,60,0.25)",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--brass-glow)" strokeWidth="2">
            <circle cx="12" cy="8" r="3.2" />
            <path d="M12 11.2 9.5 20h5L12 11.2Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
