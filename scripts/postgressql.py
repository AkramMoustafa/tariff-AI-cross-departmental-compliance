import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

def run():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    # Ensure UUID support
    cursor.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    # TENANTS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        full_name TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (tenant_id, email),
        active_role TEXT
    );
    """)


    cursor.execute("""
    CREATE TABLE IF NOT EXISTS file_extractions (
        id BIGSERIAL PRIMARY KEY,
        file_id TEXT NOT NULL,
        user_uid UUID REFERENCES users(id),
        extraction JSONB,
        file_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS suppliers (
        id BIGSERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        industry TEXT,
        region TEXT,
        country TEXT,
        user_uid UUID REFERENCES users(id),

        is_verified BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'ACTIVE',
        opencorporates_verified BOOLEAN DEFAULT FALSE,
        company_number TEXT,
        jurisdiction TEXT,

        tier_level TEXT DEFAULT 'UNRATED',
        tier_score FLOAT DEFAULT 0.0,
        tier_last_updated TIMESTAMPTZ,
        tier_change_reason TEXT,

        quality_score FLOAT DEFAULT 0.0,
        delivery_score FLOAT DEFAULT 0.0,
        inventory_score FLOAT DEFAULT 0.0,
        financial_health_score FLOAT DEFAULT 0.0,
        compliance_score FLOAT DEFAULT 0.0,

        total_orders INTEGER DEFAULT 0,
        successful_deliveries INTEGER DEFAULT 0,
        last_rating_update TIMESTAMPTZ,

        is_restricted_country BOOLEAN DEFAULT FALSE,
        sanction_check_date TIMESTAMPTZ,
        tariff_code TEXT,
        estimated_tariff_rate FLOAT DEFAULT 0.0,
        free_trade_agreement TEXT,

        created_at TIMESTAMPTZ DEFAULT now(),
        last_updated TIMESTAMPTZ DEFAULT now()
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS supplier_backups (
        primary_supplier_id BIGINT REFERENCES suppliers(id) ON DELETE CASCADE,
        backup_supplier_id BIGINT REFERENCES suppliers(id) ON DELETE CASCADE,
        backup_priority INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (primary_supplier_id, backup_supplier_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS supplier_orders (
        id BIGSERIAL PRIMARY KEY,
        supplier_id BIGINT REFERENCES suppliers(id),
        
        user_uid UUID REFERENCES users(id),
        order_number TEXT UNIQUE,
        order_date TIMESTAMPTZ DEFAULT now(),
        expected_delivery_date TIMESTAMPTZ,
        actual_delivery_date TIMESTAMPTZ,

        status TEXT DEFAULT 'PENDING',
        is_on_time BOOLEAN,
        days_delayed INTEGER DEFAULT 0,

        item_count INTEGER,
        total_value FLOAT,
        currency TEXT DEFAULT 'USD',

        quality_check_passed BOOLEAN,
        defect_count INTEGER DEFAULT 0,

        stock_availability_on_order BOOLEAN DEFAULT TRUE,
        lead_time_accuracy_days INTEGER,

        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quality_incidents (
        id BIGSERIAL PRIMARY KEY,
        supplier_id BIGINT REFERENCES suppliers(id),
        order_id BIGINT REFERENCES supplier_orders(id),
        user_uid UUID REFERENCES users(id),

        incident_type TEXT,
        severity TEXT,
        description TEXT,

        resolved BOOLEAN DEFAULT FALSE,
        resolution_date TIMESTAMPTZ,
        resolution_notes TEXT,

        financial_impact FLOAT DEFAULT 0.0,
        items_affected INTEGER DEFAULT 0,

        reported_at TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ DEFAULT now()
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inventory_events (
        id BIGSERIAL PRIMARY KEY,
        supplier_id BIGINT REFERENCES suppliers(id),
        user_uid UUID REFERENCES users(id),

        event_type TEXT,
        item_description TEXT,
        expected_availability_date TIMESTAMPTZ,
        actual_availability_date TIMESTAMPTZ,

        quantity_affected INTEGER,
        days_unavailable INTEGER DEFAULT 0,
        resolved BOOLEAN DEFAULT FALSE,

        event_date TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ DEFAULT now()
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS supplier_financial_health (
        id BIGSERIAL PRIMARY KEY,
        supplier_id BIGINT REFERENCES suppliers(id),

        credit_score INTEGER,
        credit_rating TEXT,
        payment_behavior TEXT,

        annual_revenue FLOAT,
        employee_count INTEGER,
        years_in_business INTEGER,

        bankruptcy_risk TEXT,
        legal_issues BOOLEAN DEFAULT FALSE,

        data_source TEXT,
        last_updated TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ DEFAULT now()
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS supplier_performance_logs (
        id BIGSERIAL PRIMARY KEY,
        supplier_id BIGINT REFERENCES suppliers(id),
        recorded_at TIMESTAMPTZ DEFAULT now(),

        quality_score FLOAT,
        delivery_score FLOAT,
        inventory_score FLOAT,
        financial_health_score FLOAT,
        compliance_score FLOAT,
        tier_score FLOAT,
        tier_level TEXT,

        event_type TEXT,
        notes TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS restricted_countries (
        id BIGSERIAL PRIMARY KEY,
        country_code TEXT UNIQUE,
        country_name TEXT,
        restriction_type TEXT,
        severity TEXT,
        reason TEXT,
        effective_date TIMESTAMPTZ,
        expiry_date TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT TRUE,
        source TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        last_updated TIMESTAMPTZ DEFAULT now()
    );
    """)

    cursor.execute("DROP TABLE IF EXISTS auth_tokens CASCADE;")

    cursor.execute("""
    CREATE TABLE auth_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token TEXT UNIQUE NOT NULL,
        user_uid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """)

    cursor.execute("""
    CREATE INDEX idx_auth_tokens_token
        ON auth_tokens(token);
    """)

    cursor.execute("""
    CREATE INDEX idx_auth_tokens_user_uid
        ON auth_tokens(user_uid);
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tariff_rates (
        id BIGSERIAL PRIMARY KEY,
        hs_code TEXT,
        origin_country TEXT,
        destination_country TEXT,
        tariff_rate FLOAT,
        fta_applicable TEXT,
        last_updated TIMESTAMPTZ DEFAULT now(),
        source TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS obligations (
        id BIGSERIAL PRIMARY KEY,
        user_uid UUID REFERENCES users(id),
        description TEXT,
        regulation TEXT,
        due_date TIMESTAMPTZ
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS remediation_tasks (
        id BIGSERIAL PRIMARY KEY,
        obligation_id BIGINT REFERENCES obligations(id),
        user_uid UUID REFERENCES users(id),
        supplier_id BIGINT REFERENCES suppliers(id),

        assigned_to TEXT,
        sla_due TIMESTAMPTZ,
        state TEXT DEFAULT 'TODO',
        checklist_template JSONB,
        breach_flag BOOLEAN DEFAULT FALSE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence_artifacts (
        id BIGSERIAL PRIMARY KEY,
        user_uid UUID REFERENCES users(id),
        task_id BIGINT REFERENCES remediation_tasks(id),

        chromadb_id TEXT,
        valid BOOLEAN DEFAULT FALSE,
        validation_errors JSONB,
        approved_by TEXT,
        approved_on TIMESTAMPTZ,
        attestation_hash TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workspace_regulations (
        id BIGSERIAL PRIMARY KEY,
        regulation_id TEXT,
        user_uid UUID REFERENCES users(id),
        workspace_status TEXT DEFAULT 'added',
        name TEXT,
        code TEXT,
        region TEXT,
        category TEXT,
        risk TEXT,
        description TEXT,
        recommended BOOLEAN DEFAULT FALSE,
        source TEXT,
        full_text TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rating_recalculation_logs (
        id BIGSERIAL PRIMARY KEY,
        job_type TEXT,
        trigger_event TEXT,
        suppliers_processed INTEGER DEFAULT 0,
        suppliers_tier_changed INTEGER DEFAULT 0,
        execution_time_seconds FLOAT,
        started_at TIMESTAMPTZ DEFAULT now(),
        completed_at TIMESTAMPTZ,
        status TEXT DEFAULT 'IN_PROGRESS',
        error_message TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS regulations (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        agency TEXT,
        cfr_title TEXT,
        cfr_part TEXT,
        document_number TEXT UNIQUE,
        publication_date TEXT,
        effective_date TEXT,
        regulation_type TEXT,
        summary TEXT,
        full_text TEXT,
        pdf_url TEXT,
        html_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );
    """)


    cursor.execute("""CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL,
    actor_user_id UUID,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );"""
    )

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS frameworks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        name TEXT NOT NULL,
        authority TEXT NOT NULL,

        framework_type TEXT NOT NULL CHECK (
            framework_type IN ('REGULATORY', 'STANDARD', 'CUSTOM')
        ),

        jurisdiction TEXT,
        description TEXT,

        -- 👇 THESE TWO COLUMNS ARE WHAT YOUR CODE EXPECTS
        created_by_tenant UUID REFERENCES tenants(id),
        created_by_user UUID REFERENCES users(id),

        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

        UNIQUE (name, created_by_tenant)
    );
    """)
    cursor.execute("""CREATE TABLE IF NOT EXISTS control_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    control_id UUID NOT NULL,
    control_owner_id UUID NOT NULL REFERENCES users(id),
    period_start DATE NOT NULL,
    created_by UUID,
    period_end DATE NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (
        status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'EXCEPTION')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        control_execution_id UUID REFERENCES control_executions(id) ON DELETE CASCADE,
        requested_from UUID NOT NULL REFERENCES users(id),
        requested_by UUID REFERENCES users(id),
        description TEXT NOT NULL,
        due_at TIMESTAMPTZ NOT NULL,
        status TEXT NOT NULL CHECK (
            status IN ('OPEN', 'SUBMITTED', 'COMPLETED', 'OVERDUE', 'WAIVED')
        ),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        completed_at TIMESTAMPTZ
    );
    """)

    cursor.execute("""CREATE TABLE IF NOT EXISTS control_owner_nominations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

        control_id UUID NOT NULL,

        nominated_user_id UUID NOT NULL REFERENCES users(id),

        nominated_by UUID NOT NULL REFERENCES users(id),

        department_id UUID REFERENCES departments(id),

        status TEXT NOT NULL CHECK (
            status IN ('PENDING', 'APPROVED', 'REJECTED')
        ),
        status TEXT NOT NULL CHECK (
            status IN ('PENDING', 'APPROVED', 'REJECTED')
        ),

        rejection_reason TEXT,

        reviewed_by UUID REFERENCES users(id),
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );"""
)

    cursor.execute("""CREATE TABLE IF NOT EXISTS auditor_evidence_access (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        auditor_user_id UUID NOT NULL,
        evidence_request_id UUID NOT NULL,
        status TEXT CHECK (status IN ('REQUESTED', 'APPROVED', 'REJECTED')),
        requested_at TIMESTAMPTZ DEFAULT now(),
        reviewed_at TIMESTAMPTZ
    );""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        evidence_request_id UUID NOT NULL REFERENCES evidence_requests(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_hash TEXT NOT NULL,
        storage_location TEXT NOT NULL,
        uploaded_by UUID REFERENCES users(id),
        uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        document_type TEXT NOT NULL CHECK (
            document_type IN ('POLICY', 'PROCEDURE', 'GUIDELINE', 'REFERENCE')
        ),
        storage_location TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        related_type TEXT NOT NULL,
        related_id UUID NOT NULL,
        file_name TEXT NOT NULL,
        storage_location TEXT NOT NULL,
        uploaded_by UUID REFERENCES users(id),
        uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """)


    cursor.execute(
    """CREATE TABLE IF NOT EXISTS tenant_compliance_owners (
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (tenant_id, user_id)
    );"""
    )

    # AUTH COLUMNS
    cursor.execute("""
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_hash TEXT,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
    """)

    # ROLES
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_roles (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
    );
    """)

    cursor.execute("""
    INSERT INTO roles (name) VALUES
        ('COMPLIANCE_OWNER'),
        ('DEPARTMENT_OWNER'),
        ('CONTROL_OWNER'),
        ('EXECUTIVE_VIEWER'),
        ('AUDITOR')
    ON CONFLICT (name) DO NOTHING;
    """)

    # DEPARTMENTS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (tenant_id, name)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_departments (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, department_id)
    );
    """)

    cursor.close()
    conn.close()

    print("Database initialized successfully (with departments).")

if __name__ == "__main__":
    run()
