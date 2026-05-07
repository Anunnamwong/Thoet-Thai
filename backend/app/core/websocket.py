import json
import asyncio
from typing import Dict, Set
from fastapi import WebSocket
from app.core.config import get_settings
import redis.asyncio as redis
import structlog

settings = get_settings()
logger = structlog.get_logger()

class ConnectionManager:
    def __init__(self):
        # user_id -> set of active WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # role -> set of active WebSockets
        self.role_connections: Dict[str, Set[WebSocket]] = {
            "admin": set(),
            "merchant": set(),
            "rider": set(),
            "customer": set()
        }
        self.redis_client = None
        self.pubsub_task = None

    async def connect(self, websocket: WebSocket, user_id: str, role: str):
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        
        if role in self.role_connections:
            self.role_connections[role].add(websocket)
        
        logger.info("ws_connected", user_id=user_id, role=role)

    def disconnect(self, websocket: WebSocket, user_id: str, role: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        if role in self.role_connections:
            self.role_connections[role].discard(websocket)
            
        logger.info("ws_disconnected", user_id=user_id, role=role)

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            msg_json = json.dumps(message)
            for connection in list(self.active_connections[user_id]):
                try:
                    await connection.send_text(msg_json)
                except Exception:
                    # Connection might be closed
                    pass

    async def broadcast_to_role(self, message: dict, role: str):
        if role in self.role_connections:
            msg_json = json.dumps(message)
            for connection in list(self.role_connections[role]):
                try:
                    await connection.send_text(msg_json)
                except Exception:
                    pass

    async def setup_redis(self):
        if self.redis_client:
            return
            
        try:
            self.redis_client = redis.from_url(settings.redis_url, decode_responses=True)
            # Ping to check if actually connected
            await self.redis_client.ping()
            
            self.pubsub = self.redis_client.pubsub()
            await self.pubsub.subscribe("realtime_events")
            self.pubsub_task = asyncio.create_task(self._redis_listener())
            logger.info("ws_redis_listener_started")
        except Exception as e:
            logger.error("ws_redis_setup_error", error=str(e))
            self.redis_client = None # Ensure fallback to local broadcast

    async def _redis_listener(self):
        try:
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    target_user = data.get("target_user")
                    target_role = data.get("target_role")
                    event_data = data.get("data")
                    
                    if target_user:
                        await self.send_personal_message(event_data, str(target_user))
                    elif target_role:
                        await self.broadcast_to_role(event_data, target_role)
                    else:
                        # Global broadcast (excluding internal fields)
                        for role in self.role_connections:
                            await self.broadcast_to_role(event_data, role)
        except Exception as e:
            logger.error("ws_redis_listener_error", error=str(e))
            # Optional: Add retry logic here

    async def broadcast_event(self, data: dict, target_user: str = None, target_role: str = None):
        """
        Publish an event to Redis so all backend instances can broadcast it.
        We run this as a background task to avoid blocking the main request flow.
        """
        async def _do_publish():
            try:
                if self.redis_client:
                    payload = {
                        "target_user": str(target_user) if target_user else None,
                        "target_role": target_role,
                        "data": data
                    }
                    await self.redis_client.publish("realtime_events", json.dumps(payload))
                else:
                    # Fallback to local broadcast
                    if target_user:
                        await self.send_personal_message(data, str(target_user))
                    elif target_role:
                        await self.broadcast_to_role(data, target_role)
            except Exception as e:
                logger.error("ws_broadcast_error", error=str(e))

        asyncio.create_task(_do_publish())

manager = ConnectionManager()
