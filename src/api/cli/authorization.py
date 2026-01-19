from enum import Enum
from typing import Set


class Role(str, Enum):
    COMPLIANCE_OWNER = "COMPLIANCE_OWNER"
    DEPARTMENT_OWNER = "DEPARTMENT_OWNER"
    CONTROL_OWNER = "CONTROL_OWNER"
    EXECUTIVE_VIEWER = "EXECUTIVE_VIEWER"
    AUDITOR = "AUDITOR"


class Action(str, Enum):
    READ = "read"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    EXPORT = "export"


class Resource(str, Enum):
    DOCUMENTS = "documents"
    EVIDENCE = "evidence"
    EVIDENCE_REQUESTS = "evidence_requests"
    CONTROL_EXECUTIONS = "control_executions"
    AUDIT_LOG = "audit_log"
    USERS = "users"
    ATTACHMENTS = "attachments"
    TENANT_ADMIN = "tenant_admin"


ROLE_PERMISSIONS = {

    Role.AUDITOR: {
        Resource.DOCUMENTS: {Action.READ},
        Resource.EVIDENCE: {Action.READ},
        Resource.EVIDENCE_REQUESTS: {Action.READ},
        Resource.CONTROL_EXECUTIONS: {Action.READ},
        Resource.AUDIT_LOG: {Action.READ},
        Resource.ATTACHMENTS: {Action.READ},
    },

    Role.CONTROL_OWNER: {
        Resource.DOCUMENTS: {Action.READ},

        # Upload evidence only for assigned requests
        Resource.EVIDENCE: {Action.READ, Action.CREATE},

        # Respond / mark complete only (UPDATE must be scoped in service layer)
        Resource.EVIDENCE_REQUESTS: {Action.READ, Action.UPDATE},

        # Mark execution status (complete / exception)
        Resource.CONTROL_EXECUTIONS: {Action.READ, Action.UPDATE},
    },

    Role.DEPARTMENT_OWNER: {
        Resource.DOCUMENTS: {Action.READ},

        Resource.EVIDENCE: {Action.READ},

        Resource.EVIDENCE_REQUESTS: {
            Action.READ,
            Action.UPDATE,
            Action.CREATE,
        },

        Resource.CONTROL_EXECUTIONS: {
            Action.READ,
            Action.UPDATE,
            Action.CREATE,
        },
    },
    Role.COMPLIANCE_OWNER: {
        Resource.DOCUMENTS: {Action.READ, Action.CREATE, Action.UPDATE},

        # Read-only evidence access (no execution)
        Resource.EVIDENCE: {Action.READ},

        # Monitor status, manage exceptions (no routine creation)
        Resource.EVIDENCE_REQUESTS: {Action.READ, Action.UPDATE},

        # Cross-org monitoring only
        Resource.CONTROL_EXECUTIONS: {Action.READ},

        # Full visibility for auditability
        Resource.AUDIT_LOG: {Action.READ},

        # User / tenant administration
        Resource.USERS: {Action.READ, Action.UPDATE},
        Resource.TENANT_ADMIN: {Action.READ, Action.UPDATE},
    },

    Role.EXECUTIVE_VIEWER: {
        Resource.DOCUMENTS: {Action.READ},
        Resource.CONTROL_EXECUTIONS: {Action.READ, Action.EXPORT},
        Resource.AUDIT_LOG: {Action.READ},
    },
}


def is_authorized(
    *,
    role: Role,
    resource: Resource,
    action: Action,
) -> bool:
    """
    Central authorization function.
    Must be called by EVERY protected API endpoint.
    """

    role_permissions = ROLE_PERMISSIONS.get(role)
    if not role_permissions:
        return False

    allowed_actions: Set[Action] = role_permissions.get(resource, set())
    return action in allowed_actions


def assert_not_auditor_write(role: Role, action: Action):
    """
    Hard safety check: auditors are ALWAYS read-only.
    """
    if role == Role.AUDITOR and action != Action.READ:
        raise PermissionError("Auditors are read-only users")
