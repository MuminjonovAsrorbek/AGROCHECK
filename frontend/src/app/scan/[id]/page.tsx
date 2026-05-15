"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

interface Prediction { name: string; latin: string | null; confidence: number; }
interface ScanResult {
  id: string; plant: string; disease_name: string; disease_latin: string | null;
  confidence: number; severity: string; is_healthy: boolean;
  predictions: Prediction[]; image_url: string; created_at: string;
}

const TREATMENT_STEPS: Record<string, string[]> = {
  "Early Blight": [
    "Zararlangan barglarni darhol kesib oling va yoqib yuboring.",
    "Mis-sulfat (1%) bilan har 7–10 kunda 2–3 marta sepish kerak.",
    "Sug'orishni ildiz ostidan amalga oshiring — yaproqlarni ho'l qilmang.",
    "Almashlab ekishni qo'llang: 3 yil davomida bir joyga pomidor ekmang.",
  ],
};

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ScanResult>(`/api/scans/${id}`)
      .then(setScan)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <Shell title="Xato" breadcrumb="Tahlil · Natija"><p style={{ color: "#b91c1c" }}>{error}</p></Shell>;
  if (!scan) return <Shell title="Yuklanmoqda…" breadcrumb="Tahlil · Natija"><div /></Shell>;

  const treatment = TREATMENT_STEPS[scan.disease_name] ?? ["Mutaxassisga murojaat qiling."];
  const r = scan.confidence / 100;
  const circumference = 2 * Math.PI * 30;

  return (
    <Shell title="Tahlil natijasi" breadcrumb="Tahlil · Natija">
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 24, maxWidth: 1300 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 22, overflow: "hidden", background: "linear-gradient(155deg,#0a3d2e,#06291a)", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={scan.image_url} alt="scan" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(0,0,0,.5)", backdropFilter: "blur(10px)", padding: "10px 14px", borderRadius: 12, color: "#fff" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "rgba(255,255,255,.5)", textTransform: "uppercase" }}>Aniqlangan kasallik</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 2 }}>{scan.disease_name}</div>
            </div>
            <div style={{ position: "absolute", bottom: 16, right: 16, background: "var(--accent)", color: "#1a1305", padding: "10px 16px", borderRadius: 12, fontFamily: "var(--mono)", fontWeight: 700 }}>{scan.confidence}%</div>
          </div>

          <div style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--line)", padding: 22 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600 }}>Boshqa ehtimoliy variantlar</h3>
            {scan.predictions.map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr 56px", gap: 14, alignItems: "center", padding: i === 0 ? "8px 12px" : "4px 12px", borderRadius: 10, background: i === 0 ? "var(--primary-soft)" : "transparent", marginBottom: 4 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: i === 0 ? 600 : 500, color: i === 0 ? "var(--primary)" : "var(--ink)" }}>{p.name}</div>
                  {p.latin && <div style={{ fontSize: 11, fontStyle: "italic", color: "var(--muted)" }}>{p.latin}</div>}
                </div>
                <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${p.confidence}%`, height: "100%", background: i === 0 ? "var(--primary)" : "var(--accent)", borderRadius: 3 }} />
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, textAlign: "right", color: i === 0 ? "var(--primary)" : "var(--muted)" }}>{p.confidence}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--line)", padding: 22 }}>
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 30, letterSpacing: "-0.02em" }}>{scan.plant} · {scan.disease_name}</h2>
                {scan.disease_latin && <div style={{ marginTop: 4, fontStyle: "italic", color: "var(--muted)", fontSize: 13 }}>{scan.disease_latin}</div>}
              </div>
              <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="var(--line)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - r * circumference} transform="rotate(-90 40 40)" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--primary)", letterSpacing: "-0.02em" }}>{scan.confidence}%</div>
                  <div style={{ fontSize: 8, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", marginTop: 1 }}>conf.</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--line)", padding: 22 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600 }}>Davolash bo&apos;yicha tavsiyalar</h3>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {treatment.map((s, i) => (
                <li key={i} style={{ display: "flex", gap: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600 }}>{String(i + 1).padStart(2, "0")}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink-2)", flex: 1 }}>{s}</div>
                </li>
              ))}
            </ol>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/scan" style={{ flex: 1, height: 48, borderRadius: 12, background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>Yana tahlil</Link>
            <button style={{ flex: 1, height: 48, borderRadius: 12, border: "1px solid var(--line-strong)", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Mutaxassisga yo&apos;llash</button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
