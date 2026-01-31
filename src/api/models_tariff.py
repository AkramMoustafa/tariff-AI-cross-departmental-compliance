
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, JSON, Index
)
from datetime import datetime
from src.api.db import Base
from src.api.models import TariffLine

class HSCode(Base):
    __tablename__ = "hs_codes"

    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, index=True) 
    description = Column(String)
    chapter = Column(String, index=True)


class TariffSchedule(Base):
    __tablename__ = "tariff_schedules"

    id = Column(Integer, primary_key=True)
    country = Column(String, index=True)           
    name = Column(String)                         
    effective_from = Column(DateTime)
    effective_to = Column(DateTime, nullable=True)
    source_url = Column(String)



class TariffCalculationLog(Base):
    __tablename__ = "tariff_calculation_logs"

    id = Column(Integer, primary_key=True)
    user_uid = Column(String, index=True)

    hs_code = Column(String, index=True)
    origin_country = Column(String)
    destination_country = Column(String)

    customs_value = Column(Float)
    freight = Column(Float)
    insurance = Column(Float)
    quantity = Column(Float)
    currency = Column(String)

    result_json = Column(JSON)
    total_duty = Column(Float)
    effective_rate = Column(Float)

    tariff_schedule_id = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
