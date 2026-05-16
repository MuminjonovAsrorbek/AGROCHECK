"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { apiFetch, apiUpload } from "@/lib/api";

type Lang = "UZ" | "EN";
type Stage = "idle" | "analyzing" | "error";

const T = {
  UZ: {
    title: "Yangi tahlil", breadcrumb: "Bosh sahifa · Tahlil",
    headline: "O'simlik bargi rasmini yuklang",
    sub: "Sun'iy intellekt 3 soniyada kasallikni aniqlab beradi",
    chooseFile: "Fayl tanlash", takePhoto: "Suratga olish",
    fileHint: "JPG, PNG · maksimal 10 MB",
    sampleTitle: "Yoki namuna rasmlardan birini tanlang", free: "Bepul",
    recentTitle: "Oxirgi tahlillar", seeAll: "Hammasini ko'rish",
    thisMonth: "Bu oyda", cancel: "Bekor qilish",
    analyzing: "AI tahlil qilmoqda", analyzingSub: "Tasvir Qwen 3.5 modeli orqali tahlil qilinmoqda",
    steps: ["Tasvirni qayta ishlash", "Xususiyatlarni ajratish", "Klassifikatsiya", "Davolash usulini tayyorlash"],
    yesterday: "Kecha",
  },
  EN: {
    title: "New scan", breadcrumb: "Home · Scan",
    headline: "Upload a leaf photo",
    sub: "Our AI identifies the disease in 3 seconds",
    chooseFile: "Choose file", takePhoto: "Use camera",
    fileHint: "JPG, PNG · up to 10 MB",
    sampleTitle: "Or try a sample", free: "Free",
    recentTitle: "Recent scans", seeAll: "See all",
    thisMonth: "This month", cancel: "Cancel",
    analyzing: "AI is analyzing", analyzingSub: "Running image through the Qwen 3.5 model",
    steps: ["Preprocessing image", "Extracting features", "Classification", "Preparing treatment plan"],
    yesterday: "Yesterday",
  },
};

function LeafSample({ size = 360, showSpots = false }: { size?: number; showSpots?: boolean }) {
  return (
    <svg viewBox="0 0 400 400" width={size} height={size} style={{ display: "block" }}>
      <defs>
        <radialGradient id="leafbg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a4d24" />
          <stop offset="100%" stopColor="#0a3d1e" />
        </radialGradient>
        <pattern id="stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="#84cc16" opacity="0.18" />
          <rect x="3" width="3" height="6" fill="#84cc16" opacity="0.06" />
        </pattern>
      </defs>
      <path d="M200 30 C 100 50, 50 150, 70 270 C 90 340, 170 380, 220 370 C 310 350, 370 270, 370 170 C 370 90, 310 40, 200 30 Z" fill="url(#leafbg)" />
      <path d="M200 30 C 100 50, 50 150, 70 270 C 90 340, 170 380, 220 370 C 310 350, 370 270, 370 170 C 370 90, 310 40, 200 30 Z" fill="url(#stripes)" />
      <path d="M200 30 Q 210 200 195 370" stroke="rgba(255,255,255,.18)" strokeWidth="2" fill="none" />
      {showSpots && (
        <>
          <circle cx="270" cy="160" r="18" fill="#3a2a0a" opacity="0.7" />
          <circle cx="270" cy="160" r="11" fill="#5a3a12" />
          <circle cx="270" cy="160" r="5" fill="#8b5a1a" />
          <circle cx="150" cy="240" r="12" fill="#3a2a0a" opacity="0.6" />
          <circle cx="150" cy="240" r="6" fill="#5a3a12" />
          <circle cx="220" cy="300" r="14" fill="#3a2a0a" opacity="0.6" />
          <circle cx="220" cy="300" r="8" fill="#5a3a12" />
        </>
      )}
    </svg>
  );
}

interface RecentScan { id: string; plant: string; disease_name: string; confidence: number; is_healthy: boolean; created_at: string; image_url: string; }

