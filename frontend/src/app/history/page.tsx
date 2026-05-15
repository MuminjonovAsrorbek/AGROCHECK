"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { apiFetch } from "@/lib/api";

interface ScanItem { id: string; plant: string; disease_name: string; confidence: number; severity: string; is_healthy: boolean; created_at: string; image_url: string; }

const STATUS_META = {
  healthy: { fg: "#0a3d2e", bg: "rgba(10,61,46,.06)", dot: "#1f8a5b", label: "Sog'lom" },
  moderate: { fg: "#8a6610", bg: "rgba(212,160,23,.10)", dot: "#d4a017", label: "O'rta" },
  severe: { fg: "#b91c1c", bg: "rgba(185,28,28,.08)", dot: "#dc2626", label: "Og'ir" },
};

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const param = filter === "all" ? "" : `?status=${filter}`;
    apiFetch<ScanItem[]>(`/api/scans/${param}`).then(data => { setScans(data); setLoading(false); }).catch(console.error);
  }, [filter]);

  return (
    <Shell title="Tarix" breadcrumb="Bosh sahifa · Tarix">
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1280 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ k: "all", label: "Hammasi" }, { k: "healthy", label: "Sog'lom" }, { k: "diseased", label: "Kasallangan" }].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: "8px 14px", borderRadius: 999, cursor: "pointer", background: filter === f.k ? "var(--primary)" : "transparent", color: filter === f.k ? "#fff" : "var(--ink-2)", border: `1px solid ${filter === f.k ? "var(--primary)" : "var(--line)"}`, fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500 }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: "var(--muted)", padding: 40, textAlign: "center" }}>Yuklanmoqda…</div>
        ) : scans.length === 0 ? (
          <div style={{ padding: 60, borderRadius: 16, background: "#fff", border: "1px dashed var(--line)", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>Hech narsa topilmadi</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Filtrlarni o&apos;zgartirib ko&apos;ring</div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--line)", overflow: "hidden" }}>
            {scans.map((scan, i) => {
              const s = STATUS_META[scan.is_healthy ? "healthy" : scan.severity === "severe" ? "severe" : "moderate"];
              return (
                <Link key={scan.id} href={`/scan/${scan.id}`} style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 90px 40px", alignItems: "center", gap: 16, padding: "14px 16px", borderBottom: i < scans.length - 1 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", background: "#0a3d2e", flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={scan.image_url} alt={scan.plant} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{scan.plant}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{scan.disease_name}</div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 6, background: s.bg, color: s.fg, fontSize: 11, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".06em", width: "fit-content" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />{s.label}
                  </span>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                    {new Date(scan.created_at).toLocaleDateString("uz-UZ")}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8"><path d="M9 5l7 7-7 7"/></svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
