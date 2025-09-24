"""spend_issue

Revision ID: 000600000000
Revises: 000500000000
Create Date: 2025-09-24 01:18:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '000600000000'
down_revision = '000500000000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'spend_issue',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('vendor', sa.String(), nullable=True),
        sa.Column('amount', sa.Numeric(18, 2), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('receipt_id', sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('spend_issue')


