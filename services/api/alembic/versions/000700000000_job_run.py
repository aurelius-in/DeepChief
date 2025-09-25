"""job_run

Revision ID: 000700000000
Revises: 000600000000
Create Date: 2025-09-25 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '000700000000'
down_revision = '000600000000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'job_run',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('agent', sa.String(), nullable=False),
        sa.Column('inputs', sa.JSON(), nullable=False),
        sa.Column('outputs', sa.JSON(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('receipt_id', sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('job_run')


