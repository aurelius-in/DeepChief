from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .config import settings


engine = create_engine(settings.postgres_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


