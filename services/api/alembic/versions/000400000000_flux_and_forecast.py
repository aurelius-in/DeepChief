"""flux_expl and forecast_snapshot

Revision ID: 000400000000
Revises: 000300000000
Create Date: 2025-09-24 00:55:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '000400000000'
down_revision = '000300000000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'flux_expl',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('entity_id', sa.String(), nullable=False),
        sa.Column('account', sa.String(), nullable=False),
        sa.Column('period', sa.String(), nullable=False),
        sa.Column('drivers', sa.JSON(), nullable=False),
        sa.Column('narrative', sa.String(), nullable=False),
        sa.Column('receipt_id', sa.String(), nullable=True),
    )

    op.create_table(
        'forecast_snapshot',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('period', sa.String(), nullable=False),
        sa.Column('params', sa.JSON(), nullable=False),
        sa.Column('outputs', sa.JSON(), nullable=False),
        sa.Column('receipt_id', sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('forecast_snapshot')
    op.drop_table('flux_expl')


