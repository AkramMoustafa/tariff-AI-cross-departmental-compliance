
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, JSON, Index
)
from datetime import datetime
from src.api.db import Base


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
    name = Column(String)                          # "US MFN Tariff Schedule"
    effective_from = Column(DateTime)
    effective_to = Column(DateTime, nullable=True)
    source_url = Column(String)


class TariffLine(Base):
    __tablename__ = "tariff_lines"

    id = Column(Integer, primary_key=True)
    tariff_schedule_id = Column(Integer, ForeignKey("tariff_schedules.id"), index=True)
    hs_code_id = Column(Integer, ForeignKey("hs_codes.id"), index=True)

    duty_type = Column(String)      
    rate_type = Column(String)      
    rate_value = Column(Float)

    specific_uom = Column(String, nullable=True)
    applies_on = Column(String)     
    priority = Column(Integer, default=100)

    origin_country = Column(String, nullable=True)  


Index("ix_tariff_lines_lookup", TariffLine.tariff_schedule_id, TariffLine.hs_code_id)


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
