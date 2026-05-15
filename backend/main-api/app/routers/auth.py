import hashlib
import hmac
import time
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..core.config import settings
from ..core.database import get_db
from ..core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from ..models.user import OAuthAccount, User
from ..schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TelegramLoginRequest,
    TokenResponse,
    UserOut,
)

router = APIRouter()
bearer = HTTPBearer()


# ── Dependency: current authenticated user ────────────────────────────────────

async def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await db.get(User, uuid.UUID(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ── Email/password auth ───────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        phone=body.phone,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    return TokenResponse(
        access_token=create_access_token(payload["sub"]),
        refresh_token=create_refresh_token(payload["sub"]),
    )


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(current_user)):
    return user


# ── Google OAuth ──────────────────────────────────────────────────────────────

@router.get("/google")
async def google_login():
    params = (
        f"client_id={settings.google_client_id}"
        f"&redirect_uri={settings.google_redirect_uri}"
        f"&response_type=code"
        f"&scope=openid%20email%20profile"
    )
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        token_resp.raise_for_status()
        token_data = token_resp.json()

        user_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        user_resp.raise_for_status()
        google_user = user_resp.json()

    google_id = str(google_user["id"])
    email = google_user["email"]
    full_name = google_user.get("name", email)

    oauth_res = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == "google",
            OAuthAccount.provider_id == google_id,
        )
    )
    oauth = oauth_res.scalar_one_or_none()

    if oauth:
        user = await db.get(User, oauth.user_id)
    else:
        user_res = await db.execute(select(User).where(User.email == email))
        user = user_res.scalar_one_or_none()
        if not user:
            user = User(email=email, full_name=full_name)
            db.add(user)
            await db.flush()
        oauth = OAuthAccount(user_id=user.id, provider="google", provider_id=google_id)
        db.add(oauth)
        await db.commit()
        await db.refresh(user)

    access = create_access_token(str(user.id))
    refresh_tok = create_refresh_token(str(user.id))
    return RedirectResponse(
        f"http://localhost:3000/auth/callback?access={access}&refresh={refresh_tok}"
    )


# ── Telegram OAuth ────────────────────────────────────────────────────────────

@router.post("/telegram", response_model=TokenResponse)
async def telegram_login(body: TelegramLoginRequest, db: AsyncSession = Depends(get_db)):
    # Verify HMAC signature
    data_check_string = "\n".join(
        f"{k}={v}"
        for k, v in sorted(body.model_dump(exclude={"hash"}).items())
        if v is not None
    )
    secret_key = hashlib.sha256(settings.telegram_bot_token.encode()).digest()
    computed = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(computed, body.hash):
        raise HTTPException(status_code=401, detail="Invalid Telegram auth signature")
    if time.time() - body.auth_date > 86400:
        raise HTTPException(status_code=401, detail="Telegram auth data expired")

    telegram_id = str(body.id)
    full_name = body.first_name + (f" {body.last_name}" if body.last_name else "")
    email = f"telegram_{telegram_id}@agrocheck.local"

    oauth_res = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == "telegram",
            OAuthAccount.provider_id == telegram_id,
        )
    )
    oauth = oauth_res.scalar_one_or_none()

    if oauth:
        user = await db.get(User, oauth.user_id)
    else:
        user = User(email=email, full_name=full_name)
        db.add(user)
        await db.flush()
        oauth = OAuthAccount(user_id=user.id, provider="telegram", provider_id=telegram_id)
        db.add(oauth)
        await db.commit()
        await db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )
