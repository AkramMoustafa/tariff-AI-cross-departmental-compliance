
# src/api/team_service/auditor_service.py

from datetime import datetime, timezone
from psycopg2.extras import Json
from src.api.cli.admin_cli import get_conn
from src.api.cli.email_service import send_generic_email
from src.api.cli.authorization import is_authorized, Role, Resource, Action


class AuditorService:

    @staticmethod
    def list_evidence_requests(session):
        if not is_authorized(
            role=session["active_role"],
            resource=Resource.EVIDENCE,
            action=Action.READ,
        ):
            raise PermissionError("Access denied")

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        er.id,
                        er.description,
                        er.status,
                        COUNT(ef.id) AS file_count
                    FROM evidence_requests er
                    LEFT JOIN evidence_files ef
                        ON ef.evidence_request_id = er.id
                    WHERE er.tenant_id = %s
                    GROUP BY er.id
                    ORDER BY er.created_at DESC
                    """,
                    (session["tenant_id"],)
                )
                return cur.fetchall()

    @staticmethod
    def request_evidence_access(session, evidence_request_id):
        if session["active_role"] != Role.AUDITOR:
            raise PermissionError("Only auditors may request access")

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT 1
                    FROM auditor_evidence_access
                    WHERE tenant_id = %s
                      AND auditor_user_id = %s
                      AND evidence_request_id = %s
                    """,
                    (session["tenant_id"], session["user_id"], evidence_request_id)
                )
                if cur.fetchone():
                    raise ValueError("Access request already exists")

                cur.execute(
                    """
                    INSERT INTO auditor_evidence_access (
                        tenant_id,
                        auditor_user_id,
                        evidence_request_id,
                        status
                    )
                    VALUES (%s, %s, %s, 'REQUESTED')
                    """,
                    (session["tenant_id"], session["user_id"], evidence_request_id)
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
                        "AUDITOR_EVIDENCE_ACCESS_REQUESTED",
                        "EVIDENCE_REQUEST",
                        evidence_request_id,
                    )
                )
                conn.commit()

        AuditorService._notify_compliance_owners(
            session,
            evidence_request_id,
        )

    @staticmethod
    def list_evidence_files(session, evidence_request_id):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT status
                    FROM auditor_evidence_access
                    WHERE tenant_id = %s
                      AND auditor_user_id = %s
                      AND evidence_request_id = %s
                    """,
                    (session["tenant_id"], session["user_id"], evidence_request_id)
                )
                row = cur.fetchone()

                if not row or row[0] != "APPROVED":
                    raise PermissionError("Evidence access not approved")

                cur.execute(
                    """
                    SELECT file_name, uploaded_at
                    FROM evidence_files
                    WHERE evidence_request_id = %s
                    ORDER BY uploaded_at DESC
                    """,
                    (evidence_request_id,)
                )
                return cur.fetchall()

    @staticmethod
    def list_evidence_audit_log(session, evidence_request_id):
        if not is_authorized(
            role=session["active_role"],
            resource=Resource.AUDIT_LOG,
            action=Action.READ,
        ):
            raise PermissionError("Access denied")

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        al.created_at,
                        u.email,
                        al.action
                    FROM audit_log al
                    LEFT JOIN users u ON u.id = al.actor_user_id
                    WHERE al.tenant_id = %s
                      AND al.target_type = 'EVIDENCE_REQUEST'
                      AND al.target_id = %s
                    ORDER BY al.created_at ASC
                    """,
                    (session["tenant_id"], evidence_request_id)
                )
                return cur.fetchall()

    @staticmethod
    def _notify_compliance_owners(session, evidence_request_id):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT u.email
                    FROM users u
                    JOIN user_roles ur ON ur.user_id = u.id
                    JOIN roles r ON r.id = ur.role_id
                    WHERE u.tenant_id = %s
                      AND r.name = 'COMPLIANCE_OWNER'
                      AND u.is_active = TRUE
                    """,
                    (session["tenant_id"],)
                )
                emails = [row[0] for row in cur.fetchall()]

        for email in emails:
            send_generic_email(
                to_email=email,
                subject="Auditor evidence access request",
                body=f"""
Auditor has requested evidence access.

Tenant: {session['tenant_name']}
Evidence Request ID: {evidence_request_id}
Requested by: {session['email']}
"""
            )
