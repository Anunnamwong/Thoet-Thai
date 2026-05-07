"""add estimated_ready_at to orders

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-02

"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("estimated_ready_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("orders", "estimated_ready_at")
