from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.websocket import manager
from app.core.security import decode_access_token
import structlog

router = APIRouter()
logger = structlog.get_logger()

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str | None = Query(None)
):
    # Try query param, then cookies
    if not token:
        token = websocket.cookies.get("access_token")

    payload = decode_access_token(token) if token else None
    if not payload:
        logger.warning("ws_auth_failed", token_present=bool(token))
        # Keep connection open for a bit then close to avoid 403 HTTP status if possible
        # but starlette/fastapi might have already sent headers
        await websocket.accept()
        await websocket.close(code=4001) # Policy Violation / Auth Failed
        return
    
    user_id = str(payload.get("sub"))
    role = payload.get("role")
    
    if not user_id or not role:
        await websocket.accept()
        await websocket.close(code=4001)
        return
        
    await manager.connect(websocket, user_id, role)
    try:
        while True:
            # Maintain connection. In many cases, we only need server-to-client broadcasts.
            # receive_text() blocks until a message is received.
            data = await websocket.receive_text()
            # If we want to handle client-to-server heartbeats or messages:
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id, role)
    except Exception as e:
        logger.error("ws_error", user_id=user_id, error=str(e))
        manager.disconnect(websocket, user_id, role)
