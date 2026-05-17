# PDF Hisobot Generatsiya — Dizayn Spesifikatsiyasi

**Sana:** 2026-05-17  
**Sahifa:** `/scan/[id]` — Tahlil natijasi  
**Maqsad:** "PDF hisobot" tugmasini ishga tushirish va chiroyli A4 formatdagi PDF generatsiya qilish

---

## Muammo

`/scan/[id]/page.tsx` da mavjud "PDF hisobot" tugmasi (`rightSlot`) hech qanday funksionalligi yo'q.

---

## Yechim

### Kutubxonalar
- `jspdf` — PDF yaratish
- `html2canvas` — DOM elementni canvas/rasm sifatida olish

### Arxitektura

**Alohida yashirin PDF template komponenti** — asosiy UI ga tegmasdan, PDF uchun maxsus `<div ref={pdfRef}>` yaratiladi. Bu div:
- A4 o'lchovida (`794px` kenglik, aqlli balandlik)
- `position: absolute; left: -9999px; top: -9999px` bilan yashirilgan
- Faqat PDF generatsiya paytida render qilinadi

### PDF Tuzilishi (A4, vertical)

```
┌─────────────────────────────────────────┐
│  🌿 AGROCHECK         Sana | Scan ID   │  ← Header
├─────────────────────────────────────────┤
│  [O'simlik rasmi 4:3]                   │  ← Rasm bloki
│  kasallik nomi badge | confidence badge │
├─────────────────────────────────────────┤
│  O'simlik · Kasallik nomi               │  ← Asosiy ma'lumot
│  [Og'irlik] [Tarqalish] [Mavsum]        │
├─────────────────────────────────────────┤
│  Davolash tavsiyalari                   │  ← Treatment
│  01  qadam matni...                     │
│  02  qadam matni...                     │
│  ...                                    │
├─────────────────────────────────────────┤
│  Model natijalari                       │  ← Predictions
│  Kasallik A    ████████░░  85%          │
│  Kasallik B    ███░░░░░░░  30%          │
├─────────────────────────────────────────┤
│  AI tomonidan tahlil qilindi            │  ← Footer / disclaimer
│  agrocheck.uz                           │
└─────────────────────────────────────────┘
```

### Rang sxemasi (PDF uchun)
- **Primary:** `#0a3d2e` (qoʻyuq yashil)
- **Accent:** `#d4a017` (oltin)
- **Background:** `#ffffff`
- **Surface:** `#f5f7f5`
- **Text:** `#1a1f1e` / `#6b7f78`

---

## Komponentlar

### `PdfTemplate` (yangi ichki komponent `/scan/[id]/page.tsx` ichida)
```
PdfTemplate({ scan, treatment, lang, imageUrl })
```
- `scan` — `ScanResult` tipidagi ma'lumot
- `treatment` — `string[]` davolash qadamlari
- `lang` — `"UZ" | "EN"` til
- `imageUrl` — oldindan tuzatilgan rasm URL

### `generatePdf(ref, filename)` (inline funksiya)
1. `html2canvas(ref.current, { scale: 2, useCORS: true })` — yuqori sifatli canvas
2. Canvas → base64 PNG
3. `jsPDF('p', 'mm', 'a4')` — A4 portret format
4. Rasm proporsiyalarini hisoblash va PDF ga joylashtirish
5. `pdf.save('agrocheck-{scan-id}.pdf')` — yuklab olish

---

## Xato holatlari

| Holat | Yechim |
|-------|--------|
| Rasm yuklanmagan | CORS xatosi bo'lsa ham canvas olinadi (fon rangida) |
| PDF generatsiya uzoq ketsa | Button "Yuklanmoqda..." holatiga o'tadi |
| `window` undefined (SSR) | `"use client"` directive mavjud, muammo yo'q |

---

## O'zgartirilmaydigan narsalar

- Asosiy sahifa UI — faqat `rightSlot` button onClick qo'shiladi
- API — yangi endpoint kerak emas, barcha ma'lumot allaqachon yuklanib bo'lgan
- Shell komponenti — o'zgartirilmaydi

---

## Paketlar

```bash
npm install jspdf html2canvas
npm install --save-dev @types/html2canvas
```

Note: `jspdf` o'zining TypeScript type'larini o'z ichiga oladi.

---

## Amalga oshirish ketma-ketligi

1. `npm install jspdf html2canvas` — paketlarni o'rnatish
2. `/scan/[id]/page.tsx` da import qo'shish
3. `PdfTemplate` ichki komponent yaratish
4. `generatePdf` funksiyasi va `pdfRef` qo'shish
5. Button `onClick` ga ulash va loading holati qo'shish
6. Test: pdf generatsiya va yuklab olish
