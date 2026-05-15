from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..core.database import get_db
from ..models.scan import Scan
from ..models.user import User
from .auth import current_user

router = APIRouter()


@router.get("/")
async def get_stats(
    range_days: int = Query(30, alias="range"),
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=range_days)

    result = await db.execute(
        select(Scan).where(Scan.user_id == user.id, Scan.created_at >= since)
    )
    scans = result.scalars().all()

    total = len(scans)
    healthy = sum(1 for s in scans if s.is_healthy)
    diseased = total - healthy
    avg_confidence = round(sum(s.confidence for s in scans) / total, 1) if total else 0.0

    trend: dict[str, dict] = {}
    for s in scans:
        day = s.created_at.strftime("%Y-%m-%d")
        if day not in trend:
            trend[day] = {"total": 0, "diseased": 0}
        trend[day]["total"] += 1
        if not s.is_healthy:
            trend[day]["diseased"] += 1

    disease_counts: dict[str, int] = {}
    for s in scans:
        if not s.is_healthy:
            disease_counts[s.disease_name] = disease_counts.get(s.disease_name, 0) + 1

    disease_distribution = [
        {"name": name, "count": count}
        for name, count in sorted(disease_counts.items(), key=lambda x: -x[1])
    ]

    all_result = await db.execute(select(func.count()).where(Scan.user_id == user.id))
    all_time_total = all_result.scalar() or 0

    return {
        "total": total,
        "all_time_total": all_time_total,
        "healthy": healthy,
        "diseased": diseased,
        "avg_confidence": avg_confidence,
        "scan_count_month": user.scan_count_month,
        "plan_limit": 10 if user.plan == "free" else None,
        "trend": trend,
        "disease_distribution": disease_distribution,
    }
