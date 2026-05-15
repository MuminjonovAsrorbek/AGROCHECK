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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [range, setRange] = useState(30);

  useEffect(() => {
    apiFetch<Stats>(`/api/stats/?range=${range}`).then(setStats).catch(console.error);
  }, [range]);

  if (!stats) return <Shell title="Statistika" breadcrumb="Bosh sahifa · Statistika"><div style={{ color: "var(--muted)" }}>Yuklanmoqda…</div></Shell>;

  const kpis = [
    { label: "Jami tahlillar", value: stats.all_time_total.toString(), change: `+${stats.total}` },
    { label: "Bu oyda", value: stats.scan_count_month.toString(), hint: stats.plan_limit ? `/ ${stats.plan_limit}` : "∞" },
    { label: "Sog'lom natija", value: stats.total ? `${Math.round((stats.healthy / stats.total) * 100)}%` : "—" },
    { label: "O'rta ishonch", value: stats.avg_confidence ? `${stats.avg_confidence}%` : "—" },
  ];

  const trendEntries = Object.entries(stats.trend).sort(([a], [b]) => a.localeCompare(b)).slice(-14);
  const maxVal = Math.max(...trendEntries.map(([, v]) => v.total), 1);

  return (
    <Shell title="Statistika" breadcrumb="Bosh sahifa · Statistika">
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1280 }}>
        <div style={{ display: "flex", gap: 0, background: "#fff", border: "1px solid var(--line)", borderRadius: 10, width: "fit-content", padding: 3 }}>
          {[7, 30, 90, 365].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{ padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: range === r ? "var(--primary)" : "transparent", color: range === r ? "#fff" : "var(--muted)", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500, transition: "all .15s" }}>
              {r === 365 ? "Bu yil" : `${r} kun`}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--line)", padding: 18 }}>
              <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".10em" }}>{k.label}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 8 }}>{k.value}</div>
              {(k.change || k.hint) && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>{k.change ?? k.hint}</div>}
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--line)", padding: 22 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>Tahlillar tendensiyasi</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
            {trendEntries.map(([day, v]) => (
              <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", height: `${(v.total / maxVal) * 100}px`, background: "var(--primary)", borderRadius: "4px 4px 0 0", minHeight: 4 }} />
                <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--muted)", transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>{day.slice(5)}</div>
              </div>
            ))}
          </div>
        </div>

        {stats.disease_distribution.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid var(--line)", padding: 22 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>Eng ko&apos;p uchragan kasalliklar</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.disease_distribution.slice(0, 6).map((d, i) => {
                const maxCount = stats.disease_distribution[0]?.count ?? 1;
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 1fr 40px", gap: 14, alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                    <div style={{ height: 8, background: "var(--line)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${(d.count / maxCount) * 100}%`, height: "100%", background: "var(--primary)", borderRadius: 4 }} />
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", textAlign: "right" }}>{d.count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
