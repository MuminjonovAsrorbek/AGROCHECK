"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { apiFetch } from "@/lib/api";

interface Stats {
  total: number; all_time_total: number; healthy: number; diseased: number;
  avg_confidence: number; scan_count_month: number; plan_limit: number | null;
  trend: Record<string, { total: number; diseased: number }>;
  disease_distribution: { name: string; count: number }[];
}

const SPARK_COLORS = ["#0a3d2e", "#d4a017", "#84cc16", "#1f8a5b"];
const SPARK_MOCK: Record<string, number[]> = {
  total:   [4, 5, 3, 6, 5, 7, 4, 8, 6, 9],
  month:   [2, 4, 3, 5, 3, 6, 4, 5, 7, 8],
  healthy: [4, 3, 5, 4, 6, 5, 4, 6, 5, 7],
  acc:     [88, 89, 90, 92, 91, 93, 94, 95, 96, 97],
};

const DONUT_COLORS = ["#0a3d2e", "#d4a017", "#84cc16", "#1f8a5b", "#b8860b", "#cdd9d3"];

const PLANT_TYPES = [
  { name: "Pomidor",   en: "Tomato",   count: 48, healthy: 18 },
  { name: "Olma",      en: "Apple",    count: 32, healthy: 11 },
  { name: "Uzum",      en: "Grape",    count: 24, healthy: 14 },
  { name: "Bodring",   en: "Cucumber", count: 18, healthy: 10 },
  { name: "Kartoshka", en: "Potato",   count: 12, healthy: 4  },
];

const WEEKDAYS = [
  { d: "Du", v: 3 }, { d: "Se", v: 5 }, { d: "Ch", v: 2 },
  { d: "Pa", v: 7 }, { d: "Ju", v: 4 }, { d: "Sh", v: 6, today: true }, { d: "Ya", v: 0 },
];

