"""core tables

Revision ID: 000100000000
Revises: 000000000000
Create Date: 2025-09-24 00:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '000100000000'
down_revision = '000000000000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'entity',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('coa_map', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )
    op.create_table(
        'gl_entry',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('entity_id', sa.String(), sa.ForeignKey('entity.id'), nullable=False),
        sa.Column('account', sa.String(), nullable=False),
        sa.Column('amount', sa.Numeric(18, 2), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('source_ref', sa.String(), nullable=True),
    )
    op.create_table(
        'bank_txn',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('account_ref', sa.String(), nullable=False),
        sa.Column('amount', sa.Numeric(18, 2), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('bank_txn')
    op.drop_table('gl_entry')
    op.drop_table('entity')


