import { CONDITIONS, type ToothCondition, type ToothRecord } from "@/lib/store";
import { cn } from "@/lib/utils";

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const PRIMARY_UPPER = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
const PRIMARY_LOWER = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

const UNI: Record<number, string> = {};
UPPER.forEach((n, i) => { UNI[n] = String(i + 1); });
[38, 37, 36, 35, 34, 33, 32, 31, 41, 42, 43, 44, 45, 46, 47, 48].forEach((n, i) => { UNI[n] = String(i + 17); });
PRIMARY_UPPER.forEach((n, i) => { UNI[n] = String.fromCharCode(65 + i); });
[75, 74, 73, 72, 71, 81, 82, 83, 84, 85].forEach((n, i) => { UNI[n] = String.fromCharCode(75 + i); });

const FILL: Record<ToothCondition, string> = {
  Healthy: "#F7F3EA",
  Caries: "#E7B4B4",
  Filling: "#C5D9D4",
  Crown: "#E6D3B0",
  "Root Canal": "#E8D09A",
  Implant: "#B7C9C7",
  Missing: "transparent",
  "Extraction Planned": "#E7C7B6",
};

function kind(n: number) {
  const d = n % 10;
  const primary = n >= 50;
  if (d <= 2) return "incisor";
  if (d === 3) return "canine";
  if (!primary && (d === 4 || d === 5)) return "premolar";
  return "molar";
}

const CROWN: Record<string, string> = {
  incisor: "M9 28c0-14 4.2-20 11-20s11 6 11 20c0 6-2 10-4.2 12.2C24.4 43 22 44.2 20 44.2s-4.4-1.2-6.8-4C11 38 9 34 9 28z",
  canine: "M10 30C10 14 15 5 20 5s10 9 10 25c0 6-1.8 10-4 12.2-1.8 1.8-3.2 2.6-6 2.6s-4.2-.8-6-2.6C11.8 40 10 36 10 30z",
  premolar: "M5 28c0-13 3-20 8.2-20 2.2 0 3.2 2.2 6.8 2.2s4.6-2.2 6.8-2.2C32 8 35 15 35 28c0 7-2 12-5.2 14.6-2 1.8-4.6 2.6-9.8 2.6s-7.8-.8-9.8-2.6C7 40 5 35 5 28z",
  molar: "M3 28C3 15 5.2 8 11 8c2.6 0 3.6 3 9 3s6.4-3 9-3c5.8 0 8 7 8 20 0 8-2.2 14-6.4 16.8C28.2 47 25.4 48 20 48s-8.2-1-10.6-3.2C5.2 42 3 36 3 28z",
};

function Roots({ k }: { k: string }) {
  if (k === "molar") {
    return <path d="M10 22c-1 10-1 20 1 26M20 20v28M30 22c1 10 1 20-1 26" fill="none" stroke="#9aa8a4" strokeWidth="1.6" strokeLinecap="round" />;
  }
  if (k === "premolar") {
    return <path d="M14 24c-1 12 0 22 2 26M26 24c1 12 0 22-2 26" fill="none" stroke="#9aa8a4" strokeWidth="1.6" strokeLinecap="round" />;
  }
  return <path d="M20 24v28" fill="none" stroke="#9aa8a4" strokeWidth="1.8" strokeLinecap="round" />;
}

function Tooth({
  n, x, y, lower, chart, selected, numbering, onSelect,
}: {
  n: number; x: number; y: number; lower?: boolean;
  chart: Record<number, ToothRecord | undefined>;
  selected: boolean; numbering: "fdi" | "universal";
  onSelect: (n: number) => void;
}) {
  const rec = chart[n];
  const condition = rec?.condition ?? "Healthy";
  const k = kind(n);
  const label = numbering === "universal" ? (UNI[n] ?? String(n)) : String(n);
  const missing = condition === "Missing";
  return (
    <g
      transform={`translate(${x} ${y})`}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={`Tooth ${label}, ${condition}${rec?.surfaces?.length ? `, surfaces ${rec.surfaces.join(" ")}` : ""}`}
      className="cursor-pointer outline-none"
      onClick={() => onSelect(n)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(n); } }}
    >
      <rect x={-4} y={lower ? -8 : 0} width={48} height={78} fill="transparent" />
      <g transform={lower ? "translate(0 62) scale(1 -1)" : undefined}>
        <Roots k={k} />
        <path
          d={CROWN[k]}
          fill={FILL[condition]}
          stroke={selected ? "#C6A77B" : "#173D3B"}
          strokeWidth={selected ? 2 : 1.15}
          strokeDasharray={missing ? "3 2" : undefined}
          opacity={missing ? 0.55 : 1}
        />
      </g>
      <text
        x={20}
        y={lower ? 76 : -2}
        textAnchor="middle"
        className="fill-muted-foreground"
        style={{ fontSize: 9, fontFamily: "Manrope, sans-serif" }}
      >
        {label}
      </text>
    </g>
  );
}

function archY(i: number, count: number, upper: boolean) {
  const mid = (count - 1) / 2;
  const dist = Math.abs(i - mid) / mid;
  const curve = dist * dist * 16;
  return upper ? 20 - curve : curve;
}

export function Odontogram({
  chart, selected, onSelect, dentition, numbering,
}: {
  chart: Record<number, ToothRecord | undefined>;
  selected: number | null;
  onSelect: (n: number) => void;
  dentition: "permanent" | "primary";
  numbering: "fdi" | "universal";
}) {
  const upper = dentition === "permanent" ? UPPER : PRIMARY_UPPER;
  const lower = dentition === "permanent" ? LOWER : PRIMARY_LOWER;
  const slot = dentition === "permanent" ? 52 : 64;
  const width = Math.max(upper.length, lower.length) * slot + 36;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} 250`} className="h-auto w-full min-w-[680px]" role="group" aria-label="Dental chart">
        {upper.map((n, i) => (
          <Tooth key={n} n={n} x={18 + i * slot} y={archY(i, upper.length, true)} chart={chart} selected={selected === n} numbering={numbering} onSelect={onSelect} />
        ))}
        <line x1={24} x2={width - 24} y1={124} y2={124} stroke="#E6EAE7" strokeDasharray="2 4" />
        {lower.map((n, i) => (
          <Tooth key={n} n={n} x={18 + i * slot} y={132 + archY(i, lower.length, false)} lower chart={chart} selected={selected === n} numbering={numbering} onSelect={onSelect} />
        ))}
      </svg>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {CONDITIONS.map((c) => (
          <li key={c} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-sm border", c === "Missing" && "border-dashed")} style={{ background: FILL[c], borderColor: "#173D3B" }} />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
