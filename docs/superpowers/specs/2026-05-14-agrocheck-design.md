# Agrocheck — Design Spec
**Date:** 2026-05-14  
**Stack:** Next.js 14 (frontend) · FastAPI (backend) · PostgreSQL · MinIO · Docker Compose

---

## 1. Overview

Agrocheck — o'simlik bargining rasmini yuklab kasallikni aniqlash web ilovasi. Foydalanuvchi rasm yuklaydi, AI model kasallik nomini, ishonch darajasini va davolash tavsiyasini qaytaradi. Natijalar saqlanadi, statistika va tarix ko'rinadi.

**AI Model:** `deadbear34/qwen35-4b-plantdisease-cpt` (HuggingFace, local inference)  
**Dizayn til:** Dizayn fayllar: `design_handoff_agrocheck/design-references/`

---

## 2. Arxitektura

### Containerlar (Docker Compose)

| Container | Texnologiya | Port | Vazifa |
|---|---|---|---|
| `frontend` | Next.js 14 | 3000 | UI |
| `main-api` | FastAPI | 8000 | Biznes logika, auth, DB |
| `model-worker` | FastAPI + transformers | 8001 | Model inference |
| `postgres` | PostgreSQL 16 | 5432 | Ma'lumotlar bazasi |
| `minio` | MinIO | 9000/9001 | Rasm saqlash |

### Oqim

```
Frontend → main-api (rasm yuklash)
main-api → MinIO (rasmni saqlaydi)
main-api → model-worker POST /predict {image_url}
model-worker → MinIO (rasmni o'qiydi) → model inference
model-worker → main-api {disease, confidence, predictions}
main-api → PostgreSQL (natijani yozadi)
main-api → Frontend (natijani qaytaradi)
```

---

## 3. Autentifikatsiya

**Usul:** JWT (access token 15 min, refresh token 30 kun)  
**Provayderlar:**
- Email + parol (bcrypt hash)
- Google OAuth2
- Telegram Login Widget

