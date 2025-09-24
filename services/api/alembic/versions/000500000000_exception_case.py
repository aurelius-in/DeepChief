"""exception_case

Revision ID: 000500000000
Revises: 000400000000
Create Date: 2025-09-24 01:05:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '000500000000'
down_revision = '000400000000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'exception_case',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('entity_id', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('root_cause_ranked', sa.JSON(), nullable=False),
        sa.Column('proposed_fix', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('assignee', sa.String(), nullable=True),
        sa.Column('receipt_id', sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('exception_case')


