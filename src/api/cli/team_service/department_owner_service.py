# src/api/team_service/department_owner_service.py

from datetime import datetime, timezone
import uuid
from typing import List, Dict, Any

from src.api.cli.authorization import (
    is_authorized,
    Role,
    Resource,
    Action,
)
from src.api.cli.admin_cli import get_conn
from src.api.cli.email_service import send_generic_email


class DepartmentOwnerService:
    """
    Business logic for Department Owner role.
    No CLI, no FastAPI, no printing.
    """

    # ---------- helpers ----------

    @staticmethod
    def _assert_permission(action: Action):
        if not is_authorized(
            role=Role.DEPARTMENT_OWNER,
            resource=Resource.CONTROL_EXECUTIONS,
            action=action,
        ):
            raise PermissionError("Unauthorized")

    @staticmethod
    def _get_department(session) -> tuple[int, str]:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT d.id, d.name
                    FROM departments d
                    JOIN user_departments ud ON ud.department_id = d.id
                    WHERE ud.user_id = %s
                    LIMIT 1
                    """,
                    (session["user_id"],),
                )
                row = cur.fetchone()

        if not row:
            raise ValueError("User is not associated with any department")

        return row[0], row[1]

    # ---------- read operations ----------

    @staticmethod
    def view_department_overview(session) -> Dict[str, Any]:
        DepartmentOwnerService._assert_permission(Action.READ)

        department_id, department_name = DepartmentOwnerService._get_department(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                # users
                cur.execute(
                    """
                    SELECT
                        u.email,
                        BOOL_OR(r.name = 'CONTROL_OWNER') AS is_control_owner
                    FROM users u
                    JOIN user_departments ud ON ud.user_id = u.id
                    LEFT JOIN user_roles ur ON ur.user_id = u.id
                    LEFT JOIN roles r ON r.id = ur.role_id
                    WHERE ud.department_id = %s
                    GROUP BY u.email
                    ORDER BY u.email
                    """,
                    (department_id,),
                )
                users = cur.fetchall()

                # evidence
                cur.execute(
                    """
                    SELECT
                        er.id,
                        er.description,
                        er.status,
                        u.email,
                        er.due_at
                    FROM evidence_requests er
                    JOIN users u ON u.id = er.requested_from
                    JOIN user_departments ud ON ud.user_id = u.id
                    WHERE ud.department_id = %s
                      AND er.tenant_id = %s
                    ORDER BY er.due_at
                    """,
                    (department_id, session["tenant_id"]),
                )
                evidence = cur.fetchall()

        return {
            "department": department_name,
            "users": [
                {
                    "email": email,
                    "role": "CONTROL_OWNER" if is_owner else "USER",
                }
                for email, is_owner in users
            ],
            "evidence_requests": [
                {
                    "id": rid,
                    "description": desc,
                    "status": status,
                    "assigned_to": email,
                    "due_at": due,
                }
                for rid, desc, status, email, due in evidence
            ],
        }

    @staticmethod
    def view_department_health(session) -> Dict[str, Any]:
        DepartmentOwnerService._assert_permission(Action.READ)

        department_id, department_name = DepartmentOwnerService._get_department(session)
        now = datetime.now(timezone.utc)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        COUNT(*) AS total,
                        COUNT(*) FILTER (WHERE er.status = 'COMPLETED') AS completed,
                        COUNT(*) FILTER (WHERE er.status IN ('OPEN', 'SUBMITTED')) AS open,
                        COUNT(*) FILTER (
                            WHERE er.due_at < %s
                              AND er.status != 'COMPLETED'
                        ) AS overdue
                    FROM evidence_requests er
                    JOIN users u ON u.id = er.requested_from
                    JOIN user_departments ud ON ud.user_id = u.id
                    WHERE ud.department_id = %s
                      AND er.tenant_id = %s
                    """,
                    (now, department_id, session["tenant_id"]),
                )
                total, completed, open_, overdue = cur.fetchone()

        if overdue > 0:
            health = "AT_RISK"
        elif open_ > 0:
            health = "NEEDS_ATTENTION"
        else:
            health = "HEALTHY"

        return {
            "department": department_name,
            "total": total,
            "completed": completed,
            "open": open_,
            "overdue": overdue,
            "health": health,
        }

    # ---------- write operations ----------

    @staticmethod
    def issue_evidence_request(
        session,
        requested_from_id: int,
        description: str,
        due_date,
    ):
        if not is_authorized(
            role=Role.DEPARTMENT_OWNER,
            resource=Resource.EVIDENCE_REQUESTS,
            action=Action.CREATE,
        ):
            raise PermissionError("Unauthorized")

        department_id, _ = DepartmentOwnerService._get_department(session)

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
    def create_control_execution(
        session,
        control_owner_id: int,
        period_start,
        period_end,
        due_at,
    ) -> str:
        DepartmentOwnerService._assert_permission(Action.CREATE)

        department_id, _ = DepartmentOwnerService._get_department(session)
        control_id = str(uuid.uuid4())

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO control_executions (
                        tenant_id,
                        control_id,
                        control_owner_id,
                        created_by,
                        period_start,
                        period_end,
                        due_at,
                        status,
                        created_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 'PENDING', %s)
                    """,
                    (
                        session["tenant_id"],
                        control_id,
                        control_owner_id,
                        session["user_id"],
                        period_start,
                        period_end,
                        due_at,
                        datetime.now(timezone.utc),
                    ),
                )
                conn.commit()

        return control_id

    @staticmethod
    def nominate_control_owner(
        session,
        control_id: str,
        nominated_user_id: int,
    ):
        if not is_authorized(
            role=Role.DEPARTMENT_OWNER,
            resource=Resource.CONTROL_EXECUTIONS,
            action=Action.UPDATE,
        ):
            raise PermissionError("Unauthorized")

        department_id, _ = DepartmentOwnerService._get_department(session)

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO control_owner_nominations (
                        tenant_id,
                        control_id,
                        nominated_user_id,
                        nominated_by,
                        department_id,
                        status,
                        created_at
                    )
                    VALUES (%s, %s, %s, %s, %s, 'PENDING', %s)
                    """,
                    (
                        session["tenant_id"],
                        control_id,
                        nominated_user_id,
                        session["user_id"],
                        department_id,
                        datetime.now(timezone.utc),
                    ),
                )
                conn.commit()

        # notify compliance owners
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
                    (session["tenant_id"],),
                )
                emails = [row[0] for row in cur.fetchall()]

        for email in emails:
            send_generic_email(
                to_email=email,
                subject=f"[{session['tenant_name']}] Control Owner Nomination Pending",
                body=f"""
A new Control Owner nomination requires review.

Submitted by: {session['email']}
Department ID: {department_id}
Control ID: {control_id}
Submitted at: {datetime.now(timezone.utc)}
""",
            )
