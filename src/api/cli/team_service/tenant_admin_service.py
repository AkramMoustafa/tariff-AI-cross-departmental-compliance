# src/api/team_service/tenant_admin_service.py

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from psycopg2.extras import Json

from src.api.cli.admin_cli import get_conn
from src.api.cli.email_service import send_generic_email
from src.api.cli.authorization import (
    Role,
    Resource,
    Action,
    is_authorized,
)


class ComplianceOwnerService:
    """
    Backend service for COMPLIANCE_OWNER (Tenant Admin).
    No CLI. No input(). No print().
    """

    # ---------- guards ----------

    @staticmethod
    def _assert_admin(session):
        if Role.COMPLIANCE_OWNER.value not in session["roles"]:
            raise PermissionError("Compliance Owner privileges required")

    # ---------- frameworks ----------

    @staticmethod
    def fetch_frameworks(tenant_id):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        f.id,
                        f.name,
                        f.authority,
                        f.framework_type,
                        f.jurisdiction,
                        COALESCE(tf.status, 'INACTIVE') AS status
                    FROM frameworks f
                    LEFT JOIN tenant_frameworks tf
                      ON tf.framework_id = f.id
                     AND tf.tenant_id = %s
                    WHERE f.created_by_tenant IS NULL
                       OR f.created_by_tenant = %s
                    ORDER BY f.name
                    """,
                    (tenant_id, tenant_id),
                )
                return cur.fetchall()

    @staticmethod
    def set_framework_status(session, framework_id: int, status: str):
        ComplianceOwnerService._assert_admin(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO tenant_frameworks (
                        tenant_id, framework_id, status, activated_by
                    )
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (tenant_id, framework_id)
                    DO UPDATE SET
                        status = EXCLUDED.status,
                        activated_by = EXCLUDED.activated_by,
                        activated_at = now()
                    """,
                    (
                        session["tenant_id"],
                        framework_id,
                        status,
                        session["user_id"],
                    ),
                )
                conn.commit()

    @staticmethod
    def create_custom_framework(
        tenant_id,
        user_id,
        name,
        description=None,
    ):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO frameworks (
                        name,
                        authority,
                        framework_type,
                        jurisdiction,
                        description,
                        created_by_tenant,
                        created_by_user
                    )
                    VALUES (%s, %s, 'CUSTOM', 'TENANT', %s, %s, %s)
                    """,
                    (
                        name,
                        "INTERNAL",
                        description,
                        tenant_id,
                        user_id,
                    ),
                )
                conn.commit()

    # ---------- users / roles ----------

    @staticmethod
    def fetch_users_for_tenant(tenant_id):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        u.id,
                        u.email,
                        u.full_name,
                        u.is_active,
                        u.created_at,
                        u.last_login_at,
                        COALESCE(
                            STRING_AGG(r.name, ', ' ORDER BY r.name),
                            'NONE'
                        ) AS roles
                    FROM users u
                    LEFT JOIN user_roles ur ON ur.user_id = u.id
                    LEFT JOIN roles r ON r.id = ur.role_id
                    WHERE u.tenant_id = %s
                    GROUP BY u.id
                    ORDER BY u.email
                    """,
                    (tenant_id,),
                )
                return cur.fetchall()

    @staticmethod
    def assign_role(user_id: int, role_name: str):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_roles (user_id, role_id)
                    SELECT %s, id FROM roles WHERE name = %s
                    ON CONFLICT DO NOTHING
                    """,
                    (user_id, role_name),
                )
                conn.commit()

    @staticmethod
    def remove_role(user_id: int, role_name: str):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    DELETE FROM user_roles
                    WHERE user_id = %s
                      AND role_id = (
                          SELECT id FROM roles WHERE name = %s
                      )
                    """,
                    (user_id, role_name),
                )
                conn.commit()

    # ---------- departments ----------

    @staticmethod
    def create_department(session, name: str):
        ComplianceOwnerService._assert_admin(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO departments (tenant_id, name)
                    VALUES (%s, %s)
                    """,
                    (session["tenant_id"], name),
                )
                conn.commit()

    @staticmethod
    def assign_user_to_department(user_id: int, department_id: int):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_departments (user_id, department_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                    """,
                    (user_id, department_id),
                )
                conn.commit()

    # ---------- compliance evidence ----------

    @staticmethod
    def issue_compliance_request(
        session,
        requested_from_id: int,
        description: str,
        due_date,
    ):
        ComplianceOwnerService._assert_admin(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO evidence_requests (
                        tenant_id,
                        requested_from,
                        requested_by,
                        description,
                        due_at,
                        status,
                        created_at
                    )
                    VALUES (%s, %s, %s, %s, %s, 'OPEN', %s)
                    """,
                    (
                        session["tenant_id"],
                        requested_from_id,
                        session["user_id"],
                        description,
                        due_date,
                        datetime.now(timezone.utc),
                    ),
                )
                conn.commit()

    @staticmethod
    def review_evidence_submission(
        session,
        request_id: int,
        accept: bool,
        note: Optional[str],
    ):
        ComplianceOwnerService._assert_admin(session)

        new_status = "COMPLETED" if accept else "OPEN"

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE evidence_requests
                    SET status = %s
                    WHERE id = %s
                      AND tenant_id = %s
                      AND requested_by = %s
                    """,
                    (
                        new_status,
                        request_id,
                        session["tenant_id"],
                        session["user_id"],
                    ),
                )

                cur.execute(
                    """
                    INSERT INTO audit_log (
                        tenant_id,
                        actor_user_id,
                        action,
                        target_type,
                        target_id,
                        metadata
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        session["tenant_id"],
                        session["user_id"],
                        "EVIDENCE_ACCEPTED" if accept else "EVIDENCE_REJECTED",
                        "EVIDENCE_REQUEST",
                        request_id,
                        Json({"note": note}),
                    ),
                )

                conn.commit()

    # ---------- auditor access ----------

    @staticmethod
    def fetch_pending_auditor_requests(tenant_id):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        aea.id,
                        aea.evidence_request_id,
                        u.email,
                        aea.requested_at
                    FROM auditor_evidence_access aea
                    JOIN users u ON u.id = aea.auditor_user_id
                    WHERE aea.tenant_id = %s
                      AND aea.status = 'REQUESTED'
                    ORDER BY aea.requested_at
                    """,
                    (tenant_id,),
                )
                return cur.fetchall()

    @staticmethod
    def review_auditor_request(
        session,
        access_id: int,
        evidence_request_id: int,
        auditor_email: str,
        approve: bool,
    ):
        ComplianceOwnerService._assert_admin(session)

        new_status = "APPROVED" if approve else "REJECTED"

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE auditor_evidence_access
                    SET status = %s,
                        reviewed_at = %s
                    WHERE id = %s
                    """,
                    (
                        new_status,
                        datetime.now(timezone.utc),
                        access_id,
                    ),
                )

                cur.execute(
                    """
                    INSERT INTO audit_log (
                        tenant_id,
                        actor_user_id,
                        action,
                        target_type,
                        target_id
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        session["tenant_id"],
                        session["user_id"],
                        f"AUDITOR_EVIDENCE_ACCESS_{new_status}",
                        "EVIDENCE_REQUEST",
                        evidence_request_id,
                    ),
                )

                conn.commit()

        send_generic_email(
            to_email=auditor_email,
            subject=f"Auditor evidence access {new_status.lower()}",
            body=f"""
Your request to access evidence has been {new_status.lower()}.

Tenant: {session['tenant_name']}
Evidence Request ID: {evidence_request_id}
""",
        )

    # ---------- nominations ----------

    @staticmethod
    def fetch_pending_control_owner_nominations(tenant_id):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        n.id,
                        n.control_id,
                        n.nominated_user_id,
                        u.email,
                        d.name,
                        n.created_at
                    FROM control_owner_nominations n
                    JOIN users u ON u.id = n.nominated_user_id
                    LEFT JOIN departments d ON d.id = n.department_id
                    WHERE n.tenant_id = %s
                      AND n.status = 'PENDING'
                    ORDER BY n.created_at
                    """,
                    (tenant_id,),
                )
                return cur.fetchall()

    @staticmethod
    def review_control_owner_nomination(
        session,
        nomination_id: int,
        nominee_user_id: int,
        approve: bool,
    ):
        ComplianceOwnerService._assert_admin(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE control_owner_nominations
                    SET status = %s,
                        reviewed_by = %s,
                        reviewed_at = %s
                    WHERE id = %s
                    """,
                    (
                        "APPROVED" if approve else "REJECTED",
                        session["user_id"],
                        datetime.now(timezone.utc),
                        nomination_id,
                    ),
                )

                if approve:
                    cur.execute(
                        """
                        INSERT INTO user_roles (user_id, role_id)
                        SELECT %s, id FROM roles WHERE name = 'CONTROL_OWNER'
                        ON CONFLICT DO NOTHING
                        """,
                        (nominee_user_id,),
                    )

                conn.commit()
