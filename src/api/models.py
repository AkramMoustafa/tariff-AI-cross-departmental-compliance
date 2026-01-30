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


class TaskState(str, enum.Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    REVIEW = "REVIEW"
    DONE = "DONE"
    WAIVER = "WAIVER"
    BREACH = "BREACH"


class ObligationInstance(Base):
    __tablename__ = "obligations"

    id = Column(Integer, primary_key=True)
    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    description = Column(String)
    regulation = Column(String)
    due_date = Column(DateTime)

    remediation_tasks = relationship(
        "RemediationTask", back_populates="obligation", cascade="all, delete-orphan"
    )
    user = relationship("User", backref="obligations")


class RemediationTask(Base):
    __tablename__ = "remediation_tasks"

    id = Column(Integer, primary_key=True)
    obligation_id = Column(Integer, ForeignKey("obligations.id"))
    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))

    assigned_to = Column(String)
    sla_due = Column(DateTime)

    state = Column(
        SQLEnum(TaskState, name="task_state"),
        default=TaskState.TODO,
    )
    checklist_template = Column(JSON)
    breach_flag = Column(Boolean, default=False)

    evidence_artifacts = relationship(
        "EvidenceArtifact", back_populates="task", cascade="all, delete-orphan"
    )
    obligation = relationship("ObligationInstance", back_populates="remediation_tasks")
    supplier = relationship("Supplier", back_populates="remediation_tasks")
    user = relationship("User", backref="remediation_tasks")


class EvidenceArtifact(Base):
    __tablename__ = "evidence_artifacts"

    id = Column(Integer, primary_key=True)
    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    task_id = Column(Integer, ForeignKey("remediation_tasks.id"))

    chromadb_id = Column(String)
    valid = Column(Boolean, default=False)
    validation_errors = Column(JSON)
    approved_by = Column(String, nullable=True)
    approved_on = Column(DateTime, nullable=True)
    attestation_hash = Column(String, nullable=True)

    task = relationship("RemediationTask", back_populates="evidence_artifacts")
    user = relationship("User", backref="evidence_artifacts")


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

    id = Column(Integer, primary_key=True)
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

    control_id = Column(Integer, ForeignKey("controls.id"))
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


# ======================
# Suppliers & Supply Chain
# ======================

class SupplierTier(str, enum.Enum):
    TIER_1 = "TIER_1"
    TIER_2 = "TIER_2"
    TIER_3 = "TIER_3"
    UNRATED = "UNRATED"


class SupplierStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    UNDER_REVIEW = "UNDER_REVIEW"
    INACTIVE = "INACTIVE"


supplier_backup_association = Table(
    "supplier_backups",
    Base.metadata,
    Column("primary_supplier_id", Integer, ForeignKey("suppliers.id"), primary_key=True),
    Column("backup_supplier_id", Integer, ForeignKey("suppliers.id"), primary_key=True),
    Column("backup_priority", Integer, default=1),
    Column("created_at", DateTime, default=datetime.utcnow),
)


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True)
    industry = Column(String)
    region = Column(String)
    country = Column(String, index=True)

    user_uid = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    is_verified = Column(Boolean, default=False)
    status = Column(
        SQLEnum(SupplierStatus, name="supplier_status"),
        default=SupplierStatus.ACTIVE,
    )
    opencorporates_verified = Column(Boolean, default=False)
    company_number = Column(String, nullable=True)
    jurisdiction = Column(String, nullable=True)

    tier_level = Column(
        SQLEnum(SupplierTier, name="supplier_tier"),
        default=SupplierTier.UNRATED,
        index=True,
    )
    tier_score = Column(Float, default=0.0)
    tier_last_updated = Column(DateTime, nullable=True)
    tier_change_reason = Column(Text, nullable=True)

    quality_score = Column(Float, default=0.0)
    delivery_score = Column(Float, default=0.0)
    inventory_score = Column(Float, default=0.0)
    financial_health_score = Column(Float, default=0.0)
    compliance_score = Column(Float, default=0.0)

    total_orders = Column(Integer, default=0)
    successful_deliveries = Column(Integer, default=0)
    last_rating_update = Column(DateTime, nullable=True)

    is_restricted_country = Column(Boolean, default=False)
    sanction_check_date = Column(DateTime, nullable=True)
    tariff_code = Column(String, nullable=True)
    estimated_tariff_rate = Column(Float, default=0.0)
    free_trade_agreement = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    remediation_tasks = relationship("RemediationTask", back_populates="supplier")

    backup_for = relationship(
        "Supplier",
        secondary=supplier_backup_association,
        primaryjoin=id == supplier_backup_association.c.backup_supplier_id,
        secondaryjoin=id == supplier_backup_association.c.primary_supplier_id,
        backref="backups",
    )

    user = relationship("User", backref="suppliers")




class UserPayment(Base):
    __tablename__ = "user_payments"

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

class SupplierPerformanceLog(Base):
    __tablename__ = "supplier_performance_logs"

    id = Column(Integer, primary_key=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    quality_score = Column(Float)
    delivery_score = Column(Float)
    inventory_score = Column(Float)
    financial_health_score = Column(Float)
    compliance_score = Column(Float)
    tier_score = Column(Float)
    tier_level = Column(SQLEnum(SupplierTier, name="supplier_tier_log"))

    event_type = Column(String)
    notes = Column(Text, nullable=True)

    supplier = relationship("Supplier", backref="performance_history")


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