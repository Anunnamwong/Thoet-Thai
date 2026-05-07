import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog
import sentry_sdk
from sqlalchemy import select, and_
from app.core.config import get_settings
from app.core.database import async_session
from app.models.order import Order
from app.core.notifications import send_line_notify

settings = get_settings()
logger = structlog.get_logger()

if settings.sentry_dsn:
    sentry_sdk.init(dsn=settings.sentry_dsn)

async def stuck_order_monitor():
    """Background task to alert admin if orders are stuck > 30 mins."""
    while True:
        try:
            async with async_session() as db:
                thirty_mins_ago = datetime.now(timezone.utc) - timedelta(minutes=30)
                result = await db.execute(
                    select(Order).where(
                        and_(
                            Order.created_at <= thirty_mins_ago,
                            Order.status.in_(["paid", "preparing", "ready_for_pickup", "rider_assigned"])
                        )
                    )
                )
                stuck_orders = result.scalars().all()
                if stuck_orders:
                    msg = f"\n⚠️ [Alert] พบออเดอร์ค้าง > 30 นาที:\n"
                    for o in stuck_orders:
                        msg += f"- #{o.order_number} ({o.status})\n"
                    msg += "\nกรุณาตรวจสอบหน้า Admin Dashboard"
                    await send_line_notify(msg)
                    logger.info("stuck_orders_alert_sent", count=len(stuck_orders))
        except Exception as e:
            logger.error("stuck_monitor_error", error=str(e))
        
        await asyncio.sleep(300) # Run every 5 minutes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("app_starting", app_name=settings.app_name)
    
    # Initialize WebSocket Redis listener
    from app.core.websocket import manager
    await manager.setup_redis()
    
    # Start background tasks
    monitor_task = asyncio.create_task(stuck_order_monitor())
    
    yield
    # Shutdown
    logger.info("app_stopping")
    monitor_task.cancel()

app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
async def health():
    # Check redis status
    from app.core.websocket import manager
    redis_status = "connected" if manager.redis_client else "not_connected"
    
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": "0.1.0",
        "debug": settings.debug,
        "redis": redis_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# API routes
from app.api.v1.router import api_router
app.include_router(api_router, prefix=settings.api_prefix)
