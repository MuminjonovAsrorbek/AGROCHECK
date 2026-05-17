# PDF Hisobot Generatsiya Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/scan/[id]` sahifasidagi "PDF hisobot" tugmasini ishga tushirish — barcha tahlil ma'lumotlarini (rasm, kasallik, davolash, model natijalari) o'z ichiga olgan A4 formatdagi chiroyli PDF generatsiya qilish.

**Architecture:** `jspdf` + `html2canvas` orqali client-side PDF generatsiya. Asosiy sahifadan tashqarida (yashirin `div` ichida) alohida `PdfTemplate` komponenti render qilinadi, `html2canvas` uni yuqori sifatli canvas ga aylantiradi, `jsPDF` esa canvas dan PDF yaratib foydalanuvchiga yuklab olishni boshlaydi.

**Tech Stack:** Next.js 14, React 18, TypeScript, jspdf, html2canvas

---

## File Map

| Fayl | Ish |
|------|-----|
| `frontend/src/app/scan/[id]/page.tsx` | `PdfTemplate` komponenti + `generatePdf` funksiyasi + button `onClick` + loading holati |

---

### Task 1: npm paketlarni o'rnatish

**Files:**
- Modify: `frontend/package.json` (avtomatik)

- [ ] **Step 1: frontend katalogiga o'ting va paketlarni o'rnating**

```bash
cd "/home/asrorbek/Project's/AGROCHECK/frontend"
npm install jspdf html2canvas
```

Expected output (taxminan):
```
added 8 packages, and audited 342 packages in 12s
found 0 vulnerabilities
```

- [ ] **Step 2: O'rnatilganini tekshiring**

```bash
cat package.json | grep -E '"jspdf|html2canvas'
```

Expected:
```
"html2canvas": "^1.x.x",
"jspdf": "^2.x.x",
```

- [ ] **Step 3: Commit**

```bash
cd "/home/asrorbek/Project's/AGROCHECK/frontend"
git add package.json package-lock.json
git commit -m "chore: install jspdf and html2canvas for PDF report generation"
```

---

### Task 2: PdfTemplate komponenti va generatePdf funksiyasi

**Files:**
- Modify: `frontend/src/app/scan/[id]/page.tsx`

Bu task da `PdfTemplate` ichki komponenti va `generatePdf` funksiyasini qo'shamiz. Komponent `position: absolute; left: -9999px` bilan yashirilgan, faqat PDF generatsiya paytida mavjud bo'ladi.

- [ ] **Step 1: Faylni oching va import qatorini toping**

`frontend/src/app/scan/[id]/page.tsx` faylining tepasiga (`"use client";` dan keyin) quyidagi import qatorlarini qo'shing:

```tsx
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
```

Fayl boshida (`"use client";` qatori) allaqachon mavjud — unga tegmang.

- [ ] **Step 2: `PdfTemplate` komponentini `ResultPage` funksiyasidan YUQORIDA qo'shing**

`export default function ResultPage()` qatoridan oldin quyidagi komponentni qo'shing:

