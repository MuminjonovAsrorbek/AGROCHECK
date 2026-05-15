"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { apiUpload } from "@/lib/api";

type Stage = "idle" | "analyzing" | "error";

const STEPS = [
  { uz: "Tasvirni qayta ishlash" },
  { uz: "Xususiyatlarni ajratish" },
  { uz: "Klassifikatsiya" },
  { uz: "Davolash usulini tayyorlash" },
];

export default function ScanPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [step, setStep] = useState(0);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

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

  if (stage === "analyzing") {
    return (
      <Shell title="Tahlil" breadcrumb="Bosh sahifa · Tahlil">
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 28, maxWidth: 1200 }}>
          <div style={{ borderRadius: 22, background: "linear-gradient(155deg,#0a3d2e,#06291a)", aspectRatio: "4/5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "rgba(255,255,255,.5)", fontFamily: "var(--mono)", fontSize: 14 }}>Scanning…</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.02em" }}>AI tahlil qilmoqda…</h2>
            <p style={{ color: "var(--muted)", fontSize: 15 }}>Qwen 3.5 modeli orqali tahlil qilinmoqda</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: i < step ? "var(--primary)" : i === step ? "#fff" : "transparent", border: i < step ? "none" : "1.5px solid " + (i === step ? "var(--primary)" : "var(--line-strong)"), color: i < step ? "#fff" : "var(--primary)", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600 }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: i === step ? 600 : 500, color: i <= step ? "var(--ink)" : "var(--muted)" }}>{s.uz}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Yangi tahlil" breadcrumb="Bosh sahifa · Tahlil">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, maxWidth: 1300 }}>
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()}
            style={{ borderRadius: 22, padding: "56px 40px", border: `2px dashed ${drag ? "var(--primary)" : "rgba(10,61,46,.18)"}`, background: drag ? "rgba(10,61,46,.04)" : "#fff", transition: "all .2s ease", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", cursor: "pointer" }}>
            <div style={{ width: 84, height: 84, borderRadius: 22, background: "linear-gradient(155deg,#0a3d2e,#134d3a)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 40px -10px rgba(10,61,46,.4)" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M12 16V4"/><path d="m6 10 6-6 6 6"/><path d="M3 16v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4"/></svg>
            </div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 36, margin: "24px 0 6px", letterSpacing: "-0.02em" }}>O&apos;simlik bargi rasmini yuklang</h2>
            <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 24 }}>Sun&apos;iy intellekt 3 soniyada kasallikni aniqlab beradi</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={e => { e.stopPropagation(); inputRef.current?.click(); }} style={{ height: 50, padding: "0 22px", borderRadius: 12, border: "none", cursor: "pointer", background: "var(--primary)", color: "#fff", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600 }}>Fayl tanlash</button>
            </div>
            <div style={{ marginTop: 16, fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>JPG, PNG · maksimal 10 MB</div>
            {error && <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 12 }}>{error}</p>}
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      </div>
    </Shell>
  );
}
