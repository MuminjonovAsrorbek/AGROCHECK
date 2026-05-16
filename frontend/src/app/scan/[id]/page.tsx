"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Lang = "UZ" | "EN";

interface Prediction { name: string; latin: string | null; confidence: number; }
interface ScanResult {
  id: string; plant: string; disease_name: string; disease_latin: string | null;
  confidence: number; severity: string; is_healthy: boolean;
  predictions: Prediction[]; image_url: string; created_at: string;
}

const TREATMENT_MAP: Record<string, { UZ: string[]; EN: string[] }> = {
  "Early Blight": {
    UZ: [
      "Zararlangan barglarni darhol kesib oling va yoqib yuboring — boshqa o'simliklarga yuqishini oldini oladi.",
      "Mis-sulfat (1%) yoki Bordo suyuqligi bilan har 7–10 kunda 2–3 marta sepish kerak.",
      "Sug'orishni ildiz ostidan amalga oshiring — yaproqlarni ho'l qilmang.",
      "Almashlab ekishni qo'llang: 3 yil davomida bir joyga pomidor ekmang.",
    ],
    EN: [
      "Immediately remove and burn affected leaves to stop spread to other plants.",
      "Spray with 1% copper sulfate or Bordeaux mixture every 7–10 days, 2–3 times.",
      "Water at the root only — do not wet the leaves.",
      "Rotate crops: avoid planting tomatoes in the same spot for 3 years.",
    ],
  },
};

const DEFAULT_TREATMENT = {
  UZ: ["Mutaxassisga murojaat qiling.", "Kasallikni to'g'ri aniqlash uchun agronimga ko'rsating."],
  EN: ["Consult a specialist.", "Show to an agronomist for accurate diagnosis."],
};

function LeafSample({ size = 360, showSpots = false }: { size?: number; showSpots?: boolean }) {
  return (
    <svg viewBox="0 0 400 400" width={size} height={size} style={{ display: "block" }}>
      <defs>
        <radialGradient id="leafbg2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a4d24" />
          <stop offset="100%" stopColor="#0a3d1e" />
        </radialGradient>
        <pattern id="stripes2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="#84cc16" opacity="0.18" />
          <rect x="3" width="3" height="6" fill="#84cc16" opacity="0.06" />
        </pattern>
      </defs>
      <path d="M200 30 C 100 50, 50 150, 70 270 C 90 340, 170 380, 220 370 C 310 350, 370 270, 370 170 C 370 90, 310 40, 200 30 Z" fill="url(#leafbg2)" />
      <path d="M200 30 C 100 50, 50 150, 70 270 C 90 340, 170 380, 220 370 C 310 350, 370 270, 370 170 C 370 90, 310 40, 200 30 Z" fill="url(#stripes2)" />
      <path d="M200 30 Q 210 200 195 370" stroke="rgba(255,255,255,.18)" strokeWidth="2" fill="none" />
      {showSpots && (
        <>
          <circle cx="270" cy="160" r="18" fill="#3a2a0a" opacity="0.7" />
          <circle cx="270" cy="160" r="11" fill="#5a3a12" />
          <circle cx="270" cy="160" r="5" fill="#8b5a1a" />
          <circle cx="150" cy="240" r="12" fill="#3a2a0a" opacity="0.6" />
          <circle cx="150" cy="240" r="6" fill="#5a3a12" />
        </>
      )}
    </svg>
  );
}

function ConfidenceRing({ value }: { value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} transform="rotate(-90 40 40)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1, color: "var(--primary)", letterSpacing: "-0.02em" }}>{value}%</div>
        <div style={{ fontSize: 8, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".10em", marginTop: 2 }}>conf.</div>
      </div>
    </div>
  );
}