```tsx
function PdfTemplate({
  scan,
  treatment,
  lang,
  imageUrl,
}: {
  scan: ScanResult;
  treatment: string[];
  lang: Lang;
  imageUrl: string;
}) {
  const dateStr = new Date(scan.created_at).toLocaleDateString("uz-UZ", {
    year: "numeric", month: "long", day: "numeric",
  });
  const shortId = `#${scan.id.slice(0, 8).toUpperCase()}`;

  const severityColor: Record<string, string> = {
    healthy: "#1f8a5b", mild: "#d4a017", moderate: "#d4a017", severe: "#dc2626",
  };
  const dot = severityColor[scan.severity] ?? "#d4a017";

  const severityLabelPdf = (s: string) => {
    const m: Record<string, { UZ: string; EN: string }> = {
      healthy: { UZ: "Sog'lom", EN: "Healthy" },
      mild: { UZ: "Engil", EN: "Mild" },
      moderate: { UZ: "O'rta", EN: "Moderate" },
      severe: { UZ: "Og'ir", EN: "Severe" },
    };
    return (m[s] ?? m.moderate)[lang];
  };

  return (
    <div
      style={{
        width: 794,
        background: "#ffffff",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        color: "#1a1f1e",
        padding: "40px 48px 32px",
        boxSizing: "border-box",
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, paddingBottom: 16, borderBottom: "2px solid #0a3d2e" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0a3d2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#84cc16" strokeWidth="2"><path d="M12 2a10 10 0 0 1 10 10c0 3.5-1.5 6.5-4 8.5" /><path d="M12 2C6 2 2 7 2 12s4 10 10 10" /><path d="M12 12c0-4 3-7 7-8" /><path d="M12 12c-3 0-5 2-6 5" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0a3d2e", letterSpacing: "-0.02em" }}>AgroCheck</div>
            <div style={{ fontSize: 10, color: "#6b7f78", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {lang === "UZ" ? "O'simlik kasallik tahlili" : "Plant Disease Analysis"}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#6b7f78", fontFamily: "monospace" }}>{shortId}</div>
          <div style={{ fontSize: 11, color: "#6b7f78", marginTop: 2 }}>{dateStr}</div>
          <div style={{ marginTop: 6, display: "inline-block", padding: "3px 10px", borderRadius: 20, background: "#f0faf5", color: "#0a3d2e", fontSize: 10, fontWeight: 600, border: "1px solid #c3e6d0" }}>
            {lang === "UZ" ? "Rasmiy hisobot" : "Official Report"}
          </div>
        </div>
      </div>

      {/* ── IMAGE + DISEASE HEADER ── */}
      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        {/* Image */}
        <div style={{ width: 280, flexShrink: 0, borderRadius: 16, overflow: "hidden", background: "#0a3d2e", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={scan.plant}
            style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
            crossOrigin="anonymous"
          />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px", background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>
              {lang === "UZ" ? "Aniqlangan kasallik" : "Detected disease"}
            </div>
            <div style={{ color: "#ffffff", fontSize: 16, fontWeight: 700, marginTop: 2 }}>{scan.disease_name}</div>
          </div>
          <div style={{ position: "absolute", top: 10, right: 10, background: "#d4a017", color: "#1a1305", padding: "4px 10px", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>
            {scan.confidence}%
          </div>
        </div>

        {/* Disease info */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0a3d2e", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              {scan.plant}
            </div>
            <div style={{ fontSize: 15, color: "#4a5c56", marginTop: 4, fontWeight: 600 }}>{scan.disease_name}</div>
            {scan.disease_latin && (
              <div style={{ fontSize: 12, fontStyle: "italic", color: "#9aada8", marginTop: 2 }}>{scan.disease_latin}</div>
            )}
          </div>

          {/* Confidence ring substitute (bar) */}
          <div style={{ background: "#f5f7f5", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#6b7f78", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {lang === "UZ" ? "Ishonch darajasi" : "Confidence"}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#0a3d2e", fontFamily: "monospace" }}>{scan.confidence}%</span>
            </div>
            <div style={{ height: 8, background: "#e2e8e6", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${scan.confidence}%`, height: "100%", background: "#0a3d2e", borderRadius: 4 }} />
            </div>
          </div>

          {/* Status pills */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "#f5f7f5", border: `1px solid ${dot}22` }}>
              <div style={{ fontSize: 9, color: "#6b7f78", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {lang === "UZ" ? "Og'irlik" : "Severity"}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: dot, marginTop: 3 }}>{severityLabelPdf(scan.severity)}</div>
            </div>
            <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "#fffbeb", border: "1px solid #d4a01722" }}>
              <div style={{ fontSize: 9, color: "#6b7f78", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {lang === "UZ" ? "Tarqalish" : "Spread"}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#d4a017", marginTop: 3 }}>
                {lang === "UZ" ? "Tez" : "Fast"}
              </div>
            </div>
            <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "#f5f7f5", border: "1px solid #e2e8e6" }}>
              <div style={{ fontSize: 9, color: "#6b7f78", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {lang === "UZ" ? "Mavsum" : "Season"}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#4a5c56", marginTop: 3 }}>
                {lang === "UZ" ? "Yoz" : "Summer"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TREATMENT ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: "#0a3d2e" }} />
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0a3d2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {lang === "UZ" ? "Davolash tavsiyalari" : "Treatment Recommendations"}
          </h3>
          <span style={{ padding: "2px 8px", borderRadius: 20, background: "#f0faf5", color: "#0a3d2e", fontSize: 10, fontWeight: 600, border: "1px solid #c3e6d0" }}>
            {treatment.length} {lang === "UZ" ? "qadam" : "steps"}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {treatment.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 14px", borderRadius: 10, background: i === 0 ? "#f0faf5" : "#f9fafb", border: `1px solid ${i === 0 ? "#c3e6d0" : "#e9eceb"}` }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? "#0a3d2e" : "#e2e8e6", color: i === 0 ? "#ffffff" : "#6b7f78", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "monospace", flexShrink: 0 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: "#374845", flex: 1 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODEL PREDICTIONS ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: "#d4a017" }} />
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0a3d2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {lang === "UZ" ? "Model natijalari" : "Model Predictions"}
          </h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {scan.predictions.map((p, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 1fr 56px", gap: 12, alignItems: "center", padding: "8px 14px", borderRadius: 8, background: i === 0 ? "#f0faf5" : "transparent", border: `1px solid ${i === 0 ? "#c3e6d0" : "#e9eceb"}` }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#0a3d2e" : "#374845" }}>{p.name}</div>
                {p.latin && <div style={{ fontSize: 10, fontStyle: "italic", color: "#9aada8" }}>{p.latin}</div>}
              </div>
              <div style={{ height: 6, background: "#e2e8e6", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${Math.max(p.confidence, 0.5)}%`, height: "100%", background: i === 0 ? "#0a3d2e" : i === 1 ? "#d4a017" : "#9aada8", borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, textAlign: "right", color: i === 0 ? "#0a3d2e" : "#6b7f78", fontFamily: "monospace" }}>{p.confidence}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ paddingTop: 16, borderTop: "1px solid #e2e8e6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7f78" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></svg>
          <span style={{ fontSize: 10, color: "#9aada8", lineHeight: 1.5 }}>
            {lang === "UZ"
              ? "Bu hisobot AI modeli tomonidan avtomatik yaratilgan. Yakuniy qaror uchun agronimga murojaat qiling."
              : "This report is AI-generated. Consult an agronomist for final decisions."}
          </span>
        </div>
        <div style={{ fontSize: 10, color: "#9aada8", fontFamily: "monospace", textAlign: "right" }}>
          <div>agrocheck.uz</div>
          <div>{shortId}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Faylni saqlang va TypeScript xatolarini tekshiring**

```bash
cd "/home/asrorbek/Project's/AGROCHECK/frontend"
npx tsc --noEmit 2>&1 | head -30
```

Expected: xato yo'q yoki faqat mavjud xatolar (yangi xato bo'lmasligi kerak).

---

### Task 3: generatePdf funksiyasi va button ulash

**Files:**
- Modify: `frontend/src/app/scan/[id]/page.tsx`

- [ ] **Step 1: `ResultPage` komponentiga `useRef` va `pdfLoading` state qo'shing**

`ResultPage` funksiyasining boshidagi mavjud state'lar (`lang`, `scan`, `error`) yoniga qo'shing:

```tsx
const pdfRef = useRef<HTMLDivElement>(null);
const [pdfLoading, setPdfLoading] = useState(false);
```

Faylning tepasidagi `import { useEffect, useState }` ni quyidagicha yangilang:

```tsx
import { useEffect, useRef, useState } from "react";
```

- [ ] **Step 2: `generatePdf` funksiyasini `ResultPage` ichida (`return` dan oldin) qo'shing**

```tsx
async function generatePdf() {
  if (!pdfRef.current || !scan) return;
  setPdfLoading(true);
  try {
    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`agrocheck-${scan.id.slice(0, 8)}.pdf`);
  } finally {
    setPdfLoading(false);
  }
}
```

- [ ] **Step 3: `PdfTemplate` render uchun yashirin div qo'shing va button'ga onClick ulang**

`return (` dan keyin, `<Shell ...>` dan OLDIN quyidagi yashirin div qo'shing:

```tsx
return (
  <>
    {/* Yashirin PDF template */}
    <div style={{ position: "absolute", left: -9999, top: -9999, zIndex: -1 }}>
      <div ref={pdfRef}>
        {scan && (
          <PdfTemplate
            scan={scan}
            treatment={treatment}
            lang={lang}
            imageUrl={imageUrl}
          />
        )}
      </div>
    </div>

    <Shell
      title={t.title}
      breadcrumb={t.breadcrumb}
      lang={lang}
      onLangChange={setLang}
      rightSlot={
        <button
          onClick={generatePdf}
          disabled={pdfLoading}
          style={{
            height: 40, padding: "0 14px", borderRadius: 10,
            border: "1px solid var(--line)",
            background: pdfLoading ? "var(--primary-soft)" : "#fff",
            color: pdfLoading ? "var(--primary)" : "var(--ink)",
            cursor: pdfLoading ? "not-allowed" : "pointer",
            fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500,
            display: "inline-flex", alignItems: "center", gap: 8,
            opacity: pdfLoading ? 0.7 : 1,
            transition: "all .15s",
          }}
        >
          {pdfLoading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {lang === "UZ" ? "Yuklanmoqda…" : "Generating…"}
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {t.pdf}
            </>
          )}
        </button>
      }
    >
```

- [ ] **Step 4: `return` oxirini yangilang — `</Shell>` dan keyin `</>` qo'shing**

Fayl oxirida:
```tsx
    </Shell>
  </>
);
```

- [ ] **Step 5: Spinner animatsiyasi uchun global CSS qo'shing**

`frontend/src/styles/globals.css` faylini oching va oxiriga qo'shing:

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

- [ ] **Step 6: TypeScript xatolarini tekshiring**

```bash
cd "/home/asrorbek/Project's/AGROCHECK/frontend"
npx tsc --noEmit 2>&1 | head -30
```

Expected: xato yo'q yoki faqat mavjud (yangi) xatolar yo'q.

- [ ] **Step 7: Dev server'ni ishga tushiring va qo'lda test qiling**

```bash
cd "/home/asrorbek/Project's/AGROCHECK/frontend"
npm run dev
```

Browser da `/scan/<mavjud-id>` sahifasiga o'ting:
1. "PDF hisobot" tugmasini bosing
2. Button "Yuklanmoqda…" holatiga o'tishi kerak
3. Biroz kutgach, `agrocheck-XXXXXXXX.pdf` fayli yuklab olinishi kerak
4. PDF ni oching — A4 formatda barcha seksiyalar ko'rinishi kerak

- [ ] **Step 8: Commit**

```bash
cd "/home/asrorbek/Project's/AGROCHECK/frontend"
git add src/app/scan/\[id\]/page.tsx src/styles/globals.css
git commit -m "feat: implement PDF report generation for scan results"
```

---

## Muammoli holatlari

| Muammo | Yechim |
|--------|--------|
| `html2canvas` rasm yuklamayapti (CORS) | `crossOrigin="anonymous"` rasm tagida allaqachon bor. MinIO proxy CORS header qaytarishi kerak. Aks holda rasm o'rniga yashil fon ko'rinadi. |
| `jsPDF` import xatosi | `import jsPDF from "jspdf"` — default import, curly braces yo'q |
| PDF balandligi A4 dan oshib ketsa | jsPDF avtomatik qirqadi. Agar ko'p sahifalilik kerak bo'lsa, alohida task qo'shing. |
| `pdfRef.current` null | `scan && (...)` sharti bor — `scan` load bo'lguncha template render bo'lmaydi |
