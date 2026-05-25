# 🌾 AGROCHECK - AI-Powered Crop Disease Detection

Agrocheck - bu zamonaviy sun'iy intellekt texnologiyasidan foydalanib o'simlik kasalliklari va zararlarni aniqlaydigan mobil-birinchi web ilovasi.

## 📋 Loyihaning Tavsifi

**AGROCHECK** - qishloq xo'jaligida ishlaydigan fermer va agronomlarga o'simlik sog'lig'ini monitoring qilish va hastaliklari diagnostika qilishda yordam beruvchi platform. Buning uchun:

- 📸 **AI Model** - o'simlik barglarining rasmlarini tahlil qilib, kasallik va zararlarni aniqlaydi
- 🔐 **Foydalanuvchi Autentifikatsiyasi** - JWT token va Google OAuth orqali himoyalangan kirish
- 📊 **Statistika Paneli** - skan tarixini va tahlillarni kuzatish imkoniyati
- ☁️ **Cloud Storage** - MinIO-dan foydalanib rasmlarni xavfsiz saqlash
- 🌐 **REST API** - frontend va backend o'rtasida ma'lumotlar turimosh
- 🐳 **Docker Compose** - oson deployment va local development

---

## 🚀 Texnologiyalar

### Frontend (TypeScript + React + Next.js)
- **Framework**: Next.js 14 (App Router)
- **Tili**: TypeScript (42.4%)
- **Stilyash**: CSS custom variables (Tailwind ishlatilmaydi)
- **Kutubxonalar**: 
  - `react-dom` - React komponenta render qilish
  - `html2canvas` - sahifalarni screenshot qilish
  - `jspdf` - PDF generatsiya

### Backend (Python + FastAPI)
- **Framework**: FastAPI (async)
- **Ma'lumotlar bazasi**: PostgreSQL + SQLAlchemy ORM
- **File Storage**: MinIO (S3-compatible)
- **Authentication**: JWT + Google OAuth 2.0
- **Tili**: Python (17%)
- **Deployment**: Docker + Gunicorn

### AI Model Worker
- **Framework**: FastAPI (async prediction service)
- **Model Loading**: ThreadPoolExecutor orqali background-da
- **Image Processing**: URL dan fetch qilish va klassifikatsiya

### Database
- **PostgreSQL**: Foydalanuvchilar, skanlar, statistika
- **Tables**: `users`, `scans`, `oauth_accounts`, `stats`
- **Migratsiyalar**: Alembic

### Deployment
- **Container**: Docker + docker-compose
- **Services**: 
  - `frontend` - Next.js dev/prod server
  - `main-api` - FastAPI asosiy API
  - `model-worker` - AI inference service
  - `postgres` - Database
  - `minio` - Object storage

---

## 📁 Papka Tuzilmasi

```
AGROCHECK/
├── frontend/                      # Next.js ilovasi
│   ├── app/                       # App router pages
│   ├── components/                # React komponental
│   ├── hooks/                     # Custom hooks
│   ├── utils/                     # Utility funksiyalari
│   └── package.json
│
├── backend/
│   ├── main-api/                  # FastAPI asosiy server
│   │   ├── app/
│   │   │   ├── routers/           # API yo'llari (auth, scans, stats)
│   │   │   ├── models/            # SQLAlchemy DB modellar
│   │   │   ├── schemas/           # Pydantic validation schemas
│   │   │   ├── services/          # Biznes logika
│   │   │   ├── core/              # Config, database, security
│   │   │   └── main.py            # FastAPI app instance
│   │   ├── alembic/               # Database migratsiyalari
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── uvicorn_run.py
│   │
│   └── model-worker/              # AI prediction service
│       ├── app/
│       │   ├── predictor.py       # Model loading + inference
│       │   └── main.py            # FastAPI endpoints
│       ├── requirements.txt
│       ├── Dockerfile
│       └── model.pth              # Pre-trained model
│
├── docs/
│   └── superpowers/               # Specification va plan docs
│
├── design_handoff_agrocheck/      # Dizayn mockuplar
│
├── docker-compose.yml             # Local development
├── docker-compose.prod.yml        # Production deployment
├── .env.example                   # Environment variables template
└── .gitignore
```

