# src/api/team_service/control_owner_service.py

from datetime import datetime, timezone
from psycopg2.extras import Json
from src.api.cli.admin_cli import get_conn
from src.api.cli.email_service import send_generic_email
from src.api.cli.authorization import Role


class ControlOwnerService:
    """
    Business logic for CONTROL_OWNER role.
    """

    @staticmethod
    def _assert_control_owner(session):
        if session.get("active_role") != Role.CONTROL_OWNER:
            raise PermissionError("Control Owner privileges required.")

    @staticmethod
    def _fetch_requester_email(request_id):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT u.email
                    FROM evidence_requests er
                    JOIN users u ON u.id = er.requested_by
                    WHERE er.id = %s
                    """,
                    (request_id,)
                )
                row = cur.fetchone()
                return row[0] if row else None

    @staticmethod
    def _fetch_execution_creator_email(execution_id):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT u.email
                    FROM control_executions ce
                    JOIN users u ON u.id = ce.created_by
                    WHERE ce.id = %s
                    """,
                    (execution_id,)
                )
                row = cur.fetchone()
                return row[0] if row else None


    @staticmethod
    def fetch_evidence_tasks(session):
        ControlOwnerService._assert_control_owner(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        er.id,
                        er.description,
                        er.status,
                        er.due_at,
                        er.created_at,
                        COUNT(ef.id) AS evidence_count
                    FROM evidence_requests er
                    LEFT JOIN evidence_files ef
                        ON ef.evidence_request_id = er.id
                    WHERE
                        er.tenant_id = %s
                        AND er.requested_from = %s
                    GROUP BY er.id
                    ORDER BY er.due_at ASC
                    """,
                    (session["tenant_id"], session["user_id"])
                )
                return cur.fetchall()

    @staticmethod
    def submit_evidence(session, request_id, note):
        ControlOwnerService._assert_control_owner(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE evidence_requests
                    SET status = 'SUBMITTED'
                    WHERE id = %s
                      AND requested_from = %s
                      AND tenant_id = %s
                    """,
                    (request_id, session["user_id"], session["tenant_id"])
                )

                if cur.rowcount == 0:
                    raise PermissionError("Evidence request not found or access denied.")

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
                        "EVIDENCE_SUBMITTED",
                        "EVIDENCE_REQUEST",
                        request_id,
                        Json({"note": note}),
                    )
                )

                conn.commit()

        requester_email = ControlOwnerService._fetch_requester_email(request_id)
        if requester_email:
            send_generic_email(
                to_email=requester_email,
                subject="Evidence submitted for review",
                body=f"""
Evidence has been submitted and is awaiting your review.

Request ID: {request_id}
Submitted by: {session['email']}

Response:
{note}
"""
            )

    @staticmethod
    def fetch_control_executions(session):
        ControlOwnerService._assert_control_owner(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        ce.id,
                        ce.control_id,
                        ce.status,
                        ce.period_start,
                        ce.period_end,
                        ce.due_at,
                        ce.completed_at
                    FROM control_executions ce
                    WHERE
                        ce.tenant_id = %s
                        AND ce.control_owner_id = %s
                    ORDER BY ce.due_at ASC
                    """,
                    (session["tenant_id"], session["user_id"])
                )
                return cur.fetchall()

    @staticmethod
    def complete_execution(session, execution_id):
        ControlOwnerService._assert_control_owner(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE control_executions
                    SET status = 'COMPLETED',
                        completed_at = %s
                    WHERE id = %s
                      AND control_owner_id = %s
                      AND tenant_id = %s
                    """,
                    (
                        datetime.now(timezone.utc),
                        execution_id,
                        session["user_id"],
                        session["tenant_id"],
                    )
                )

                if cur.rowcount == 0:
                    raise PermissionError("Execution not found or access denied.")

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
                        "CONTROL_EXECUTION_COMPLETED",
                        "CONTROL_EXECUTION",
                        execution_id,
                    )
                )

                conn.commit()

        creator_email = ControlOwnerService._fetch_execution_creator_email(execution_id)
        if creator_email:
            send_generic_email(
                to_email=creator_email,
                subject="Control execution completed",
                body=f"""
A control execution has been completed.

Execution ID: {execution_id}
Completed by: {session['email']}
Completed at: {datetime.now(timezone.utc)}
"""
            )

    @staticmethod
    def fetch_departments(session):
        ControlOwnerService._assert_control_owner(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT d.id, d.name
                    FROM departments d
                    JOIN user_departments ud ON ud.department_id = d.id
                    WHERE ud.user_id = %s
                    ORDER BY d.name
                    """,
                    (session["user_id"],)
                )
                return cur.fetchall()