**Til:** UZ / EN (frontend state, backendga ta'sir qilmaydi)

---

## 4. Ma'lumotlar bazasi (PostgreSQL)

```sql
-- Foydalanuvchilar
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    password_hash TEXT,                    -- NULL bo'lishi mumkin (OAuth users)
    full_name   TEXT NOT NULL,
    phone       TEXT,
    plan        TEXT DEFAULT 'free',       -- 'free' | 'pro'
    scan_count  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Tahlil natijalari
CREATE TABLE scans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    image_url       TEXT NOT NULL,          -- MinIO URL
    disease_name    TEXT NOT NULL,
    disease_latin   TEXT,
    confidence      FLOAT NOT NULL,
    severity        TEXT,                   -- 'healthy' | 'mild' | 'moderate' | 'severe'
    predictions     JSONB NOT NULL,         -- [{name, latin, confidence}]
    treatment_steps JSONB,                  -- [{step}]
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- OAuth akkauntlar
CREATE TABLE oauth_accounts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    provider    TEXT NOT NULL,              -- 'google' | 'telegram'
    provider_id TEXT NOT NULL,
    UNIQUE(provider, provider_id)
);
```

**Cheklov (free plan):** oyiga 10 ta scan.

---

## 5. API Endpointlar

### Auth (`/api/auth`)
| Method | Path | Tavsif |
|---|---|---|
| POST | `/register` | email, parol, full_name, phone → JWT |
| POST | `/login` | email, parol → JWT |
| POST | `/refresh` | refresh_token → yangi access_token |
| GET | `/me` | joriy foydalanuvchi ma'lumoti |
| GET | `/google` | Google OAuth redirect |
| GET | `/google/callback` | Google OAuth callback |
| POST | `/telegram` | Telegram login data verify → JWT |

### Scans (`/api/scans`)
| Method | Path | Tavsif |
|---|---|---|
| POST | `/upload` | multipart/form-data rasm → natija |
| GET | `/` | tarix (filter: status, plant, period; pagination) |
| GET | `/{id}` | bitta scan natijasi |
| DELETE | `/{id}` | scan o'chirish |

### Stats (`/api/stats`)
| Method | Path | Tavsif |
|---|---|---|
| GET | `/` | KPI + trend + kasallik taqsimoti (range: 7/30/90/365) |

### Model Worker (ichki, `http://model-worker:8001`)
| Method | Path | Tavsif |
|---|---|---|
| POST | `/predict` | `{image_url}` → `{disease, confidence, predictions[]}` |
| GET | `/health` | model tayyor holati |

---

## 6. Rasm saqlash (MinIO)

- Bucket: `agrocheck-scans`
- Path: `scans/{user_id}/{scan_id}.jpg`
- main-api presigned URL orqali rasmni saqlaydi
- model-worker presigned URL orqali rasmni o'qiydi
- Public ko'rinish: yo'q (faqat presigned URL orqali)

---

## 7. Model Worker

**Model:** `deadbear34/qwen35-4b-plantdisease-cpt`  
**Kutubxona:** `transformers` + `torch`  
**Yuklash:** container start bo'lganda model bir marta yuklanadi (warm-up)  
**Input:** rasm URL (MinIO presigned)  
**Output:**
```json
{
  "disease": "Early Blight",
  "disease_latin": "Alternaria solani",
  "confidence": 97.4,
  "severity": "moderate",
  "predictions": [
    {"name": "Early Blight", "latin": "Alternaria solani", "confidence": 97.4},
    {"name": "Late Blight",  "latin": "Phytophthora infestans", "confidence": 1.8}
  ]
}
```

---

## 8. Frontend Sahifalar (Next.js 14 App Router)

| Route | Komponent | Tavsif |
|---|---|---|
| `/` | redirect → `/scan` | |
| `/auth` | `AuthPage` | Sign in / Sign up (variant1.jsx) |
| `/scan` | `UploadPage` | Rasm yuklash (upload.jsx) |
| `/scan/analyzing` | `AnalyzingPage` | AI ishlayapti (upload.jsx AnalyzingScreen) |
| `/scan/[id]` | `ResultPage` | Natija (upload.jsx ResultScreen) |
| `/dashboard` | `DashboardPage` | Statistika (dashboard.jsx) |
| `/history` | `HistoryPage` | Tarix (history.jsx) |

**State management:** React Context (auth) + server-side fetch (scan data)  
**HTTP client:** `fetch` + custom hooks  
**Stil:** dizayndagi CSS tokenlar (CSS variables, inline styles) — Tailwind ishlatilmaydi

---

## 9. Docker Compose tuzilmasi

```
agrocheck/
├── frontend/          # Next.js
├── backend/
│   ├── main-api/      # FastAPI biznes logika
│   └── model-worker/  # FastAPI + model
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

**Muhit o'zgaruvchilari (.env):**
```
POSTGRES_URL=postgresql://...
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
TELEGRAM_BOT_TOKEN=...
MODEL_WORKER_URL=http://model-worker:8001
```

---

## 10. Xavfsizlik

- Barcha endpointlar (scan, stats, history) JWT talab qiladi
- Rasm URL lar presigned (vaqtinchalik, faqat ruxsat berilgan foydalanuvchilarga)
- Free plan: oyiga 10 scan, undan oshsa `403` qaytaradi
- File upload: faqat JPG/PNG, max 10 MB

---

## 11. Loyiha papka tuzilmasi

```
AGROCHECK/
├── design_handoff_agrocheck/   # Dizayn (o'zgartirilmaydi)
├── docs/superpowers/specs/     # Ushbu spec
├── frontend/                   # Next.js ilovasi
├── backend/
│   ├── main-api/               # FastAPI
│   │   ├── app/
│   │   │   ├── routers/        # auth, scans, stats
│   │   │   ├── models/         # SQLAlchemy models
│   │   │   ├── schemas/        # Pydantic schemas
│   │   │   ├── services/       # biznes logika
│   │   │   └── main.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── model-worker/
│       ├── app/
│       │   ├── predictor.py    # model yuklash va inference
│       │   └── main.py
│       ├── requirements.txt
│       └── Dockerfile
├── docker-compose.yml
└── .env.example
```
