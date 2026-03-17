from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Text,
    ForeignKey,
    JSON,
    Enum as SQLEnum,
    Float,
    Table,
)
from pydantic import BaseModel
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid

from sqlalchemy.dialects.postgresql import UUID
from src.api.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)

    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    active_role = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

class NewsEvent(Base):
    __tablename__ = "news_events"

    id = Column(Integer, primary_key=True)

    country = Column(String, index=True)
    event_type = Column(String)

    risk_level = Column(String)  # low / medium / high
    severity = Column(Integer)

    source_title = Column(String)
    source_url = Column(String)

    event_date = Column(DateTime, index=True)
    discovered_at = Column(DateTime, default=datetime.utcnow)

    created_at = Column(DateTime, default=datetime.utcnow)
    
class SupplierJobPosting(Base):
    __tablename__ = "supplier_job_postings"

    id = Column(Integer, primary_key=True)

    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)

    external_job_id = Column(String, index=True)
    job_title = Column(String)
    location = Column(String)
    country = Column(String)

    date_posted = Column(DateTime)
    discovered_at = Column(DateTime)

    employment_status = Column(String)
    seniority = Column(String)

    technologies = Column(JSON)

    remote = Column(Boolean)

    job_url = Column(String)
    source_url = Column(String)

    snapshot_date = Column(DateTime, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", back_populates="job_postings")

class SupplierRiskSnapshot(Base):
    __tablename__ = "supplier_risk_snapshots"

    id = Column(Integer, primary_key=True, index=True)

    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)

    # Overall risk
    overall_score = Column(Float)
    overall_level = Column(String)
    primary_driver = Column(String)

    # Store full breakdown (your sections dict)
    sections = Column(JSON)

    # Optional: store raw inputs (VERY useful later)
    input_snapshot = Column(JSON, nullable=True)

    # Metadata
    computed_at = Column(DateTime, default=datetime.utcnow, index=True)
    version = Column(String, default="v1")  # if you change scoring logic later

    supplier = relationship("Supplier", backref="risk_snapshots")
    
class SupplierHiringInsight(Base):
    __tablename__ = "supplier_hiring_insights"

    id = Column(Integer, primary_key=True)

    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)

    snapshot_date = Column(DateTime, index=True)

    current_jobs = Column(Integer)
    previous_jobs = Column(Integer)

    trend = Column(String)
    risk_level = Column(String)

    insight = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

class FileExtraction(Base):
    __tablename__ = "file_extractions"

    id = Column(Integer, primary_key=True)
    file_id = Column(String, index=True)

    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    extraction = Column(JSON)
    file_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="file_extractions")


class FileHubFile(Base):
    __tablename__ = "filehub_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_uid = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    file_id = Column(String, unique=True, index=True)
    original_name = Column(String)
    stored_name = Column(String)
    size = Column(Integer)
    file_type = Column(String)
    used_for = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="filehub_files")


class ClientUser(Base):
    __tablename__ = "client_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    api_clients = relationship(
        "ApiClient",
        back_populates="owner",
        cascade="all, delete-orphan",
    )


class ApiClient(Base):
    __tablename__ = "api_clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    owner_client_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("client_users.id", ondelete="SET NULL"),
        nullable=True,
    )
    tier = Column(String, default="free")  # e.g., "free", "startup", "enterprise"
    rate_limit_per_minute = Column(Integer, default=60)
    monthly_quota = Column(Integer, default=1000)
    current_period_usage = Column(Integer, default=0)
    quota_reset_at = Column(DateTime, default=datetime.utcnow)
    
    client_id = Column(String, unique=True, nullable=False, index=True)
    client_secret_hash = Column(String, nullable=False)

    name = Column(String)
    description = Column(Text)

    scopes = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)

    owner = relationship("ClientUser", back_populates="api_clients")



class AuthToken(Base):
    __tablename__ = "auth_tokens"

    id = Column(Integer, primary_key=True)
    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    revoked = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="tokens")

# CDC Core: Departments / Controls


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)

    name = Column(String, nullable=False)
    code = Column(String, nullable=True, unique=True)

    parent_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)

    parent = relationship("Department", remote_side=[id], backref="children")


class ControlStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    DEPRECATED = "DEPRECATED"


class Control(Base):
    __tablename__ = "controls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    regulation_id = Column(Integer, ForeignKey("regulations.id"), nullable=True)

    status = Column(
        SQLEnum(ControlStatus, name="control_status"),
        default=ControlStatus.ACTIVE,
    )
    frequency = Column(String, nullable=True)  # e.g. "ANNUAL", "QUARTERLY"

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department", backref="controls")
    owner = relationship("User", backref="owned_controls")
    regulation = relationship("Regulation", backref="controls")


class ControlAssignmentStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    OVERDUE = "OVERDUE"


class ControlAssignment(Base):
    __tablename__ = "control_assignments"

    id = Column(Integer, primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)

    control_id = Column(UUID(as_uuid=True), ForeignKey("controls.id"))
    assignee_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    escalated_to_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    due_date = Column(DateTime, nullable=True)
    status = Column(
        SQLEnum(ControlAssignmentStatus, name="control_assignment_status"),
        default=ControlAssignmentStatus.OPEN,
    )

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    control = relationship("Control", backref="assignments")
    assignee = relationship(
        "User", foreign_keys=[assignee_user_id], backref="assigned_controls"
    )
    escalated_to = relationship(
        "User", foreign_keys=[escalated_to_user_id], backref="escalated_controls"
    )


# ======================
# Audit Log
# ======================

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    entity_type = Column(String)
    entity_id = Column(Integer)
    action = Column(String)

    actor_label = Column(String)  # e.g., email or name
    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    timestamp = Column(DateTime, default=datetime.utcnow)
    detail = Column(String)

    user = relationship("User", backref="audit_logs")


# ======================
# Demo Requests
# ======================

class DemoRequest(Base):
    __tablename__ = "demo_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)

    company_name = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)  # E.164

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Regulation(Base):
    __tablename__ = "regulations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    agency = Column(String, nullable=True)
    cfr_title = Column(String, nullable=True)
    cfr_part = Column(String, nullable=True)
    document_number = Column(String, unique=True, nullable=True, index=True)
    publication_date = Column(String, nullable=True)
    effective_date = Column(String, nullable=True)
    regulation_type = Column(String, nullable=True)  # "final_rule", "proposed_rule", "notice"
    summary = Column(Text, nullable=True)
    full_text = Column(Text, nullable=True)
    pdf_url = Column(String, nullable=True)
    html_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WorkspaceRegulation(Base):
    __tablename__ = "workspace_regulations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    regulation_id = Column(String, index=True)
    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    workspace_status = Column(String, default="added")
    created_at = Column(DateTime, default=datetime.utcnow)

    name = Column(String, nullable=True)
    code = Column(String, nullable=True)
    region = Column(String, nullable=True)
    category = Column(String, nullable=True)
    risk = Column(String, nullable=True)
    description = Column(String, nullable=True)
    recommended = Column(Boolean, default=False)
    source = Column(String, nullable=True)
    full_text = Column(Text, nullable=True)

    user = relationship("User", backref="workspace_regulations")


# ======================
# CFR Regulations Schema (New Postgres Graph)
# ======================

class CFRTitle(Base):
    __tablename__ = "cfr_titles"
    id = Column(Integer, primary_key=True)
    title_number = Column(Integer, unique=True, index=True)
    name = Column(String)
    amendment_date = Column(String)
    
    chapters = relationship("CFRChapter", back_populates="title")

class CFRChapter(Base):
    __tablename__ = "cfr_chapters"
    id = Column(Integer, primary_key=True)
    title_id = Column(Integer, ForeignKey("cfr_titles.id"))
    chapter_id_code = Column(String) # e.g. "IV"
    heading = Column(String)

    title = relationship("CFRTitle", back_populates="chapters")
    parts = relationship("CFRPart", back_populates="chapter")

class CFRPart(Base):
    __tablename__ = "cfr_parts"
    id = Column(Integer, primary_key=True)
    chapter_id = Column(Integer, ForeignKey("cfr_chapters.id"))
    part_number = Column(String, index=True) # e.g. "164"
    heading = Column(String)

    chapter = relationship("CFRChapter", back_populates="parts")
    sections = relationship("CFRSection", back_populates="part")

class CFRSection(Base):
    __tablename__ = "cfr_sections"
    id = Column(Integer, primary_key=True)
    part_id = Column(Integer, ForeignKey("cfr_parts.id"))
    
    # This matches the ID used in your system: "45-164-164.312"
    full_id = Column(String, unique=True, index=True) 
    section_number = Column(String) # e.g. "164.312"
    heading = Column(String)
    full_text = Column(Text) # The regulation text
    citations = Column(JSON) # List of citations

    part = relationship("CFRPart", back_populates="sections")


# ======================
# Compliance Audits (Replaces Neo4j AuditRun)
# ======================

class ComplianceAudit(Base):
    __tablename__ = "compliance_audits"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    file_id = Column(String, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    compliance_score = Column(Float)
    total_requirements = Column(Integer)
    high_risk_gaps = Column(Integer)
    
    summary_json = Column(JSON) # Store full RAG summary
    
    findings = relationship("AuditFinding", back_populates="audit")

class AuditFinding(Base):
    __tablename__ = "audit_findings"
    id = Column(Integer, primary_key=True)
    audit_id = Column(UUID(as_uuid=True), ForeignKey("compliance_audits.id"))
    
    regulation_id = Column(String) # Links to CFRSection.full_id
    status = Column(String) # "Compliant", "Non-Compliant"
    score = Column(Float)
    risk_rating = Column(String)
    narrative = Column(Text)
    evidence_chunk = Column(Text)
    
    audit = relationship("ComplianceAudit", back_populates="findings")
class SupplierPortSignal(Base):
    __tablename__ = "supplier_port_signals"

    id = Column(Integer, primary_key=True)

    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)

    port_name = Column(String)

    ships_in_area = Column(Integer)
    moving = Column(Integer)
    anchored = Column(Integer)
    entering = Column(Integer)
    leaving = Column(Integer)

    anchorage_ratio = Column(Float)
    mobility_ratio = Column(Float)

    estimated_wait_hours = Column(Float)

    health_score = Column(Integer)
    status = Column(String)

    captured_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", backref="port_signals")
    
class SupplierRegistryInsight(Base):
    __tablename__ = "supplier_registry_insights"

    supplier_id = Column(Integer, ForeignKey("suppliers.id"), primary_key=True)

    snapshot_date = Column(DateTime)

    health_score = Column(Integer)
    status = Column(String)

    signals = Column(JSON)
    risks = Column(JSON)

    directors_count = Column(Integer)
    filings_count = Column(Integer)
    history_count = Column(Integer)

class SupplierRegistryHealth(Base):
    __tablename__ = "supplier_registry_health"

    id = Column(Integer, primary_key=True)

    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)

    health_score = Column(Integer)
    status = Column(String)

    signals = Column(JSON)
    risks = Column(JSON)

    directors = Column(JSON)
    filings = Column(JSON)

    history_count = Column(Integer)

    source_url = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", backref="registry_health")
    
class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)

    client_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("client_users.id"),
        index=True
    )

    name = Column(String, index=True)
    country = Column(String)

    linkedin_company_name = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("ClientUser", backref="suppliers")

    profile = relationship(
        "SupplierProfile",
        back_populates="supplier",
        uselist=False
    )

    job_postings = relationship(
        "SupplierJobPosting",
        back_populates="supplier"
    )
class UserPayment(Base):
    __tablename__ = "user_supayments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    client_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("client_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    stripe_session_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    stripe_customer_id = Column(String, nullable=True)

    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(10), nullable=False, default="usd")

    status = Column(
        String,
        nullable=False,
    )  # 'pending' | 'paid' | 'failed'

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # relationship to client_users (optional but correct)
    client_user = relationship("ClientUser", backref="payments")

class RestrictedCountry(Base):
    __tablename__ = "restricted_countries"

    id = Column(Integer, primary_key=True)
    country_code = Column(String(3), unique=True, index=True)
    country_name = Column(String)
    restriction_type = Column(String)
    severity = Column(String)
    reason = Column(Text)
    effective_date = Column(DateTime)
    expiry_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    source = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TariffRate(Base):
    __tablename__ = "tariff_rates"

    id = Column(Integer, primary_key=True)
    hs_code = Column(String, index=True)
    origin_country = Column(String, index=True)
    destination_country = Column(String, index=True)
    tariff_rate = Column(Float)
    fta_applicable = Column(String, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
    source = Column(String)


# ======================
# Orders / Incidents / Inventory
# ======================

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    DELAYED = "DELAYED"


class QualityIncidentType(str, enum.Enum):
    DEFECT = "DEFECT"
    WRONG_ITEM = "WRONG_ITEM"
    DAMAGED = "DAMAGED"
    MISSING_PARTS = "MISSING_PARTS"
    SPECIFICATION_MISMATCH = "SPECIFICATION_MISMATCH"


class QualityIncidentSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SupplierOrder(Base):
    __tablename__ = "supplier_orders"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)
    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    # Order identification
    order_number = Column(String, unique=True, index=True)
    order_date = Column(DateTime, default=datetime.utcnow)
    expected_delivery_date = Column(DateTime)
    actual_delivery_date = Column(DateTime, nullable=True)

    status = Column(
        SQLEnum(OrderStatus, name="order_status"),
        default=OrderStatus.PENDING,
        index=True,
    )
    is_on_time = Column(Boolean, nullable=True)
    days_delayed = Column(Integer, default=0)

    # Financial details
    item_count = Column(Integer)
    total_value = Column(Float)
    currency = Column(String, default="USD")

    # Quality metrics
    quality_check_passed = Column(Boolean, nullable=True)
    defect_count = Column(Integer, default=0)

    stock_availability_on_order = Column(Boolean, default=True)
    lead_time_accuracy_days = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Tariff calculation details
    estimated_duty = Column(Float, nullable=True)
    duty_effective_rate = Column(Float, nullable=True)
    tariff_log_id = Column(
        Integer,
        ForeignKey("tariff_calculation_logs.id"),
        nullable=True,
    )

    supplier = relationship("Supplier", backref="orders")
    quality_incidents = relationship(
        "QualityIncident", back_populates="order", cascade="all, delete-orphan"
    )
    user = relationship("User", backref="supplier_orders")