function Sparkline({ data, color = "var(--primary)", width = 80, height = 32 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${height} ${pts} ${width},${height}`;
  const safeId = color.replace(/[^a-z0-9]/gi, "");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`spark-${safeId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spark-${safeId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KpiCard({ label, value, change, up, hint, sparkData, sparkColor, accent, icon }: {
  label: string; value: string; change?: string; up?: boolean; hint?: string;
  sparkData?: number[]; sparkColor?: string; accent?: string; icon?: React.ReactNode;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--line)", padding: 18, position: "relative", overflow: "hidden" }}>
      {accent && <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${accent}, transparent 60%)`, opacity: 0.15, filter: "blur(10px)" }} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".10em" }}>
            {icon}{label}
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 8 }}>{value}</div>
          {change && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 11, color: up ? "#1f8a5b" : "#b91c1c", fontWeight: 600 }}>
              <span>{up ? "↑" : "↓"}</span>
              <span>{change}</span>
              {hint && <span style={{ color: "var(--muted)", fontWeight: 400, marginLeft: 4 }}>{hint}</span>}
            </div>
          )}
        </div>
        {sparkData && <Sparkline data={sparkData} color={sparkColor || "var(--primary)"} width={80} height={32} />}
      </div>
    </div>
  );
}

function TrendChart({ trend }: { trend: Record<string, { total: number; diseased: number }> }) {
  const entries = Object.entries(trend).sort(([a], [b]) => a.localeCompare(b)).slice(-30);
  if (entries.length < 2) return <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>Ma&apos;lumot yo&apos;q</div>;

  const W = 620, H = 200, PX = 20, PY = 24;
  const maxTotal = Math.max(...entries.map(([, v]) => v.total), 1);
  const toX = (i: number) => PX + (i / (entries.length - 1)) * (W - 2 * PX);
  const toY = (v: number) => H - PY - (v / maxTotal) * (H - 2 * PY);

  const totalPts = entries.map(([, v], i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v.total).toFixed(1)}`).join(" ");
  const diseasedPts = entries.map(([, v], i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v.diseased).toFixed(1)}`).join(" ");
  const totalArea = `${totalPts} L ${toX(entries.length - 1)} ${H - PY} L ${PX} ${H - PY} Z`;
  const diseasedArea = `${diseasedPts} L ${toX(entries.length - 1)} ${H - PY} L ${PX} ${H - PY} Z`;

  const lastX = toX(entries.length - 1);
  const lastY = toY(entries[entries.length - 1][1].total);
  const lastVal = entries[entries.length - 1][1].total;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="trend-total" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a3d2e" stopOpacity="0.16" /><stop offset="100%" stopColor="#0a3d2e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="trend-disease" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a017" stopOpacity="0.20" /><stop offset="100%" stopColor="#d4a017" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map(i => {
        const y = PY + (i / 3) * (H - 2 * PY);
        const val = Math.round(maxTotal - (i / 3) * maxTotal);
        return (
          <g key={i}>
            <line x1={PX} x2={W - PX} y1={y} y2={y} stroke="rgba(10,31,21,0.06)" strokeDasharray={i === 3 ? "0" : "3 3"} />
            <text x={PX - 6} y={y + 3} fontFamily="JetBrains Mono" fontSize="10" fill="var(--muted)" textAnchor="end">{val}</text>
          </g>
        );
      })}
      <path d={totalArea} fill="url(#trend-total)" />
      <path d={totalPts} stroke="#0a3d2e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={diseasedArea} fill="url(#trend-disease)" />
      <path d={diseasedPts} stroke="#d4a017" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
      <circle cx={lastX} cy={lastY} r="8" fill="#0a3d2e" opacity="0.12" />
      <circle cx={lastX} cy={lastY} r="4" fill="#0a3d2e" />
      <g transform={`translate(${lastX - 60}, ${lastY - 36})`}>
        <rect width="55" height="22" rx="6" fill="#0a3d2e" />
        <text x="27.5" y="14" fontFamily="JetBrains Mono" fontWeight="600" fontSize="10" fill="#fff" textAnchor="middle">{lastVal} ta</text>
      </g>
    </svg>
  );
}

function DonutChart({ data }: { data: { name: string; count: number }[] }) {
  const size = 180, thickness = 28;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12 }}>—</div>;

  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
        {data.map((d, i) => {
          const frac = d.count / total;
          const dash = c * frac;
          const el = (
            <circle key={i} cx="0" cy="0" r={r} fill="none" stroke={DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth={thickness} strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset} strokeLinecap="butt" />
          );
          offset += dash;
          return el;
        })}
      </g>
      <text x={size / 2} y={size / 2 - 2} fontFamily="Instrument Serif" fontSize="34" fill="var(--ink)" textAnchor="middle" letterSpacing="-0.02em">{total}</text>
      <text x={size / 2} y={size / 2 + 18} fontFamily="JetBrains Mono" fontSize="10" fill="var(--muted)" textAnchor="middle" letterSpacing="0.10em">SCANS</text>
    </svg>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--line)", padding: 22, display: "flex", flexDirection: "column", gap: 14, ...style }}>{children}</div>;
}

function CardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div>
        <h3 style={{ margin: 0, fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{title}</h3>
        {subtitle && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

function LegendDot({ color, label, solid }: { color: string; label: string; solid?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".08em", color: "var(--muted)" }}>
      {solid
        ? <span style={{ width: 10, height: 3, background: color, borderRadius: 2 }} />
        : <span style={{ width: 10, height: 0, borderTop: `2px dashed ${color}`, display: "inline-block" }} />
      }
      {label}
    </span>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [range, setRange] = useState(30);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    apiFetch<Stats>(`/api/stats/?range=${range}`).then(setStats).catch(console.error);
  }, [range]);

  const RANGE_LABELS: Record<string, string> = { "7": "7 kun", "30": "30 kun", "90": "3 oy", "365": "Bu yil" };

  const rangePicker = (
    <div style={{ display: "inline-flex", padding: 3, borderRadius: 10, background: "#fff", border: "1px solid var(--line)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".04em" }}>
      {(["7", "30", "90", "365"] as const).map(k => (
        <button key={k} onClick={() => setRange(Number(k))} style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: range === Number(k) ? "var(--primary)" : "transparent", color: range === Number(k) ? "#fff" : "var(--muted)", fontFamily: "inherit", fontSize: "inherit", fontWeight: 500, transition: "all .15s" }}>
          {RANGE_LABELS[k]}
        </button>
      ))}
    </div>
  );

  if (!stats) return (
    <Shell title="Statistika" breadcrumb="Bosh sahifa · Statistika">
      <div style={{ color: "var(--muted)", padding: 40, textAlign: "center" }}>Yuklanmoqda…</div>
    </Shell>
  );

  const healthyPct = stats.total ? Math.round((stats.healthy / stats.total) * 100) : 0;
  const prevHealthyPct = Math.max(0, healthyPct + 4);

  const kpis = [
    {
      label: "Jami tahlillar", value: String(stats.all_time_total), change: "+12%", up: true,
      hint: "o'tgan oyga nisbatan", sparkData: SPARK_MOCK.total, sparkColor: "#0a3d2e", accent: "#0a3d2e",
      icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3M7 12h10" /></svg>
    },
    {
      label: "Bu oyda", value: String(stats.scan_count_month), change: "+8", up: true,
      hint: "o'tgan oyga nisbatan", sparkData: SPARK_MOCK.month, sparkColor: "#d4a017", accent: "#d4a017",
      icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
    },
    {
      label: "Sog'lom natija", value: `${healthyPct}%`, change: `-${Math.abs(healthyPct - prevHealthyPct)}%`, up: false,
      hint: "o'tgan oyga nisbatan", sparkData: SPARK_MOCK.healthy, sparkColor: "#84cc16", accent: "#84cc16",
      icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c1-3.5 6-5 6-11a6 6 0 1 0-12 0c0 6 5 7.5 6 11Z" /></svg>
    },
    {
      label: "O'rta ishonch", value: stats.avg_confidence ? `${stats.avg_confidence.toFixed(1)}%` : "—",
      change: "+1.1%", up: true, hint: "o'tgan oyga nisbatan",
      sparkData: SPARK_MOCK.acc, sparkColor: "#1f8a5b", accent: "#1f8a5b",
      icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 7-7" /><path d="M14 8h6v6" /></svg>
    },
  ];

  const dailyAvg = stats.total ? (stats.total / Math.max(Object.keys(stats.trend).length, 1)).toFixed(1) : "0";
  const peakDay = stats.total ? Math.max(...Object.values(stats.trend).map(v => v.total)) : 0;

  return (
    <Shell
      title="Statistika"
      breadcrumb="Bosh sahifa · Statistika"
      rightSlot={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {rangePicker}
          <button style={{ height: 40, padding: "0 14px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Eksport
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 14 }}>
          {kpis.map((k, i) => (
            <KpiCard key={i} label={k.label} value={k.value} change={k.change} up={k.up} hint={k.hint} sparkData={k.sparkData} sparkColor={k.sparkColor} accent={k.accent} icon={k.icon} />
          ))}
        </div>

        {/* Trend + Donut */}
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.4fr 1fr", gap: 14 }}>
          <Card>
            <CardHeader
              title="Tahlillar tendensiyasi"
              subtitle={`So'nggi ${range} kun · kunlik`}
              right={
                <div style={{ display: "flex", gap: 14 }}>
                  <LegendDot color="#0a3d2e" label="Jami" solid />
                  <LegendDot color="#d4a017" label="Kasal" />
                </div>
              }
            />
            <div style={{ padding: "0 6px" }}>
              <TrendChart trend={stats.trend} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
              {[
                { label: "O'rtacha kunlik", value: dailyAvg },
                { label: "Peak kun", value: String(peakDay) },
                { label: "Sog'lom %", value: `${healthyPct}%` },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{m.label}</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 22, letterSpacing: "-0.02em", marginTop: 2 }}>{m.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Eng ko'p uchragan kasalliklar"
              subtitle={`Bu oyda · ${stats.total} ta tahlildan`}
              right={<a href="#" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>Barchasini ko&apos;rish</a>}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <DonutChart data={stats.disease_distribution} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                {stats.disease_distribution.slice(0, 6).map((d, i) => {
                  const total = stats.disease_distribution.reduce((s, x) => s + x.count, 0);
                  const pct = total ? Math.round((d.count / total) * 100) : 0;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
                      <span style={{ flex: 1, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                      <span style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 11 }}>{pct}%</span>
                    </div>
                  );
                })}
                {stats.disease_distribution.length === 0 && <div style={{ color: "var(--muted)", fontSize: 13 }}>Ma&apos;lumot yo&apos;q</div>}
              </div>
            </div>
          </Card>
        </div>

        {/* Plant types + Activity */}
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.3fr 1fr", gap: 14 }}>
          <Card>
            <CardHeader title="O'simlik turlari" subtitle="Sog'lom va kasal nisbati" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {PLANT_TYPES.map((p, i) => {
                const hPct = (p.healthy / p.count) * 100;
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 1fr 60px", gap: 14, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#0a3d2e,#1f8a5b)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8"><path d="M12 22c1-3.5 6-5 6-11a6 6 0 1 0-12 0c0 6 5 7.5 6 11Z" /></svg>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{p.name}</div>
                    </div>
                    <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "rgba(212,160,23,0.18)" }}>
                      <div style={{ width: `${hPct}%`, background: "var(--primary)" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{p.count}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>{Math.round(hPct)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              <LegendDot color="var(--primary)" label="Sog'lom" solid />
              <LegendDot color="rgba(212,160,23,0.5)" label="Kasallangan" solid />
            </div>
          </Card>

          <Card>
            <CardHeader title="Faollik" subtitle="Bu hafta" />

            {/* Streak */}
            <div style={{ background: "linear-gradient(155deg, #0a3d2e, #06291a)", color: "#fff", borderRadius: 14, padding: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: "auto -40px -60px auto", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,160,23,0.4), transparent 60%)", filter: "blur(20px)" }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: ".10em" }}>Ketma-ket kun</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 44, letterSpacing: "-0.02em", lineHeight: 1 }}>{Math.min(stats.total, 12)}</span>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>kun</span>
                  </div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(212,160,23,0.18)", border: "1px solid rgba(212,160,23,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M14 2v6h6M7 11l3 3 7-7" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" /></svg>
                </div>
              </div>
              <div style={{ position: "relative", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>Eng uzun: 28 kun</div>
            </div>

            {/* Weekday bars */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 90, padding: "0 4px" }}>
              {WEEKDAYS.map((day, i) => {
                const h = (day.v / 7) * 70 + (day.v > 0 ? 4 : 0);
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                    <div style={{ width: 18, height: h || 4, borderRadius: 4, background: day.today ? "var(--accent)" : "var(--primary)", opacity: day.v === 0 ? 0.15 : 1, position: "relative" }}>
                      {day.v > 0 && (
                        <span style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontFamily: "var(--mono)", fontSize: 10, color: day.today ? "#8a6610" : "var(--ink)", fontWeight: 600 }}>{day.v}</span>
                      )}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: day.today ? "var(--accent)" : "var(--muted)", fontWeight: day.today ? 700 : 400, textTransform: "uppercase", letterSpacing: ".04em" }}>{day.d}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

      </div>
    </Shell>
  );
}