function RecentScans({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [scans, setScans] = useState<RecentScan[]>([]);

  useEffect(() => {
    apiFetch<RecentScan[]>("/api/scans/?limit=5").then(setScans).catch(() => {});
  }, []);

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return lang === "UZ" ? "Hozirgina" : "Just now";
    if (h < 24) return lang === "UZ" ? `${h} soat oldin` : `${h}h ago`;
    return t.yesterday;
  }

  return (
    <aside style={{ background: "#fff", borderRadius: 22, border: "1px solid var(--line)", padding: 22, height: "fit-content", position: "sticky", top: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600 }}>{t.recentTitle}</h3>
        <a href="/history" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>{t.seeAll}</a>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {scans.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            {lang === "UZ" ? "Hali tahlil yo'q" : "No scans yet"}
          </p>
        )}
        {scans.map(scan => {
          const status = scan.is_healthy ? "ok" : scan.confidence < 70 ? "lowconf" : scan.confidence > 90 ? "bad" : "warn";
          const color = status === "ok" ? "#0a3d2e" : status === "warn" ? "#d4a017" : status === "lowconf" ? "#9ca3af" : "#b91c1c";
          const bg = status === "ok" ? "rgba(10,61,46,.06)" : status === "warn" ? "rgba(212,160,23,.10)" : status === "lowconf" ? "rgba(156,163,175,.10)" : "rgba(185,28,28,.08)";
          const imageUrl = scan.image_url.replace("minio:9000", "localhost:9200");
          return (
            <a key={scan.id} href={`/scan/${scan.id}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 10, textDecoration: "none", cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", background: "#0a3d2e", flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={scan.plant} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{scan.plant}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                  <span style={{ fontSize: 10, fontFamily: "var(--mono)", padding: "2px 6px", borderRadius: 4, background: bg, color }}>{scan.disease_name}</span>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>· {timeAgo(scan.created_at)}</span>
                </div>
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color, fontWeight: 600 }}>{scan.confidence}%</div>
            </a>
          );
        })}
      </div>
    </aside>
  );
}


export default function ScanPage() {
  const [lang, setLang] = useState<Lang>("UZ");
  const [stage, setStage] = useState<Stage>("idle");
  const [step, setStep] = useState(0);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const t = T[lang];

  async function handleFile(file: File) {
    setStage("analyzing"); setStep(0); setError("");
    const interval = setInterval(() => setStep(s => Math.min(s + 1, 3)), 800);
    try {
      const result = await apiUpload<{ id: string }>("/api/scans/upload", file);
      clearInterval(interval);
      router.push(`/scan/${result.id}`);
    } catch (err: unknown) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
      setStage("error");
    }
  }

  /* ── ANALYZING SCREEN ── */
  if (stage === "analyzing") {
    return (
      <Shell title={t.title} breadcrumb={t.breadcrumb} lang={lang} onLangChange={setLang}>
        <style>{`
          @keyframes scanmove { 0%{top:30px} 50%{top:calc(100% - 30px)} 100%{top:30px} }
          @keyframes pulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
          @keyframes barProg { 0%{width:0%} 100%{width:64%} }
          .progBar{animation:barProg 2s ease-out forwards}
        `}</style>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 28, maxWidth: 1200 }}>
          {/* Image panel */}
          <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", background: "linear-gradient(155deg,#0a3d2e,#06291a)", aspectRatio: "4/5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Corner brackets */}
            {[{ top: 16, left: 16 }, { top: 16, right: 16 }, { bottom: 16, left: 16 }, { bottom: 16, right: 16 }].map((p, i) => (
              <div key={i} style={{ position: "absolute", width: 28, height: 28, borderTop: i < 2 ? "2px solid var(--accent)" : "none", borderBottom: i >= 2 ? "2px solid var(--accent)" : "none", borderLeft: i % 2 === 0 ? "2px solid var(--accent)" : "none", borderRight: i % 2 === 1 ? "2px solid var(--accent)" : "none", ...p }} />
            ))}
            <LeafSample size={420} showSpots />
            {/* Scan line */}
            <div style={{ position: "absolute", left: 24, right: 24, height: 2, background: "linear-gradient(90deg,transparent,var(--accent),transparent)", boxShadow: "0 0 20px var(--accent)", animation: "scanmove 2.4s ease-in-out infinite" }} />
            {/* Scanning badge */}
            <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", padding: "6px 14px", borderRadius: 999, background: "rgba(0,0,0,.4)", color: "#fff", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,.10)", backdropFilter: "blur(8px)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#84cc16", animation: "pulse 1s ease-in-out infinite" }} />
              Scanning
            </div>
            {/* HUD chips */}
            <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, display: "flex", justifyContent: "space-between", color: "#fff", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".06em" }}>
              {[{ label: "Image", value: "1024 × 1024" }, { label: "Model", value: "Qwen 3.5 · 4B" }].map(chip => (
                <div key={chip.label} style={{ background: "rgba(0,0,0,.4)", backdropFilter: "blur(8px)", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,.10)" }}>
                  <div style={{ color: "rgba(255,255,255,.5)", textTransform: "uppercase" }}>{chip.label}</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{chip.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps panel */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 999, background: "rgba(132,204,22,.12)", color: "#3f6b13", fontSize: 11, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#84cc16", animation: "pulse 1s ease-in-out infinite" }} />
                AI · Live
              </div>
              <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{t.analyzing}…</h2>
              <p style={{ margin: "10px 0 0", color: "var(--muted)", fontSize: 15, lineHeight: 1.5, maxWidth: 380 }}>{t.analyzingSub}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {t.steps.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: done ? "var(--primary)" : active ? "#fff" : "transparent", border: done ? "none" : `1.5px solid ${active ? "var(--primary)" : "var(--line-strong)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: done ? "#fff" : "var(--primary)", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600 }}>
                      {done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5 9-9" /></svg>
                        : active ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", animation: "pulse 1s ease-in-out infinite" }} />
                          : <span>{i + 1}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: active ? 600 : 500, color: done || active ? "var(--ink)" : "var(--muted)" }}>{s}</div>
                      {active && (
                        <div style={{ height: 3, background: "var(--line)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                          <div className="progBar" style={{ height: "100%", background: "var(--primary)", borderRadius: 2 }} />
                        </div>
                      )}
                    </div>
                    {done && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{i === 0 ? "0.4s" : "0.9s"}</span>}
                  </div>
                );
              })}
            </div>
            <button onClick={() => { setStage("idle"); setError(""); }} style={{ alignSelf: "flex-start", marginTop: 8, padding: "10px 16px", borderRadius: 10, cursor: "pointer", background: "transparent", border: "1px solid var(--line-strong)", color: "var(--ink-2)", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500 }}>
              {t.cancel}
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  /* ── IDLE / ERROR SCREEN ── */
  return (
    <Shell title={t.title} breadcrumb={t.breadcrumb} lang={lang} onLangChange={setLang}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, maxWidth: 1300 }}>
        <div>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            style={{ borderRadius: 22, padding: "56px 40px", border: `2px dashed ${drag ? "var(--primary)" : "rgba(10,61,46,.18)"}`, background: drag ? "rgba(10,61,46,.04)" : "#fff", transition: "all .2s ease", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", overflow: "hidden" }}>
            {/* Ambient glows */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(132,204,22,.10),transparent 60%)", filter: "blur(20px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -50, left: -50, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(212,160,23,.08),transparent 60%)", filter: "blur(20px)", pointerEvents: "none" }} />

            {/* Icon */}
            <div style={{ position: "relative", width: 84, height: 84, borderRadius: 22, background: "linear-gradient(155deg,#0a3d2e,#134d3a)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 40px -10px rgba(10,61,46,.4)" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 16V4" /><path d="m6 10 6-6 6 6" /><path d="M3 16v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4" />
              </svg>
              <span style={{ position: "absolute", top: -6, right: -6, padding: "2px 8px", borderRadius: 999, background: "var(--accent)", color: "#1a1305", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: ".04em" }}>AI</span>
            </div>

            <h2 style={{ position: "relative", fontFamily: "var(--serif)", fontSize: 36, margin: "24px 0 6px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>{t.headline}</h2>
            <p style={{ position: "relative", color: "var(--muted)", fontSize: 15, margin: "0 0 24px", maxWidth: 420 }}>{t.sub}</p>

            {/* Buttons */}
            <div style={{ position: "relative", display: "flex", gap: 10, marginBottom: 16 }}>
              <button onClick={() => inputRef.current?.click()} style={{ height: 50, padding: "0 22px", borderRadius: 12, border: "none", cursor: "pointer", background: "var(--primary)", color: "#fff", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 15V3" /></svg>
                {t.chooseFile}
              </button>
              <button style={{ height: 50, padding: "0 22px", borderRadius: 12, cursor: "pointer", background: "#fff", color: "var(--ink)", border: "1px solid var(--line-strong)", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                {t.takePhoto}
              </button>
            </div>

            <div style={{ position: "relative", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{t.fileHint}</div>
            {(stage === "error" && error) && <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 12, position: "relative" }}>{error}</p>}
          </div>

          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        {/* Recent scans sidebar */}
        <RecentScans lang={lang} />
      </div>
    </Shell>
  );
}
