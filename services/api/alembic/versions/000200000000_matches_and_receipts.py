"""reconcile_match, evidence_receipt, policy_version

Revision ID: 000200000000
Revises: 000100000000
Create Date: 2025-09-24 00:25:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '000200000000'
down_revision = '000100000000'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'reconcile_match',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('gl_entry_id', sa.String(), sa.ForeignKey('gl_entry.id'), nullable=False),
        sa.Column('bank_txn_id', sa.String(), sa.ForeignKey('bank_txn.id'), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('receipt_id', sa.String(), nullable=True),
    )

    op.create_table(
        'evidence_receipt',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('sha256_b64', sa.String(), nullable=False),
        sa.Column('signed_hash_b64', sa.String(), nullable=False),
        sa.Column('public_key_b64', sa.String(), nullable=False),
        sa.Column('payload_url', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )

    op.create_table(
        'policy_version',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('key', sa.String(), nullable=False),
        sa.Column('yaml', sa.Text(), nullable=False),
        sa.Column('checksum', sa.String(), nullable=False),
        sa.Column('active', sa.Boolean(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('policy_version')
    op.drop_table('evidence_receipt')
    op.drop_table('reconcile_match')


