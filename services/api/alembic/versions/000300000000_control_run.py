"""control_run

Revision ID: 000300000000
Revises: 000200000000
Create Date: 2025-09-24 00:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '000300000000'
down_revision = '000200000000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'control_run',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('control_key', sa.String(), nullable=False),
        sa.Column('window_start', sa.Date(), nullable=False),
        sa.Column('window_end', sa.Date(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('findings', sa.JSON(), nullable=False),
        sa.Column('receipt_id', sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('control_run')


