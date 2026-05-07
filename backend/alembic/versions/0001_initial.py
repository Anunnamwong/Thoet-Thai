"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-04-29

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("line_user_id", sa.String(255), unique=True, nullable=True),
        sa.Column("phone", sa.String(20), unique=True, nullable=True),
        sa.Column("display_name", sa.String(255), nullable=False),
        sa.Column("avatar_url", sa.Text, nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("password_hash", sa.String(255), nullable=True),
        sa.Column("role", sa.String(20), nullable=False, server_default="customer"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("idx_users_line_uid", "users", ["line_user_id"], postgresql_where=sa.text("deleted_at IS NULL"))
    op.create_index("idx_users_phone", "users", ["phone"], postgresql_where=sa.text("deleted_at IS NULL"))
    op.create_index("idx_users_role", "users", ["role"], postgresql_where=sa.text("deleted_at IS NULL"))

    # addresses
    op.create_table(
        "addresses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("label", sa.String(50), nullable=False, server_default="บ้าน"),
        sa.Column("full_address", sa.Text, nullable=False),
        sa.Column("house_number", sa.String(50), nullable=True),
        sa.Column("moo", sa.String(20), nullable=True),
        sa.Column("soi", sa.String(100), nullable=True),
        sa.Column("road", sa.String(100), nullable=True),
        sa.Column("subdistrict", sa.String(100), nullable=True),
        sa.Column("district", sa.String(100), nullable=True),
        sa.Column("province", sa.String(100), nullable=True),
        sa.Column("postal_code", sa.String(10), nullable=True),
        sa.Column("latitude", sa.Float, nullable=True),
        sa.Column("longitude", sa.Float, nullable=True),
        sa.Column("note", sa.Text, nullable=True),
        sa.Column("is_default", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("idx_addresses_user", "addresses", ["user_id"])

    # shops
    op.create_table(
        "shops",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("cover_image_url", sa.Text, nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending_approval"),
        sa.Column("is_open", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("full_address", sa.Text, nullable=True),
        sa.Column("latitude", sa.Float, nullable=True),
        sa.Column("longitude", sa.Float, nullable=True),
        sa.Column("cuisine_types", postgresql.ARRAY(sa.String), nullable=False, server_default="{}"),
        sa.Column("avg_cooking_time", sa.Integer, server_default="15"),
        sa.Column("minimum_order", sa.Integer, server_default="0"),
        sa.Column("delivery_fee", sa.Integer, server_default="15"),
        sa.Column("commission_rate", sa.Numeric(5, 2), server_default="10.00"),
        sa.Column("bank_name", sa.String(100), nullable=True),
        sa.Column("bank_account", sa.String(50), nullable=True),
        sa.Column("bank_account_name", sa.String(255), nullable=True),
        sa.Column("kyc_document_url", sa.Text, nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("idx_shops_owner", "shops", ["owner_id"], postgresql_where=sa.text("deleted_at IS NULL"))
    op.create_index("idx_shops_status", "shops", ["status"], postgresql_where=sa.text("deleted_at IS NULL"))
    op.create_index("idx_shops_location", "shops", ["latitude", "longitude"], postgresql_where=sa.text("deleted_at IS NULL"))

    # shop_hours
    op.create_table(
        "shop_hours",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("shop_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("shops.id", ondelete="CASCADE"), nullable=False),
        sa.Column("day", sa.String(10), nullable=False),
        sa.Column("open_time", sa.Time, nullable=False),
        sa.Column("close_time", sa.Time, nullable=False),
        sa.Column("is_closed", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.UniqueConstraint("shop_id", "day"),
    )
    op.create_index("idx_shop_hours_shop", "shop_hours", ["shop_id"])

    # menu_categories
    op.create_table(
        "menu_categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("shop_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("shops.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("sort_order", sa.Integer, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("idx_menu_categories_shop", "menu_categories", ["shop_id"])

    # menu_items
    op.create_table(
        "menu_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("shop_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("shops.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("menu_categories.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("price", sa.Integer, nullable=False),
        sa.Column("image_url", sa.Text, nullable=True),
        sa.Column("is_available", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("sort_order", sa.Integer, server_default="0"),
        sa.Column("options", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("idx_menu_items_shop", "menu_items", ["shop_id"], postgresql_where=sa.text("deleted_at IS NULL"))
    op.create_index("idx_menu_items_category", "menu_items", ["category_id"], postgresql_where=sa.text("deleted_at IS NULL"))

    # orders
    op.create_table(
        "orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("order_number", sa.String(20), nullable=False, unique=True),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("shop_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("shops.id"), nullable=False),
        sa.Column("rider_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending_payment"),
        sa.Column("status_history", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("delivery_address", sa.Text, nullable=False),
        sa.Column("delivery_latitude", sa.Float, nullable=True),
        sa.Column("delivery_longitude", sa.Float, nullable=True),
        sa.Column("delivery_note", sa.Text, nullable=True),
        sa.Column("subtotal", sa.Integer, nullable=False),
        sa.Column("delivery_fee", sa.Integer, nullable=False),
        sa.Column("discount", sa.Integer, nullable=False, server_default="0"),
        sa.Column("total", sa.Integer, nullable=False),
        sa.Column("payment_method", sa.String(20), nullable=False, server_default="cod"),
        sa.Column("payment_status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("cooking_time", sa.Integer, nullable=True),
        sa.Column("estimated_delivery", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancel_reason", sa.Text, nullable=True),
        sa.Column("promo_code", sa.String(50), nullable=True),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("idx_orders_customer", "orders", ["customer_id"])
    op.create_index("idx_orders_shop", "orders", ["shop_id"])
    op.create_index("idx_orders_rider", "orders", ["rider_id"])
    op.create_index("idx_orders_status", "orders", ["status"])
    op.create_index("idx_orders_created", "orders", [sa.text("created_at DESC")])

    # order_items
    op.create_table(
        "order_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("menu_item_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("menu_items.id"), nullable=False),
        sa.Column("item_name", sa.String(255), nullable=False),
        sa.Column("item_price", sa.Integer, nullable=False),
        sa.Column("quantity", sa.Integer, nullable=False, server_default="1"),
        sa.Column("selected_options", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("special_note", sa.Text, nullable=True),
        sa.Column("line_total", sa.Integer, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("idx_order_items_order", "order_items", ["order_id"])

    # payments
    op.create_table(
        "payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column("method", sa.String(20), nullable=False),
        sa.Column("amount", sa.Integer, nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("promptpay_ref", sa.String(50), nullable=True),
        sa.Column("qr_payload", sa.Text, nullable=True),
        sa.Column("verified_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("slip_image_url", sa.Text, nullable=True),
        sa.Column("collected_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("collected_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("idx_payments_order", "payments", ["order_id"])
    op.create_index("idx_payments_status", "payments", ["status"])

    # rider_profiles
    op.create_table(
        "rider_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="offline"),
        sa.Column("vehicle_type", sa.String(50), server_default="motorcycle"),
        sa.Column("license_plate", sa.String(20), nullable=True),
        sa.Column("current_latitude", sa.Float, nullable=True),
        sa.Column("current_longitude", sa.Float, nullable=True),
        sa.Column("last_location_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id_card_url", sa.Text, nullable=True),
        sa.Column("driving_license_url", sa.Text, nullable=True),
        sa.Column("vehicle_photo_url", sa.Text, nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("bank_name", sa.String(100), nullable=True),
        sa.Column("bank_account", sa.String(50), nullable=True),
        sa.Column("bank_account_name", sa.String(255), nullable=True),
        sa.Column("total_deliveries", sa.Integer, server_default="0"),
        sa.Column("total_earnings", sa.Integer, server_default="0"),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("idx_rider_profiles_user", "rider_profiles", ["user_id"])
    op.create_index("idx_rider_profiles_status", "rider_profiles", ["status"])

    # delivery_jobs
    op.create_table(
        "delivery_jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column("rider_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending"),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("arrived_shop_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("picked_up_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("arrived_customer_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("proof_image_url", sa.Text, nullable=True),
        sa.Column("delivery_fee", sa.Integer, nullable=False),
        sa.Column("tip", sa.Integer, server_default="0"),
        sa.Column("dispatch_attempts", sa.Integer, server_default="0"),
        sa.Column("rejected_by", postgresql.ARRAY(postgresql.UUID(as_uuid=True)), nullable=False, server_default="{}"),
        sa.Column("timeout_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("distance_km", sa.Numeric(5, 2), nullable=True),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("idx_delivery_jobs_order", "delivery_jobs", ["order_id"])
    op.create_index("idx_delivery_jobs_rider", "delivery_jobs", ["rider_id"])
    op.create_index("idx_delivery_jobs_status", "delivery_jobs", ["status"])

    # settlements
    op.create_table(
        "settlements",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("recipient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("recipient_type", sa.String(20), nullable=False),
        sa.Column("period_start", sa.Date, nullable=False),
        sa.Column("period_end", sa.Date, nullable=False),
        sa.Column("gross_amount", sa.Integer, nullable=False),
        sa.Column("commission", sa.Integer, nullable=False, server_default="0"),
        sa.Column("net_amount", sa.Integer, nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("paid_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("transfer_slip", sa.Text, nullable=True),
        sa.Column("bank_ref", sa.String(100), nullable=True),
        sa.Column("order_ids", postgresql.ARRAY(postgresql.UUID(as_uuid=True)), nullable=False, server_default="{}"),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("idx_settlements_recipient", "settlements", ["recipient_id"])
    op.create_index("idx_settlements_status", "settlements", ["status"])

    # promotions
    op.create_table(
        "promotions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("code", sa.String(50), nullable=False, unique=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("rules", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("total_used", sa.Integer, server_default="0"),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("metadata", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )

    # notifications
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("data", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("is_read", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("idx_notifications_user", "notifications", ["user_id", "is_read"])

    # audit_logs
    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("old_value", postgresql.JSONB, nullable=True),
        sa.Column("new_value", postgresql.JSONB, nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("idx_audit_logs_entity", "audit_logs", ["entity_type", "entity_id"])
    op.create_index("idx_audit_logs_actor", "audit_logs", ["actor_id"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("notifications")
    op.drop_table("promotions")
    op.drop_table("settlements")
    op.drop_table("delivery_jobs")
    op.drop_table("rider_profiles")
    op.drop_table("payments")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("menu_items")
    op.drop_table("menu_categories")
    op.drop_table("shop_hours")
    op.drop_table("shops")
    op.drop_table("addresses")
    op.drop_table("users")
