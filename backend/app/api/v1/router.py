from fastapi import APIRouter
from app.api.v1.endpoints import shops, auth, menu, orders, riders, payments, admin, users, ws, misc

api_router = APIRouter()

api_router.include_router(auth.router,     prefix="/auth",     tags=["Auth"])
api_router.include_router(users.router,    prefix="/users",    tags=["Users"])
api_router.include_router(shops.router,    prefix="/shops",    tags=["Shops"])
api_router.include_router(menu.router,     prefix="/menu",     tags=["Menu"])
api_router.include_router(orders.router,   prefix="/orders",   tags=["Orders"])
api_router.include_router(riders.router,   prefix="/riders",   tags=["Riders"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(admin.router,    prefix="/admin",    tags=["Admin"])
api_router.include_router(ws.router,       tags=["WebSocket"])
api_router.include_router(misc.router,     prefix="/misc",     tags=["Utilities"])
