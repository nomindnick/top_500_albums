"""Complete initial migration with all tables

Revision ID: 001_initial_complete
Revises: 
Create Date: 2025-06-30 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_initial_complete'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Drop existing tables if they exist (in reverse order of dependencies)
    op.execute('DROP TABLE IF EXISTS user_ratings CASCADE')
    op.execute('DROP TABLE IF EXISTS user_progress CASCADE')
    op.execute('DROP TABLE IF EXISTS users CASCADE')
    op.execute('DROP TABLE IF EXISTS albums CASCADE')
    
    # Create albums table first (no foreign keys)
    op.create_table('albums',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.Column('artist', sa.String(length=255), nullable=False),
        sa.Column('album', sa.String(length=255), nullable=False),
        sa.Column('info', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('rank')
    )
    
    # Create users table (no foreign keys)
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=80), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )
    
    # Create user_progress table (has foreign keys)
    op.create_table('user_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('current_album_id', sa.Integer(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['current_album_id'], ['albums.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    
    # Create user_ratings table (has foreign keys)
    op.create_table('user_ratings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('album_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['album_id'], ['albums.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'album_id', name='_user_album_uc')
    )


def downgrade():
    op.drop_table('user_ratings')
    op.drop_table('user_progress')
    op.drop_table('users')
    op.drop_table('albums')