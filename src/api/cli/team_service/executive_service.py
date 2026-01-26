# src/api/team_service/department_owner_service.py

from datetime import datetime, timezone
from src.api.cli.authorization import is_authorized, Role, Resource, Action
from src.api.cli.admin_cli import get_conn
from src.api.cli.email_service import send_generic_email


class ExecutiveService:
    """
    Service layer for C-Suite / Executive Viewer actions.
    """

    @staticmethod
    def _assert_executive(session):
        if session.get("active_role") != Role.EXECUTIVE_VIEWER:
            raise PermissionError("Executive Viewer role required")

    @staticmethod
    def request_information(session, subject: str, details: str | None = None):
        ExecutiveService._assert_executive(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                # Persist request (future-proofing)
                cur.execute(
                    """
                    INSERT INTO executive_requests (
                        tenant_id,
                        requested_by,
                        request_type,
                        subject,
                        details,
                        created_at
                    )
                    VALUES (%s, %s, 'INFO', %s, %s, %s)
                    """,
                    (
                        session["tenant_id"],
                        session["user_id"],
                        subject,
                        details,
                        datetime.now(timezone.utc),
                    )
                )

                # Audit log
                cur.execute(
                    """
                    INSERT INTO audit_log (
                        tenant_id,
                        actor_user_id,
                        action,
                        target_type,
                        metadata
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        session["tenant_id"],
                        session["user_id"],
                        "EXECUTIVE_INFO_REQUESTED",
                        "EXECUTIVE_REQUEST",
                        {
                            "subject": subject,
                            "details": details,
                        },
                    )
                )

                conn.commit()

        ExecutiveService._notify_compliance_owners(
            session,
            subject,
            details,
            request_type="Information Request",
        )

    @staticmethod
    def request_follow_up(session, department_id: str, message: str):
        ExecutiveService._assert_executive(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO executive_requests (
                        tenant_id,
                        requested_by,
                        request_type,
                        department_id,
                        details,
                        created_at
                    )
                    VALUES (%s, %s, 'FOLLOW_UP', %s, %s, %s)
                    """,
                    (
                        session["tenant_id"],
                        session["user_id"],
                        department_id,
                        message,
                        datetime.now(timezone.utc),
                    )
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
                        "EXECUTIVE_FOLLOW_UP_REQUESTED",
                        "DEPARTMENT",
                        department_id,
                        {"message": message},
                    )
                )

                conn.commit()

        ExecutiveService._notify_compliance_owners(
            session,
            f"Follow-up requested for department {department_id}",
            message,
            request_type="Follow-up Request",
        )

    @staticmethod
    def enable_supervise_mode(session, scope: str):
        ExecutiveService._assert_executive(session)

        if scope not in {"tenant", "department"}:
            raise ValueError("Invalid supervise scope")

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO executive_supervision (
                        tenant_id,
                        executive_user_id,
                        scope,
                        enabled_at
                    )
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                    """,
                    (
                        session["tenant_id"],
                        session["user_id"],
                        scope,
                        datetime.now(timezone.utc),
                    )
                )

                cur.execute(
                    """
                    INSERT INTO audit_log (
                        tenant_id,
                        actor_user_id,
                        action,
                        target_type,
                        metadata
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        session["tenant_id"],
                        session["user_id"],
                        "EXECUTIVE_SUPERVISE_ENABLED",
                        "SCOPE",
                        {"scope": scope},
                    )
                )

                conn.commit()

    @staticmethod
    def subscribe_to_notifications(session, topic: str):
        ExecutiveService._assert_executive(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO executive_notification_preferences (
                        user_id,
                        topic,
                        subscribed_at
                    )
                    VALUES (%s, %s, %s)
                    ON CONFLICT DO NOTHING
                    """,
                    (
                        session["user_id"],
                        topic,
                        datetime.now(timezone.utc),
                    )
                )

                cur.execute(
                    """
                    INSERT INTO audit_log (
                        tenant_id,
                        actor_user_id,
                        action,
                        target_type,
                        metadata
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        session["tenant_id"],
                        session["user_id"],
                        "EXECUTIVE_NOTIFICATION_SUBSCRIBED",
                        "NOTIFICATION",
                        {"topic": topic},
                    )
                )

                conn.commit()

    @staticmethod
    def _notify_compliance_owners(session, subject, details, request_type):
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
                subject=f"[Executive] {request_type}",
                body=f"""
An executive has submitted a request.

Tenant: {session['tenant_name']}
Executive: {session['email']}

Subject:
{subject}

Details:
{details or 'None'}
"""
            )