---

## 🔧 Setup va Installation

### Talablar
- Docker va docker-compose o'rnatilgan
- Node.js 18+ (agar frontend ni local run qilish bo'lsa)
- Python 3.10+ (agar backend ni local run qilish bo'lsa)

### 1. Repository clonlash

```bash
git clone https://github.com/MuminjonovAsrorbek/AGROCHECK.git
cd AGROCHECK
```

### 2. Environment variables o'rnatish

```bash
cp .env.example .env
```

`.env` faylini tahrirlab qo'yidagi qiymatlarni o'zgartiring:

```dotenv
# PostgreSQL
POSTGRES_USER=agrocheck
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=agrocheck
DATABASE_URL=postgresql+asyncpg://agrocheck:password@postgres:5432/agrocheck

# MinIO (S3-compatible storage)
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=agrocheck-scans

# JWT
JWT_SECRET=your_random_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=3

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Docker Compose orqali run qilish

**Local Development:**
```bash
docker-compose up -d
```

Bu qo'yidagilarni ishga tushiradi:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Model Worker: http://localhost:8001
- MinIO: http://localhost:9001 (admin panel)
- PostgreSQL: localhost:5432

**Production:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Database migratsiyalari

```bash
# Docker container ichida
docker exec -it agrocheck-main-api alembic upgrade head
```

---

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Yangi foydalanuvchi ro'yxatdan o'tish
- `POST /login` - Email va password bilan kirish
- `POST /refresh` - Access token yangilash
- `GET /google/callback` - Google OAuth callback
- `POST /logout` - Logout

### Scans (`/api/scans`)
- `POST /` - Yangi skan yaratish (rasm upload)
- `GET /` - Mening skanlarim ro'yxati
- `GET /{id}` - Bitta skan natijasi
- `DELETE /{id}` - Skan o'chirish

### Statistics (`/api/stats`)
- `GET /summary` - Ushbu oyning statistikasi
- `GET /monthly` - Oylik statistika
- `GET /common-diseases` - Eng ko'p uchraydigan kasalliklar

---

## 🌐 Frontend Routes

| Route | Tavsif |
|-------|--------|
| `/` | `/scan` ga redirect |
| `/auth` | Sign in / Sign up |
| `/scan` | Rasm yuklash sahifasi |
| `/scan/[id]` | Skan natijasi |
| `/dashboard` | Statistika paneli |
| `/history` | Skan tarixini ko'rish |

---

## 🔐 Xavfsizlik

- **JWT Tokens**: Barcha protected endpointlar JWT token talab qiladi
- **Presigned URLs**: MinIO dan rasmlar faqat ruxsat berilgan vaqt uchun (presigned)
- **Rate Limiting**: Free plan oyiga 10 skan (limit), undan oshsa `403` qaytaradi
- **File Validation**: Faqat JPG/PNG, maksimal 10 MB
- **Password**: Bcrypt bilan hash qilingan
- **CORS**: Tanzilangan domen uchun tugatilgan

---

## 🚀 Development Workflow

### Local Development (Docker ishlamaguncha)

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

**Backend (main-api):**
```bash
cd backend/main-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Model Worker:**
```bash
cd backend/model-worker
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/your-feature-name

# Ishlashni tugallash
git add .
git commit -m "feat: add new feature description"
git push origin feature/your-feature-name

# Pull Request yaratish
# GitHub da PR yaratib, main branch ga merge qiling
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       AGROCHECK PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────────────────┐   │
│  │   Frontend       │         │      Backend Services        │   │
│  │   (Next.js 14)   │         │                              │   │
│  │                  │         │  ┌──────────────────────┐    │   │
│  │  - Auth Page     │────────→│  │  Main API (FastAPI)  │    │   │
│  │  - Scan Upload   │ HTTP/   │  │  ├─ /api/auth        │    │   │
│  │  - Results       │ REST    │  │  ├─ /api/scans       │    │   │
│  │  - Dashboard     │         │  │  └─ /api/stats       │    │   │
│  │  - History       │         │  └──────────────────────┘    │   │
│  │                  │         │                              │   │
│  └──────────────────┘         │  ┌──────────────────────┐    │   │
│                               │  │  Model Worker        │    │   │
│                               │  │  /predict            │    │   │
│                               │  └──────────────────────┘    │   │
│                               │                              │   │
│                               └──────────────────────────────┘   │
│                                           │                      │
│                                           │                      │
│  ┌─────────────────────────────────────────┼──────────────────┐  │
│  │         External Services                │                 │  │
│  │                                          ↓                 │  │
│  │  ┌────────────────┐  ┌────────────┐  ┌────────────────┐  │  │
│  │  │  PostgreSQL    │  │   MinIO    │  │  Google OAuth  │  │  │
│  │  │    Database    │  │   Storage  │  │                │  │  │
│  │  └────────────────┘  └────────────┘  └────────────────┘  │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📈 Foydalanuvchi Flow

```
1. Ro'yxatdan o'tish / Kirish
   ↓
2. Rasm yuklash sahifasi
   ├─ Rasm tanlash (kamera yoki gallery)
   ├─ Yuklash
   └─ AI analyze qilishi (progressbar)
   ↓
3. Natija sahifasi
   ├─ Kasallik nomi
   ├─ Foydalanuvchi taklifi
   ├─ Konfidens ball
   ├─ Download PDF
   └─ Share
   ↓
4. Dashboard
   ├─ Oylik statistika
   ├─ Eng ko'p kasalliklar
   └─ Skan tarixini ko'rish
```

---

## 🧪 Testing

Backend API testing:
```bash
# main-api containerida
docker exec -it agrocheck-main-api pytest

# yoki locally
pytest backend/main-api/tests/
```

Frontend testing:
```bash
cd frontend
npm test
```

---

## 📝 Logging

Barcha services loglarni ko'rish:
```bash
docker-compose logs -f
```

Bitta servicening loglarini:
```bash
docker-compose logs -f main-api
```

---

## 🐛 Troubleshooting

### "Connection refused" error
```bash
# Container ishlaganini tekshirish
docker-compose ps

# Agar ishlamasa, restart qilish
docker-compose restart
```

### Database migration errors
```bash
# Container ichida migration reset
docker exec -it agrocheck-main-api alembic downgrade base
docker exec -it agrocheck-main-api alembic upgrade head
```

### Model loading timeout
Model katta bo'lsa, loading vaqti ko'proq bo'ladi. `/health` endpointini tekshiring:
```bash
curl http://localhost:8001/health
```

---

## 📄 Litsenziya

MIT License - qarang [LICENSE](LICENSE) fayl

---

## 👥 Kontributorlari

- **Asrorali Muminjanov** (@MuminjonovAsrorbek) - Founder & Developer

---

## 📞 Bog'lanish

- **Email**: your-email@example.com
- **GitHub**: https://github.com/MuminjonovAsrorbek
- **Telegram**: @your_telegram_handle

---

## 🎯 Tumuski Rejalari

- [ ] Apple App Store-da chiqarish
- [ ] Android Play Store-da chiqarish
- [ ] Multibaholi qo'llab-quvvatlash
- [ ] Offline mode
- [ ] Advanced analytics
- [ ] Multi-image scanning
- [ ] Telegram bot integration

---

**Oxirgi yangilanish**: 2026-05-25 | **Versiya**: 0.1.0
