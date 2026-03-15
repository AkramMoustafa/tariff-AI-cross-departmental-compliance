from src.api.db import Base, engine
from src.api.models import *

Base.metadata.create_all(bind=engine)

print("Database tables created.")