function SeverityPill({ label, value, tone = "ok" }: { label: string; value: string; tone?: "ok" | "warn" | "bad" | "neutral" }) {
  const colorMap = {
    ok:      { fg: "#0a3d2e", bg: "rgba(10,61,46,.06)" },
    warn:    { fg: "#8a6610", bg: "rgba(212,160,23,.10)" },
    bad:     { fg: "#b91c1c", bg: "rgba(185,28,28,.08)" },
    neutral: { fg: "var(--ink-2)", bg: "rgba(10,31,21,.05)" },
  }[tone];
  return (
    <div style={{ flex: 1, padding: "8px 10px", borderRadius: 10, background: colorMap.bg, color: colorMap.fg, display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 9, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".08em", opacity: 0.7 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>{value}</span>
    </div>
  );
}

function severityTone(s: string): "ok" | "warn" | "bad" {
  if (s === "healthy") return "ok";
  if (s === "severe") return "bad";
  return "warn";
}

function severityLabel(s: string, lang: Lang) {
  const map: Record<string, { UZ: string; EN: string }> = {
    healthy:  { UZ: "Sog'lom",     EN: "Healthy" },
    mild:     { UZ: "Engil",       EN: "Mild" },
    moderate: { UZ: "O'rta",       EN: "Moderate" },
    severe:   { UZ: "Og'ir",       EN: "Severe" },
  };
  return (map[s] ?? map.moderate)[lang];
}

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [lang, setLang] = useState<Lang>("UZ");
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ScanResult>(`/api/scans/${id}`)
      .then(setScan)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  const t = {
    title:    lang === "UZ" ? "Tahlil natijasi"       : "Scan result",
    breadcrumb: lang === "UZ" ? "Tahlil · Natija"     : "Scan · Result",
    detected: lang === "UZ" ? "Aniqlangan kasallik"   : "Detected disease",
    topMatch: lang === "UZ" ? "Eng yuqori taxmin"     : "Top prediction",
    others:   lang === "UZ" ? "Boshqa ehtimoliy variantlar" : "Other possible matches",
    modelOut: lang === "UZ" ? "Model chiqishi"        : "Model output",
    modelNote:lang === "UZ" ? "AI butun rasmni ko'rib kasallik turini aniqlaydi. Bu klassifikatsiya modeli, detektsiya emas." : "The AI classifies the whole image — it does not localize specific spots. This is classification, not detection.",
    refs:     lang === "UZ" ? "Ma'lumotlar bazasidagi shunga o'xshash rasmlar" : "Similar images from our database",
    dataset:  "PlantVillage dataset",
    treatment:lang === "UZ" ? "Davolash bo'yicha tavsiyalar" : "Treatment plan",
    steps:    lang === "UZ" ? "qadam" : "steps",
    severity: lang === "UZ" ? "Og'irlik" : "Severity",
    spread:   lang === "UZ" ? "Tarqalish" : "Spread",
    fast:     lang === "UZ" ? "Tez"    : "Fast",
    season:   lang === "UZ" ? "Mavsum" : "Season",
    summer:   lang === "UZ" ? "Yoz"    : "Summer",
    analyzed: lang === "UZ" ? "AI tahlil qildi" : "AI analyzed",
    scanAgain:lang === "UZ" ? "Yana tahlil"  : "Scan again",
    expert:   lang === "UZ" ? "Mutaxassisga yo'llash" : "Ask an expert",
    pdf:      lang === "UZ" ? "PDF hisobot" : "PDF report",
  };

  if (error) return <Shell title="Xato" breadcrumb="Tahlil · Natija"><p style={{ color: "#b91c1c" }}>{error}</p></Shell>;
  if (!scan) return <Shell title="Yuklanmoqda…" breadcrumb="Tahlil · Natija"><div /></Shell>;

  const treatment = (TREATMENT_MAP[scan.disease_name] ?? DEFAULT_TREATMENT)[lang];
  const imageUrl = scan.image_url.replace("minio:9000", "localhost:9200");

  return (
    <Shell title={t.title} breadcrumb={t.breadcrumb} lang={lang} onLangChange={setLang}
      rightSlot={
        <button style={{ height: 40, padding: "0 14px", borderRadius: 10, border: "1px solid var(--line)", background: "#fff", color: "var(--ink)", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
          {t.pdf}
        </button>
      }>
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 24, maxWidth: 1300 }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Image panel */}
          <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: "linear-gradient(155deg,#0a3d2e,#06291a)", aspectRatio: "4/3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="scan" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {/* AI glow */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%,rgba(132,204,22,.10),transparent 65%)", pointerEvents: "none" }} />
            {/* Corner brackets */}
            {[{ top: 16, left: 16 }, { top: 16, right: 16 }, { bottom: 16, left: 16 }, { bottom: 16, right: 16 }].map((p, i) => (
              <div key={i} style={{ position: "absolute", width: 24, height: 24, borderTop: i < 2 ? "2px solid rgba(255,255,255,.4)" : "none", borderBottom: i >= 2 ? "2px solid rgba(255,255,255,.4)" : "none", borderLeft: i % 2 === 0 ? "2px solid rgba(255,255,255,.4)" : "none", borderRight: i % 2 === 1 ? "2px solid rgba(255,255,255,.4)" : "none", ...p }} />
            ))}
            {/* AI badge */}
            <div style={{ position: "absolute", top: 16, left: 16, padding: "4px 8px", borderRadius: 6, fontSize: 10, fontFamily: "var(--mono)", letterSpacing: ".08em", textTransform: "uppercase", background: "rgba(255,255,255,.85)", color: "#0a3d2e", border: "1px solid rgba(10,61,46,.10)" }}>
              {t.analyzed}
            </div>
            {/* Bottom overlays */}
            <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end", color: "#fff" }}>
              <div style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(10px)", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.10)" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".08em" }}>{t.detected}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 2, letterSpacing: "-0.01em" }}>{scan.disease_name}</div>
              </div>
              <div style={{ background: "var(--accent)", color: "#1a1305", padding: "10px 16px", borderRadius: 12, fontFamily: "var(--mono)", fontWeight: 700 }}>
                {scan.confidence}%
              </div>
            </div>
          </div>

          {/* Predictions card */}
          <div style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--line)", padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600 }}>{t.others}</h3>
              <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{t.modelOut}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {scan.predictions.map((p, i) => {
                const isTop = i === 0;
                const barColor = isTop ? "var(--primary)" : i === 1 ? "var(--accent)" : "var(--muted)";
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr 56px", gap: 14, alignItems: "center", padding: isTop ? "8px 12px" : "4px 12px", borderRadius: 10, background: isTop ? "var(--primary-soft)" : "transparent", border: isTop ? "1px solid rgba(10,61,46,.10)" : "1px solid transparent" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: isTop ? 600 : 500, color: isTop ? "var(--primary)" : "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {isTop && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", marginRight: 8, verticalAlign: "middle" }} />}
                        {p.name}
                      </div>
                      {p.latin && <div style={{ fontSize: 11, fontStyle: "italic", color: "var(--muted)", marginTop: 1 }}>{p.latin}</div>}
                    </div>
                    <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(p.confidence, 0.5)}%`, height: "100%", background: barColor, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, textAlign: "right", color: isTop ? "var(--primary)" : "var(--muted)" }}>{p.confidence}%</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed var(--line)", fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
              <span style={{ lineHeight: 1.5 }}>{t.modelNote}</span>
            </div>
          </div>

          {/* Reference images */}
          <div style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--line)", padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600 }}>{t.refs}</h3>
              <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 8px", borderRadius: 4, background: "rgba(10,31,21,.05)" }}>{t.dataset}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ position: "relative", aspectRatio: "1/1", borderRadius: 10, overflow: "hidden", background: "#0a3d2e", border: "1px solid rgba(10,61,46,.10)" }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <LeafSample size={140} showSpots={!scan.is_healthy} />
                  </div>
                  <div style={{ position: "absolute", bottom: 4, right: 4, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)", color: "#fff", fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".04em" }}>
                    #{1247 + i}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Disease header */}
          <div style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--line)", padding: 22, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(212,160,23,.10),transparent 60%)", filter: "blur(20px)", pointerEvents: "none" }} />
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start", position: "relative" }}>
              <div style={{ flex: 1 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "rgba(212,160,23,.14)", color: "#8a6610", fontSize: 11, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
                  {t.topMatch}
                </span>
                <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 28, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                  {scan.plant} · {scan.disease_name}
                </h2>
                {scan.disease_latin && <div style={{ marginTop: 4, fontStyle: "italic", color: "var(--muted)", fontSize: 13 }}>{scan.disease_latin}</div>}
              </div>
              <ConfidenceRing value={scan.confidence} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, position: "relative" }}>
              <SeverityPill label={t.severity} value={severityLabel(scan.severity, lang)} tone={severityTone(scan.severity)} />
              <SeverityPill label={t.spread} value={t.fast} tone="warn" />
              <SeverityPill label={t.season} value={t.summer} tone="neutral" />
            </div>
          </div>

          {/* Treatment plan */}
          <div style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--line)", padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600 }}>{t.treatment}</h3>
              <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--primary)", textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 8px", borderRadius: 4, background: "var(--primary-soft)" }}>
                {treatment.length} {t.steps}
              </span>
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {treatment.map((step, i) => (
                <li key={i} style={{ display: "flex", gap: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "var(--primary-soft)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600 }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink-2)", flex: 1 }}>{step}</div>
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/scan" style={{ flex: 1, height: 48, borderRadius: 12, border: "none", cursor: "pointer", background: "var(--primary)", color: "#fff", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
              {t.scanAgain}
            </Link>
            <button style={{ flex: 1, height: 48, borderRadius: 12, cursor: "pointer", background: "#fff", color: "var(--ink)", border: "1px solid var(--line-strong)", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {t.expert}
            </button>
            <button style={{ width: 48, height: 48, borderRadius: 12, cursor: "pointer", background: "#fff", color: "var(--ink)", border: "1px solid var(--line-strong)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