class QualityIncident(Base):
    __tablename__ = "quality_incidents"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)
    order_id = Column(Integer, ForeignKey("supplier_orders.id"), nullable=True)
    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    incident_type = Column(
        SQLEnum(QualityIncidentType, name="quality_incident_type")
    )
    severity = Column(
        SQLEnum(QualityIncidentSeverity, name="quality_incident_severity")
    )
    description = Column(Text)

    resolved = Column(Boolean, default=False)
    resolution_date = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    financial_impact = Column(Float, default=0.0)
    items_affected = Column(Integer, default=0)

    reported_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", backref="quality_incidents")
    order = relationship("SupplierOrder", back_populates="quality_incidents")
    user = relationship("User", backref="quality_incidents")


class InventoryEvent(Base):
    __tablename__ = "inventory_events"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)
    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    event_type = Column(String)  # "STOCKOUT", "DELAYED_SHIPMENT", etc.
    item_description = Column(String)
    expected_availability_date = Column(DateTime, nullable=True)
    actual_availability_date = Column(DateTime, nullable=True)

    quantity_affected = Column(Integer)
    days_unavailable = Column(Integer, default=0)

    resolved = Column(Boolean, default=False)

    event_date = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", backref="inventory_events")
    user = relationship("User", backref="inventory_events")


# ======================
# Financial Health / Rating Jobs
# ======================

class SupplierFinancialHealth(Base):
    __tablename__ = "supplier_financial_health"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)

    credit_score = Column(Integer, nullable=True)
    credit_rating = Column(String, nullable=True)  # e.g., "A+", "B", "C"
    payment_behavior = Column(String, nullable=True)  # "ON_TIME", "LATE", etc.

    annual_revenue = Column(Float, nullable=True)
    employee_count = Column(Integer, nullable=True)
    years_in_business = Column(Integer, nullable=True)

    bankruptcy_risk = Column(String, nullable=True)
    legal_issues = Column(Boolean, default=False)

    data_source = Column(String)
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", backref="financial_records")

class SupplierProfile(Base):
    __tablename__ = "supplier_profiles"

    id = Column(Integer, primary_key=True)

    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)

    country_incorporation = Column(String)
    manufacturing_country = Column(String)
    export_port = Column(String)
    invoicing_currency = Column(String)

    incoterm = Column(String)
    payment_terms_days = Column(Integer)
    years_in_operation = Column(Integer)
    revenue_band = Column(String)
    
    material_category = Column(String)
    supplier_tier = Column(String)

    has_trade_compliance_certs = Column(Boolean)
    has_insurance = Column(Boolean)

    single_site = Column(Boolean)
    backup_facility = Column(Boolean)

    avg_lead_time_days = Column(Integer)
    on_time_delivery_pct = Column(Float)
    quality_issues_pct = Column(Float)

    category_volume_share_pct = Column(Float)
    commodity_linked_pricing = Column(Boolean)

    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", back_populates="profile")
    
class MetalPrice(Base):
    __tablename__ = "metal_prices"

    id = Column(Integer, primary_key=True)

    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)

    observation_date = Column(DateTime, index=True)

    metal_code = Column(String(10), index=True)   # XAU, XAG, ALU, etc

    price = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", backref="metal_prices")

class EnergyPrice(Base):
    __tablename__ = "energy_prices"

    id = Column(Integer, primary_key=True)
    observation_date = Column(DateTime, index=True)
    brent = Column(Float)
    natgas = Column(Float)
    coal = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
class ForexRate(Base):
    __tablename__ = "forex_rates"

    id = Column(Integer, primary_key=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)
    observation_date = Column(DateTime, index=True)
    currency_code = Column(String, index=True)
    rate = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    supplier = relationship("Supplier", backref="forex_rates")

class MarketForecast(Base):
    __tablename__ = "market_forecasts"

    id = Column(Integer, primary_key=True)

    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)
    feature = Column(String, index=True)
    last_price = Column(Float)
    forecast_values = Column(JSON)
    trend = Column(String)
    forecast_weeks = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    supplier = relationship("Supplier", backref="market_forecasts")
class RatingRecalculationLog(Base):
    __tablename__ = "rating_recalculation_logs"

    id = Column(Integer, primary_key=True, index=True)

    job_type = Column(String)  # "FULL_RECALCULATION", "INCREMENTAL_UPDATE", etc.
    trigger_event = Column(String, nullable=True)

    suppliers_processed = Column(Integer, default=0)
    suppliers_tier_changed = Column(Integer, default=0)
    execution_time_seconds = Column(Float)

    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    status = Column(String, default="IN_PROGRESS")
    error_message = Column(Text, nullable=True)