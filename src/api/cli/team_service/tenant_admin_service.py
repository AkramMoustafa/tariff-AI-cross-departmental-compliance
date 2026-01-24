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

    @staticmethod
    def set_active_role(session, role: str):
        user_id = session["user_id"]

        # 🔒 validate role belongs to user
        if role not in session["roles"]:
            raise PermissionError("Role not assigned to user")

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE users
                    SET active_role = %s
                    WHERE id = %s
                    """,
                    (role, user_id),
                )

        return {
            "active_role": role
        }
    """
    Backend service for COMPLIANCE_OWNER (Tenant Admin).
    No CLI. No input(). No print().
    """
    @staticmethod
    def get_user_context(session):
        """
        Returns the authenticated user's context:
        - user_id
        - tenant_id
        - roles
        - active_role

        This is READ-ONLY and safe to call during auth/session hydration.
        """
        user_id = session["user_id"]
        tenant_id = session["tenant_id"]

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        u.id,
                        u.email,
                        u.full_name,
                        u.active_role,
                        ARRAY_AGG(r.name ORDER BY r.name) AS roles
                    FROM users u
                    JOIN user_roles ur ON ur.user_id = u.id
                    JOIN roles r ON r.id = ur.role_id
                    WHERE u.id = %s
                    GROUP BY u.id
                    """,
                    (user_id,),
                )

                row = cur.fetchone()
                if not row:
                    raise PermissionError("User not found")

                (
                    uid,
                    email,
                    full_name,
                    active_role,
                    roles,
                ) = row

        return {
            "user_id": str(uid),
            "tenant_id": str(tenant_id),
            "email": email,
            "full_name": full_name,
            "roles": roles or [],
            "active_role": active_role,
        }

    @staticmethod
    def get_controls_overview(session):
        """
        High-level control execution visibility for Compliance Owner.
        One row per control_id, aggregated from control_executions.
        """
        ComplianceOwnerService._assert_admin(session)
        tenant_id = session["tenant_id"]

        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        ce.control_id,

                        COUNT(*) AS total_runs,

                        COUNT(*) FILTER (
                            WHERE ce.status = 'COMPLETED'
                        ) AS completed,

                        COUNT(*) FILTER (
                            WHERE ce.status IN ('PENDING', 'IN_PROGRESS')
                              AND ce.due_at >= now()
                        ) AS in_progress,

                        COUNT(*) FILTER (
                            WHERE ce.due_at < now()
                              AND ce.status NOT IN ('COMPLETED')
                        ) AS overdue,

                        COUNT(*) FILTER (
                            WHERE ce.status = 'EXCEPTION'
                        ) AS exceptions,

                        MIN(ce.due_at) FILTER (
                            WHERE ce.status IN ('PENDING', 'IN_PROGRESS')
                              AND ce.due_at >= now()
                        ) AS next_due_at

                    FROM control_executions ce
                    WHERE ce.tenant_id = %s
                    GROUP BY ce.control_id
                    ORDER BY overdue DESC, exceptions DESC
                    """,
                    (tenant_id,),
                )

                controls = []
                for (
                    control_id,
                    total_runs,
                    completed,
                    in_progress,
                    overdue,
                    exceptions,
                    next_due_at,
                ) in cur.fetchall():

                    # Risk is derived strictly from execution state
                    if overdue > 0 or exceptions > 0:
                        risk_level = "HIGH"
                    elif in_progress > 0:
                        risk_level = "MEDIUM"
                    else:
                        risk_level = "LOW"

                    controls.append({
                        "controlId": str(control_id),
                        "runs": total_runs,
                        "completed": completed,
                        "inProgress": in_progress,
                        "overdue": overdue,
                        "exceptions": exceptions,
                        "nextDueAt": (
                            next_due_at.isoformat()
                            if next_due_at else None
                        ),
                        "riskLevel": risk_level,
                    })

        return {
            "count": len(controls),
            "controls": controls,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }
   
    @staticmethod
    def get_inbox(session):
            """
            Unified inbox for Compliance Owner.
            Computed from authoritative tables.
            """
            ComplianceOwnerService._assert_admin(session)

            tenant_id = session["tenant_id"]
            user_id = session["user_id"]

            inbox = []

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
                        ORDER BY aea.requested_at DESC
                        """,
                        (tenant_id,),
                    )

                    for access_id, evidence_id, auditor_email, requested_at in cur.fetchall():
                        inbox.append({
                            "type": "AUDITOR_EVIDENCE_REQUEST",
                            "priority": "HIGH",
                            "requiresAction": True,
                            "createdAt": requested_at.isoformat(),
                            "data": {
                                "accessRequestId": str(access_id),
                                "evidenceRequestId": str(evidence_id),
                                "auditorEmail": auditor_email,
                            },
                        })

                    # -------------------------------------------------
                    # 2. Control owner nominations
                    # -------------------------------------------------
                    cur.execute(
                        """
                        SELECT
                            n.id,
                            n.control_id,
                            u.email,
                            n.created_at
                        FROM control_owner_nominations n
                        JOIN users u ON u.id = n.nominated_user_id
                        WHERE n.tenant_id = %s
                        AND n.status = 'PENDING'
                        ORDER BY n.created_at DESC
                        """,
                        (tenant_id,),
                    )

                    for nomination_id, control_id, nominee_email, created_at in cur.fetchall():
                        inbox.append({
                            "type": "CONTROL_OWNER_NOMINATION",
                            "priority": "MEDIUM",
                            "requiresAction": True,
                            "createdAt": created_at.isoformat(),
                            "data": {
                                "nominationId": str(nomination_id),
                                "controlId": str(control_id),
                                "nomineeEmail": nominee_email,
                            },
                        })

                    # -------------------------------------------------
                    # 3. Evidence submissions awaiting review
                    # -------------------------------------------------
                    cur.execute(
                        """
                        SELECT
                            er.id,
                            er.description,
                            u.email,
                            er.created_at
                        FROM evidence_requests er
                        JOIN users u ON u.id = er.requested_from
                        WHERE er.tenant_id = %s
                        AND er.status = 'SUBMITTED'
                        AND er.requested_by = %s
                        ORDER BY er.created_at DESC
                        """,
                        (tenant_id, user_id),
                    )

                    for req_id, description, submitter_email, created_at in cur.fetchall():
                        inbox.append({
                            "type": "EVIDENCE_REVIEW",
                            "priority": "HIGH",
                            "requiresAction": True,
                            "createdAt": created_at.isoformat(),
                            "data": {
                                "requestId": str(req_id),
                                "description": description,
                                "submittedBy": submitter_email,
                            },
                        })

                    # -------------------------------------------------
                    # 4. Overdue evidence (attention items)
                    # -------------------------------------------------
                    cur.execute(
                        """
                        SELECT
                            id,
                            description,
                            due_at
                        FROM evidence_requests
                        WHERE tenant_id = %s
                        AND due_at < now()
                        AND status NOT IN ('COMPLETED', 'WAIVED')
                        ORDER BY due_at ASC
                        """,
                        (tenant_id,),
                    )

                    for req_id, description, due_at in cur.fetchall():
                        inbox.append({
                            "type": "OVERDUE_EVIDENCE",
                            "priority": "HIGH",
                            "requiresAction": False,
                            "createdAt": due_at.isoformat(),
                            "data": {
                                "requestId": str(req_id),
                                "description": description,
                            },
                        })

            # newest first (ISO strings sort safely)
            inbox.sort(key=lambda x: x["createdAt"], reverse=True)

            return {
                "count": len(inbox),
                "items": inbox,
                "generatedAt": datetime.now(timezone.utc).isoformat(),
            }

    @staticmethod
    def _assert_admin(session):
        if Role.COMPLIANCE_OWNER.value not in session["roles"]:
            raise PermissionError("Compliance Owner privileges required")

    @staticmethod
    def get_executive_compliance_snapshot(session):
        """
        Returns executive-level compliance posture WITHOUT sending emails.
        Read-only. Safe for dashboards and previews.
        """
        ComplianceOwnerService._assert_admin(session)

        tenant_id = session["tenant_id"]

        with get_conn() as conn:
            with conn.cursor() as cur:

                # 1. Framework coverage
                cur.execute(
                    """
                    SELECT
                        COUNT(*) FILTER (WHERE tf.status = 'ACTIVE') AS active,
                        COUNT(*) FILTER (WHERE tf.status = 'OUT_OF_SCOPE') AS out_of_scope,
                        COUNT(*) FILTER (
                            WHERE tf.status = 'INACTIVE' OR tf.status IS NULL
                        ) AS inactive
                    FROM frameworks f
                    LEFT JOIN tenant_frameworks tf
                    ON tf.framework_id = f.id
                    AND tf.tenant_id = %s
                    WHERE f.created_by_tenant IS NULL
                    OR f.created_by_tenant = %s
                    """,
                    (tenant_id, tenant_id),
                )
                frameworks_active, frameworks_oos, frameworks_inactive = cur.fetchone()

                # 2. Evidence request health
                cur.execute(
                    """
                    SELECT
                        COUNT(*) FILTER (WHERE status = 'OPEN') AS open,
                        COUNT(*) FILTER (WHERE status = 'SUBMITTED') AS submitted,
                        COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed,
                        COUNT(*) FILTER (WHERE status = 'OVERDUE') AS overdue
                    FROM evidence_requests
                    WHERE tenant_id = %s
                    """,
                    (tenant_id,),
                )
                ev_open, ev_submitted, ev_completed, ev_overdue = cur.fetchone()

                # 3. Control execution risk
                cur.execute(
                    """
                    SELECT
                        COUNT(*) FILTER (WHERE status = 'EXCEPTION') AS exceptions,
                        COUNT(*) FILTER (WHERE status = 'OVERDUE') AS overdue
                    FROM control_executions
                    WHERE tenant_id = %s
                    """,
                    (tenant_id,),
                )
                ctrl_exceptions, ctrl_overdue = cur.fetchone()

                # 4. Governance gaps
                cur.execute(
                    """
                    SELECT COUNT(*)
                    FROM control_owner_nominations
                    WHERE tenant_id = %s
                    AND status = 'PENDING'
                    """,
                    (tenant_id,),
                )
                pending_nominations = cur.fetchone()[0]

        # 5. Overall posture (same logic as executive report)
        posture = (
            "AT RISK"
            if ev_overdue > 0 or ctrl_exceptions > 0
            else "HEALTHY"
        )

        return {
            "posture": posture,
            "frameworks": {
                "active": frameworks_active,
                "out_of_scope": frameworks_oos,
                "inactive": frameworks_inactive,
            },
            "evidence": {
                "open": ev_open,
                "submitted": ev_submitted,
                "completed": ev_completed,
                "overdue": ev_overdue,
            },
            "controls": {
                "exceptions": ctrl_exceptions,
                "overdue": ctrl_overdue,
            },
            "governance": {
                "pendingControlOwnerNominations": pending_nominations,
            },
            "generatedAt": datetime.now(timezone.utc).isoformat(),
        }


    @staticmethod
    def send_executive_compliance_report(session):
        """
        Generates and emails an executive-level compliance summary
        to all EXECUTIVE_VIEWER users for the tenant and records an audit event.
        """
        ComplianceOwnerService._assert_admin(session)

        tenant_id = session["tenant_id"]

        with get_conn() as conn:
            with conn.cursor() as cur:

                # 1. Framework coverage
                cur.execute(
                    """
                    SELECT
                        COUNT(*) FILTER (WHERE tf.status = 'ACTIVE') AS active,
                        COUNT(*) FILTER (WHERE tf.status = 'OUT_OF_SCOPE') AS out_of_scope,
                        COUNT(*) FILTER (
                            WHERE tf.status = 'INACTIVE' OR tf.status IS NULL
                        ) AS inactive
                    FROM frameworks f
                    LEFT JOIN tenant_frameworks tf
                      ON tf.framework_id = f.id
                     AND tf.tenant_id = %s
                    WHERE f.created_by_tenant IS NULL
                       OR f.created_by_tenant = %s
                    """,
                    (tenant_id, tenant_id),
                )
                frameworks_active, frameworks_oos, frameworks_inactive = cur.fetchone()

                # 2. Evidence request health
                cur.execute(
                    """
                    SELECT
                        COUNT(*) FILTER (WHERE status = 'OPEN') AS open,
                        COUNT(*) FILTER (WHERE status = 'SUBMITTED') AS submitted,
                        COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed,
                        COUNT(*) FILTER (WHERE status = 'OVERDUE') AS overdue
                    FROM evidence_requests
                    WHERE tenant_id = %s
                    """,
                    (tenant_id,),
                )
                ev_open, ev_submitted, ev_completed, ev_overdue = cur.fetchone()

                # 3. Control execution risk
                cur.execute(
                    """
                    SELECT
                        COUNT(*) FILTER (WHERE status = 'EXCEPTION') AS exceptions,
                        COUNT(*) FILTER (WHERE status = 'OVERDUE') AS overdue
                    FROM control_executions
                    WHERE tenant_id = %s
                    """,
                    (tenant_id,),
                )
                ctrl_exceptions, ctrl_overdue = cur.fetchone()

                # 4. Governance gaps
                cur.execute(
                    """
                    SELECT COUNT(*)
                    FROM control_owner_nominations
                    WHERE tenant_id = %s
                      AND status = 'PENDING'
                    """,
                    (tenant_id,),
                )
                pending_nominations = cur.fetchone()[0]

                # 5. Executive recipients
                cur.execute(
                    """
                    SELECT u.email
                    FROM users u
                    JOIN user_roles ur ON ur.user_id = u.id
                    JOIN roles r ON r.id = ur.role_id
                    WHERE u.tenant_id = %s
                      AND r.name = 'EXECUTIVE_VIEWER'
                      AND u.is_active = TRUE
                    """,
                    (tenant_id,),
                )
                executive_emails = [row[0] for row in cur.fetchall()]

        if not executive_emails:
            return {
                "status": "no_recipients"
            }

        # 6. Overall posture
        posture = (
            "AT RISK"
            if ev_overdue > 0 or ctrl_exceptions > 0
            else "HEALTHY"
        )

        # 7. Email body
        body = f"""
EXECUTIVE COMPLIANCE STATUS REPORT
Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}

OVERALL POSTURE
- Status: {posture}

FRAMEWORK COVERAGE
- Active: {frameworks_active}
- Out of scope: {frameworks_oos}
- Inactive: {frameworks_inactive}

EVIDENCE READINESS
- Open requests: {ev_open}
- Submitted (pending review): {ev_submitted}
- Completed: {ev_completed}
- Overdue: {ev_overdue}

CONTROL EXECUTION RISK
- Exceptions: {ctrl_exceptions}
- Overdue executions: {ctrl_overdue}

GOVERNANCE
- Pending control owner nominations: {pending_nominations}

This report reflects the current compliance posture across the organization.
"""

        # 8. Send emails
        for email in executive_emails:
            send_generic_email(
                to_email=email,
                subject="Executive Compliance Status Report",
                body=body,
            )

        # 9. Audit log
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO audit_log (
                        tenant_id,
                        actor_user_id,
                        action,
                        target_type,
                        created_at
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        tenant_id,
                        session["user_id"],
                        "EXECUTIVE_REPORT_SENT",
                        "TENANT",
                        datetime.now(timezone.utc),
                    ),
                )
                conn.commit()

        return {
            "status": "sent",
            "recipients": len(executive_emails),
            "posture": posture,
        }
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
    def get_dashboard_summary(tenant_id: str):
        with get_conn() as conn:
            with conn.cursor() as cur:

                # Pending evidence access (auditor requests)
                cur.execute(
                    """
                    SELECT COUNT(*)
                    FROM auditor_evidence_access
                    WHERE tenant_id = %s
                      AND status = 'REQUESTED'
                    """,
                    (tenant_id,),
                )
                pending_evidence_access = cur.fetchone()[0]

                # Pending control owner nominations
                cur.execute(
                    """
                    SELECT COUNT(*)
                    FROM control_owner_nominations
                    WHERE tenant_id = %s
                      AND status = 'PENDING'
                    """,
                    (tenant_id,),
                )
                pending_nominations = cur.fetchone()[0]

                # Executive requests (simple version: reuse auditor requests for now)
                cur.execute(
                    """
                    SELECT COUNT(*)
                    FROM auditor_evidence_access
                    WHERE tenant_id = %s
                      AND status = 'REQUESTED'
                    """,
                    (tenant_id,),
                )
                executive_requests = cur.fetchone()[0]

                # Overdue evidence requests
                cur.execute(
                    """
                    SELECT COUNT(*)
                    FROM evidence_requests
                    WHERE tenant_id = %s
                      AND due_at < now()
                      AND status NOT IN ('COMPLETED', 'WAIVED')
                    """,
                    (tenant_id,),
                )
                overdue_evidence = cur.fetchone()[0]

                # Overdue controls
                cur.execute(
                    """
                    SELECT COUNT(*)
                    FROM control_executions
                    WHERE tenant_id = %s
                      AND due_at < now()
                      AND status IN ('PENDING', 'IN_PROGRESS')
                    """,
                    (tenant_id,),
                )
                overdue_controls = cur.fetchone()[0]
                cur.execute(
                    """
                    SELECT
                        al.id,
                        al.action,
                        u.email AS actor_email,
                        al.created_at
                    FROM audit_log al
                    LEFT JOIN users u ON u.id = al.actor_user_id
                    WHERE al.tenant_id = %s
                    ORDER BY al.created_at DESC
                    LIMIT %s
                    """,
                    (tenant_id, 10),
                )

                recent_activity = [
                    {
                        "id": str(row[0]),
                        "action": row[1],
                        "actorEmail": row[2],
                        "createdAt": row[3].isoformat(),
                    }
                    for row in cur.fetchall()
                ]

                return {
                    "pendingEvidenceAccess": pending_evidence_access,
                    "pendingNominations": pending_nominations,
                    "executiveRequests": executive_requests,
                    "overdueEvidence": overdue_evidence,
                    "overdueControls": overdue_controls,
                    "recentActivity": recent_activity,
                }

    @staticmethod
    def fetch_departments_for_tenant(tenant_id):
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        d.id,
                        d.name,
                        COUNT(ud.user_id) AS user_count
                    FROM departments d
                    LEFT JOIN user_departments ud
                    ON ud.department_id = d.id
                    WHERE d.tenant_id = %s
                    GROUP BY d.id
                    ORDER BY d.name
                    """,
                    (tenant_id,),
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
