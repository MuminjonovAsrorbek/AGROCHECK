# Handoff: Agrocheck — AI Plant Disease Detection

## Overview

Agrocheck is a web + mobile-responsive application that lets farmers and gardeners diagnose plant diseases by uploading a leaf photo. The backend uses the Hugging Face model **[`deadbear34/qwen35-4b-plantdisease-cpt`](https://huggingface.co/deadbear34/qwen35-4b-plantdisease-cpt)** — a fine-tuned Qwen 3.5 4B classification model.

The product supports two languages: **O'zbek (UZ)** and **English (EN)**, with a runtime toggle.

This handoff covers the **complete first-version UI** — authentication, upload flow, AI result presentation, dashboard, and history.

---

## About the design files

The files in `design-references/` are **HTML + React (via Babel-in-browser) design references**, not production code. They show intended look, layout, copy, and interaction patterns. Your task is to **recreate these designs in the target app's stack** (Next.js + React, Vue + Nuxt, SwiftUI, React Native, etc.) using the team's preferred patterns, component libraries, and styling system.

If the project has no existing codebase yet, the recommended stack is:
- **Next.js (App Router) + React + TypeScript**
- **Tailwind CSS** for styling (the design tokens below map cleanly to a Tailwind config)
- **shadcn/ui** or **Radix** primitives for forms, dropdowns, dialogs
- **Recharts** or **Visx** for the dashboard charts
- **React Query** or **SWR** for server state
- For the model: a thin **Python/FastAPI** service hosting the HF model + image preprocessing, or HF Inference Endpoints

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, radii, and copy are final. Recreate pixel-perfectly using the chosen stack's idioms.

---

## ⚠️ Critical product principle: classification, not detection

The Qwen 3.5 plantdisease model is a **classification model** — it outputs a probability distribution over disease classes for the **whole image**. It does **NOT** localize specific spots on the leaf. The UI was carefully designed to reflect this honestly.

**Do NOT add:**
- Bounding boxes around "detected spots"
- "X spots found" badges
- "Affected area: 18%" style metrics
- Anything implying pixel-level detection

**Do show:**
- A single classification result with confidence percentage
- Top-N alternative predictions with probability bars
- Reference images from the training dataset (for visual comparison by the user)
- A transparency note explaining the model is classification-only

This is product-critical for trust. If the model is ever swapped for a detection/segmentation model, the result screen can be evolved — but until then, keep it classification-only.

---

## Screens

### 1. Authentication (Login + Signup)

**Layout:** Split-screen `grid-cols-2`, full viewport height.
- **Left half:** white background, padding `44px`. Contains: top row with `ModeTabs` (Sign in / Sign up segmented control) + `LangSwitch`; centered form (max-width `420px`) with serif heading, subtitle, fields, primary button, "or" divider, Google + Telegram social buttons; bottom switch-mode link.
- **Right half:** dark green gradient brand panel `linear-gradient(155deg, #0a3d2e 0%, #08321a 55%, #051d11 100%)`. Contains: logo + AI-pulsing pill top; "AI scan card" mid (mock disease result preview); serif tagline ("Bargdagi kasallikni 3 soniyada aniqlang"); bottom row of 3 metric stats (142K detections, 38K users, 97.4% accuracy).

**Fields (signup):** Full name, Email, Phone, Password. (signin: Email, Password only.)

**Social login:** Google + **Telegram** (not Apple — Telegram is the local norm in CIS markets).

**Mode switch:** Tab control at top + "Have an account? Sign in" link at bottom. Toggling animates the form without reloading.

**Mobile:** stacks vertically — dark green hero (greeting + tagline) on top, form below.

---

### 2. App shell (used by Upload, Result, Dashboard, History)

**Two-column grid:** `240px sidebar | 1fr main content`.

**Sidebar** (`#0a3d2e` → `#06291e` vertical gradient, white text):
- Logo (`Agrocheck`)
- Section label "Menyu / Menu"
- Nav items (icon + label + optional badge): **Tahlil/Scan**, **Tarix/History** (badge "24"), **Statistika/Stats**, **Kasalliklar/Library**, **Profil/Profile**
- Active item: white text, `rgba(255,255,255,0.10)` background, soft border
- Bottom: "Pro" upsell card + user row (avatar with `KY` initials, name, plan "Free · 6/10")

**Topbar** (sticky, white, `border-bottom`):
- Left: breadcrumb (small caps mono) + serif page title (`30px`)
- Right: optional action button, search input (with `⌘K` hint), notifications bell (with unread dot), `LangSwitch`

**Main content area:** padding `32px`, `#fafaf7` background, scrolls vertically. All page content goes here.

---

### 3. Upload screen (`/scan`)

**Two-column grid:** `1fr | 360px`. Left = action area; right = sticky "Recent scans" rail.

**Left column:**
- **Drop zone** card (white, `border-radius: 22px`, dashed border `2px dashed rgba(10,61,46,0.18)`; on drag-over → border becomes solid primary, slight tinted bg).
  - Inside: large icon tile (84×84, dark green gradient, rounded, with a small gold "AI" pill in top-right corner)
  - Serif headline + muted subtitle
  - Two buttons side-by-side: **Choose file** (primary) + **Use camera** (ghost)
  - Mono hint at bottom: `JPG, PNG · up to 10 MB`
- **Sample images** section (4-column grid): tomato, apple, grape, potato sample cards, each clickable to run a demo scan.

**Right rail (sticky):** "Recent scans" list — 5 rows with thumbnail (with status dot overlay), plant name, disease tag (colored chip), time, confidence percentage. Bottom: monthly usage progress (`24 / 50`).

**Mobile:** stacked. Top: dark green gradient hero with "AI Scanner" pill + serif headline + Camera/Gallery button pair. Below: 3 quick stats, then list of recent scans. Bottom tab bar.

---

### 4. Analyzing screen

Same shell as Upload, but main content is a **two-column** layout:

**Left (1.1fr):** Dark green rounded card (`border-radius: 22px`, `aspect-ratio: 4/5`) containing:
- The uploaded leaf image (or a placeholder for the demo)
- 4 corner brackets (decorative `var(--accent)` L-shapes in each corner)
- An animated horizontal scan line (CSS `@keyframes scanmove` translating top from 30px to bottom and back, 2.4s ease-in-out infinite, glowing gold)
- Top center: "Scanning" pulse pill (lime dot pulsing)
- Bottom HUD chips: `Image: 1024 × 1024` + `Model: Qwen 3.5 · 4B`

**Right column:**
- "AI · Live" pulse pill, big serif title "AI tahlil qilmoqda…", muted subtitle "Qwen 3.5 modeli orqali tahlil qilinmoqda"
- 4-step progress list (vertical):
  1. **Tasvirni qayta ishlash** / Preprocessing image — done
  2. **Xususiyatlarni ajratish** / Extracting features — done
  3. **Klassifikatsiya** / Classification — active (with animated horizontal progress bar)
  4. **Davolash usulini tayyorlash** / Preparing treatment plan — pending
- "Cancel" outline button at bottom

**Important:** The "Extracting features" + "Classification" labels are deliberate — earlier drafts said "Detecting symptoms" and "Matching disease", which falsely implied the model does spot-level detection. Keep the current labels.

**Mobile:** full-screen dark green view. Image at top (smaller, `aspect-ratio: 4/5`, same corner brackets + scan line), 4 steps stacked below. Status bar overlay.

---

### 5. Result screen (CRITICAL — honest classification UI)

Same shell, with `[PDF report]` action in topbar's right slot.

**Two-column grid (1.05fr | 1fr).**

**Left column:**

**(a) Clean leaf image** (`aspect-ratio: 4/3`, dark green gradient bg, leaf centered):
- **NO bounding boxes, NO "SPOT N · X%" labels** — image is clean
- 4 corner brackets (`rgba(255,255,255,0.4)`, 24×24)
- A soft radial lime glow overlay (implies "AI looked at this" without faking localization)
- Top-left chip: "AI tahlil qildi / AI analyzed" (dark blurred)
- Bottom-left card: small mono "Aniqlandi / Detected" label + serif disease name ("Early Blight")
- Bottom-right: big gold confidence badge `97.4%`

**(b) Top-N predictions card** (white, `border-radius: 22px`):
- Header: "Boshqa ehtimoliy variantlar / Other possible matches" + mono tag "Model chiqishi / Model output"
- 4-row list, each row: `180px name column | flex bar | 56px percentage`
  - **Row 1 (top):** highlighted with `var(--primary-soft)` bg + soft border, primary-color text, big dot prefix. Probability bar in primary green.
  - Row 2 (second-best): gold bar
  - Rows 3–4: muted gray bars
- Disease names rendered with their Latin names below in italic muted text
- **Bottom: model-limitation note** with info icon, dashed top border. Exact copy:
  - UZ: "AI butun rasmni ko'rib bir nechta kasallik turlaridan eng ehtimollisini tanlaydi. Barg ustidagi aniq nuqtalarni belgilab bera olmaydi — bu klassifikatsiya modeli, detektsiya emas."
  - EN: "The AI classifies the whole image into one of several disease categories — it does not localize specific spots on the leaf. This is classification, not detection."

**(c) Reference images card:** "Ma'lumotlar bazasidagi shunga o'xshash rasmlar / Similar images from our database" with mono "PlantVillage dataset" tag. 4-column grid of square leaf thumbnails from the training dataset, each with mono dataset ID badge (e.g., `#1247`).

**Right column:**

**(a) Disease header card:**
- Gold "Top prediction" pill (with gold dot)
- Serif disease name (30px) — `Pomidor bargi · Erta dog'lanish` / `Tomato Leaf · Early Blight`
- Italic Latin name muted — `Alternaria solani`
- **Confidence ring** (right side): 80px SVG donut, primary green stroke, value `97.4%` in serif inside + tiny mono "CONF." label below
- Description paragraph (1–2 sentences)
- 3 small "pills" row: Severity / Spread / Season (different tones)

**(b) Treatment plan card:**
- Header: "Davolash bo'yicha tavsiyalar / Treatment plan" + mono badge "4 qadam / 4 steps"
- 4-step ordered list (custom): `01`, `02`, `03`, `04` in primary-soft circles + step text

**(c) Action row:**
- Primary: `+ Yana tahlil / Scan again`
- Secondary outline: `Mutaxassisga yo'llash / Ask an expert`
- Icon-only outline: bookmark

**Mobile:** single column, similar order — image (smaller, `aspect-ratio: 4/3`), disease title, 2-card metrics row (Confidence + Severity), Top-N predictions with mini bars, treatment plan, two-button action row. Standard mobile tab bar.

---

### 6. Dashboard (`/stats`)

Same shell. Right slot in topbar contains a segmented control: `7 / 30 / 90 / Year` (active = primary green pill) + Export button.

**Layout (vertical stack):**

**(a) 4 KPI cards** in a `repeat(4, 1fr)` grid:
1. **Jami tahlillar / Total scans** — `142` · `↑ +12%` · primary sparkline · scan icon
2. **Bu oyda / This month** — `24` · `↑ +8` · gold sparkline · calendar icon
3. **Sog'lom natija / Healthy result** — `38%` · `↓ -4%` · lime sparkline · heart icon
4. **O'rta ishonch / Avg confidence** — `94.2%` · `↑ +1.1%` · green sparkline · trend icon

Each card has a soft radial accent glow in its top-right corner.

**(b) Trend + Donut row** (`1.4fr | 1fr`):

- **Trend chart card:** SVG line chart, 30 days, two series:
  - **Total scans:** solid `#0a3d2e` line with subtle area fill
  - **Diseased:** dashed `#d4a017` line with subtle area fill
  - 5 horizontal grid lines, x-axis labels every 5 days
  - Endpoint highlighted with tooltip badge (`9 scans`)
  - 3 mini-stats footer: Daily avg / Peak day / Healthy %

- **Disease donut card:** circular donut chart, center shows total scans count (serif) + "SCANS" mono. Side legend (6 rows): colored square + name + percentage.

**(c) Plant types + Activity row** (`1.3fr | 1fr`):

- **Plant types card:** 6 horizontal rows, each `130px name | flex bar | 60px stats`. Bar shows healthy (primary) vs diseased (transparent gold) ratio. Legend at bottom.
- **Activity card:** dark green Streak card on top (`12 day streak`, gold trophy icon, longest 28 days). Below: weekday bar chart (Mo–Su), today's bar is gold, others primary; value above each bar, day code below.

**Mobile:** all cards stacked, KPI as 2×2 grid, charts and lists compacted to fit.

---

### 7. History (`/history`)

Same shell. Topbar right slot: Export button.

**Layout (vertical stack):**

**(a) Filter card** (white, `border-radius: 16px`, padding `14px`):
- **Top row:** 4 status filter chips — `Hammasi (15) / Sog'lom (5) / Kasallangan (8) / Past ishonch (2)` + view toggle (List / Gallery)
- **Middle row:** search input (full-width, with magnifier icon) + 3 select buttons: O'simlik (Plant), Davr (Period), Saralash (Sort). Each select shows mono label above + value with dropdown chevron.
- **Bottom row** (dashed top border): summary line ("Showing N of N · Total 142 scans · 88 diseased · 54 healthy") + bulk-action row that appears when items are selected ("3 selected · [Download] [Delete]")

**(b) Grouped results:**
- Groups: `Bugun / Today`, `Kecha / Yesterday`, `Bu hafta / This week`, `Bu oy / This month`
- Group header: small serif title + mono count + horizontal rule

**List view rows** (`auto 60px 1fr 120px 140px 90px auto` grid):
1. Checkbox (primary accent color)
2. Thumbnail (56×56 rounded, with status dot overlay)
3. Plant name + scan ID badge + disease + location (truncated)
4. Status pill (colored bg by status: ok/warn/bad/lowconf)
5. Confidence bar (with color matching status) + percentage below
6. Time (mono)
7. Right arrow button (32×32 outline)

**Gallery view:** `repeat(4, 1fr)` grid of cards. Each card: square thumbnail (with status badge top-left, confidence rosette top-right), then plant name + scan ID, disease, time + location.

**Empty state** (no results): centered dashed card with magnifier icon, serif title "Hech narsa topilmadi" + muted subtitle "Filtrlarni o'zgartirib ko'ring".

**Mobile:** filter chips horizontally scrollable, single-column rows, sticky tab bar.

---

## Design tokens

### Colors

```css
/* Brand */
--primary:       #0a3d2e;  /* dark forest green — sidebars, primary actions */
--primary-2:     #134d3a;  /* primary hover */
--primary-soft:  #e7eee9;  /* light green tint — chips, soft bg */

/* Accent / AI */
--accent:        #d4a017;  /* gold — confidence, highlights, today */
--accent-soft:   #f4e9c8;
--lime:          #84cc16;  /* AI / live / pulse indicators */

/* Status */
--ok:            #1f8a5b;  /* healthy */
--warn:          #d4a017;  /* moderate disease */
--bad:           #b91c1c;  /* severe */
--lowconf:       #9ca3af;  /* low confidence */

/* Ink + surfaces */
--ink:           #0a1f15;  /* primary text */
--ink-2:         #2b3a31;  /* secondary text */
--muted:         #6a7a70;  /* tertiary / labels */
--paper:         #fafaf7;  /* app bg */
--bg:            #ffffff;
--line:          rgba(10, 31, 21, 0.10);
--line-strong:   rgba(10, 31, 21, 0.22);
```

### Typography

```css
--sans:   'Manrope', system-ui, sans-serif;       /* body / UI — weights 400/500/600/700 */
--serif:  'Instrument Serif', Georgia, serif;     /* large headings only */
--mono:   'JetBrains Mono', ui-monospace, monospace; /* labels, numbers, metadata */
```

**Scale (use serif for `≥24px` headings only):**
- Display headlines: serif `36–104px` · `line-height: 1.0–1.05` · `letter-spacing: -0.02em to -0.035em`
- Card titles: sans `14px` · weight `600`
- Body: sans `14–15px` · `line-height: 1.5–1.6`
- Mono labels: `10–11px` · `letter-spacing: 0.08–0.12em` · `text-transform: uppercase`

### Radii

| Component | Radius |
|---|---|
| Buttons, fields | `12px` |
| Small cards, chips | `14–16px` |
| Large cards, panels | `18–22px` |
| Pills | `999px` |
| Avatar | `50%` |

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(10,31,21,0.04), 0 0 0 1px rgba(10,31,21,0.04);
--shadow-md: 0 10px 30px -10px rgba(10,31,21,0.18), 0 2px 6px rgba(10,31,21,0.05);
--shadow-lg: 0 30px 80px -20px rgba(10,31,21,0.25);
```

### Spacing

8px base grid. Common values: `8 / 10 / 12 / 14 / 18 / 22 / 24 / 28 / 32 / 44`.

---

## Reusable components

These are defined in `design-references/shared.jsx` and reused everywhere:

| Component | Purpose |
|---|---|
| `Logo`, `Wordmark` | Brand mark + "Agrocheck" wordmark |
| `LangSwitch` | UZ ↔ EN pill toggle (light / dark tone variants) |
| `Field` | Labeled input with optional left icon, focus ring, light/dark tone |
| `Button` | Primary / accent / ghost / outline variants, light/dark tone |
| `Divider` | "or" rule between sections |
| `ModeTabs` | Sign in / Sign up segmented control |
| `Chip`, `LegendDot`, `MiniStat`, `Card`, `CardHeader` | Repeated atoms in the app pages |
| `LeafSample` | SVG placeholder leaf with optional disease spots — **replace with real `<img>` in production** |
| `ConfidenceRing` | 80px SVG donut showing confidence value |
| `SeverityPill` | Small label+value pill (ok / warn / bad / neutral tones) |
| `Sparkline`, `TrendChart`, `DonutChart` | SVG charts on the dashboard |

---

## State & data shapes

### Auth
```ts
type AuthMode = 'signin' | 'signup';
type Lang = 'UZ' | 'EN';
```

### Scan result (model output)
```ts
type ScanResult = {
  id: string;
  imageUrl: string;
  predictions: Prediction[];   // sorted descending by confidence — always include all known classes
  topPrediction: Prediction;
  createdAt: string;           // ISO
  location?: string;
};

type Prediction = {
  class: string;               // e.g. 'tomato_early_blight'
  displayName: { uz: string; en: string };
  latinName: string;
  confidence: number;          // 0–100
  severity?: 'ok' | 'warn' | 'bad';   // derived in app (e.g., from disease class registry)
};
```

### History item (subset of `ScanResult` for list rendering)
- Plus a `selected` set kept in client state for bulk actions

### Dashboard
- Date range as enum: `7 | 30 | 90 | 365` days
- Aggregations: total, byDay (for trend), byClass (donut), byPlant (bars)

---

## Interactions & motion

- **Form focus:** input border becomes `var(--primary)` + 4px primary-tinted box-shadow ring
- **Buttons:** `transform: translateY(1px)` on mousedown for tactile feedback
- **Mode tabs:** background slides between options, 150ms ease
- **Drop zone:** dashed border becomes solid primary + soft tinted background on drag-over
- **Scan line:** vertical position animates 0→100→0%, 2.4s ease-in-out infinite, glowing gold
- **Pulse dots (AI · Live, Scanning):** opacity 0.5→1, scale 1→1.05, 1s ease-in-out infinite
- **Progress bar (Classification step):** width 0→64% over 2s

---

## Backend integration notes

The HF model returns logits per class. Recommended pipeline:

1. Accept image upload (multipart, max 10 MB, JPG/PNG)
2. Server-side: resize to 1024×1024 (or whatever the model expects — check the model card on HF), center-crop or letterbox, convert to RGB
3. Forward through `deadbear34/qwen35-4b-plantdisease-cpt`
4. Softmax → top-N probabilities
5. Return the `ScanResult` shape above
6. Store image + predictions in the DB for History

**Treatment & description text** should NOT come from the model — maintain a separate disease registry keyed by class label, with localized `uz` + `en` content. Example:

```json
{
  "tomato_early_blight": {
    "displayName": { "uz": "Pomidor · Erta dog'lanish", "en": "Tomato · Early Blight" },
    "latinName": "Alternaria solani",
    "description": { "uz": "…", "en": "…" },
    "treatment": { "uz": ["…", "…", "…", "…"], "en": ["…", "…", "…", "…"] },
    "severity": "warn",
    "spread": "fast",
    "season": "summer"
  }
}
```

The text content currently in the HTML mocks is real-quality (vetted against agronomic sources for Early Blight) but every class needs its own entry. Plan to commission an agronomist to author the full registry.

---

## Authentication

- Email/password + **Google OAuth** + **Telegram Login Widget** (https://core.telegram.org/widgets/login)
- No Apple Sign-In (Apple ID is rare in the target market — the UZ/CIS region)
- Forgot password flow not yet designed — see "open questions" below

---

## Responsive behavior

- Desktop breakpoint: ≥ `1024px` — uses the sidebar shell
- Mobile breakpoint: < `1024px` — collapses to a top bar + bottom tab bar (see `mobile-*.jsx` files); sidebar becomes a slide-in drawer

Each screen has a dedicated mobile design in the `design-references/mobile-*.jsx` files.

---

## Files in this bundle

```
design_handoff_agrocheck/
├── README.md                  ← this file
└── design-references/
    ├── preview.html           ← open in browser to interactively preview every screen
    ├── shared.jsx             ← shared atoms (Button, Field, LangSwitch, T dict, icons)
    ├── variant1.jsx           ← Auth (split-screen — the chosen design)
    ├── mobile.jsx             ← Mobile auth (Variant 1 stacked)
    ├── upload.jsx             ← App shell + Upload + Analyzing + Result screens
    ├── mobile-upload.jsx      ← Mobile counterparts of the above
    ├── dashboard.jsx          ← Dashboard / Statistika (desktop)
    ├── mobile-dashboard.jsx
    ├── history.jsx            ← History / Tarix (desktop, both list + gallery views)
    └── mobile-history.jsx
```

The `shared.jsx` is the foundation — everything else depends on it. The other files are standalone screen modules.

---

## Open questions / future work

These were discussed but not designed yet:

- **Forgot password / password reset** flow
- **Email verification** after signup
- **Disease library / encyclopedia** — searchable browser of all classes the model can identify
- **Onboarding** for first-time users (could be 2–3 screens after signup)
- **Notifications** (irrigation/treatment reminders)
- **Low-confidence handoff** — when top prediction < ~75%, suggest "Send to expert" more prominently
- **Camera capture flow on mobile** — currently the button exists but the camera UI isn't designed
- **PDF report generation** — server-side composition with the image, predictions, description, treatment
- **Pro plan** upsell — sidebar advertises it but no checkout flow exists
- **Geographic dashboard** — map-based view of scans (mentioned but not built)

---

## Brand assets

There are no real logo or photo assets yet — the design uses an SVG leaf-with-circuit mark drawn inline. Before launch, commission:
- A finalized logo (SVG, with light + dark variants)
- Real product photography for the auth brand panel
- Sample leaf photos per disease class for the "Reference images" section (these can come from the PlantVillage dataset — credit accordingly)
