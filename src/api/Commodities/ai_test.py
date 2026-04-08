from src.api.db import SessionLocal
from src.api.models import MetalPrice, ForexRate, EnergyPrice
import pandas as pd

db = SessionLocal()

metals = pd.read_sql(db.query(MetalPrice).statement, db.bind)
forex = pd.read_sql(db.query(ForexRate).statement, db.bind)
energy = pd.read_sql(db.query(EnergyPrice).statement, db.bind)

db.close()