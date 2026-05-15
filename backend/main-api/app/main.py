from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.auth import router as auth_router
from .routers.scans import router as scans_router
from .routers.stats import router as stats_router

app = FastAPI(title="Agrocheck API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(scans_router, prefix="/api/scans", tags=["scans"])
app.include_router(stats_router, prefix="/api/stats", tags=["stats"])


@app.get("/health")
async def health():
    return {"status": "ok"}
