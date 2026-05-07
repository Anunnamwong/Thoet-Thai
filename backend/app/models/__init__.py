# Import all models here so Alembic can discover them
from app.models.user import User  # noqa: F401
from app.models.address import Address  # noqa: F401
from app.models.shop import Shop, ShopHours  # noqa: F401
from app.models.menu import MenuCategory, MenuItem  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
from app.models.payment import Payment  # noqa: F401
from app.models.rider import RiderProfile, DeliveryJob  # noqa: F401
from app.models.settlement import Settlement  # noqa: F401
from app.models.misc import Promotion, Notification, AuditLog  # noqa: F401
