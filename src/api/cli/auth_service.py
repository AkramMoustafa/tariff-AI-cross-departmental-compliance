import secrets
from datetime import datetime, timedelta, timezone
from src.api.cli.admin_cli import get_conn

TOKEN_EXPIRY_MINUTES = 15

def generate_token(email: str) -> str:
    token = secrets.token_hex(16)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRY_MINUTES)

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO email_auth_tokens (email, token, expires_at)
                VALUES (%s, %s, %s)
                ON CONFLICT (email)
                DO UPDATE SET token = EXCLUDED.token,
                              expires_at = EXCLUDED.expires_at
                """,
                (email, token, expires_at)
            )
            conn.commit()

    return token

def verify_token(email: str, input_token: str) -> bool:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT token, expires_at FROM email_auth_tokens WHERE email = %s",
                (email,)
            )
            row = cur.fetchone()
            if not row:
                return False

            token, expires_at = row
            if datetime.now(timezone.utc) > expires_at or token != input_token:
                return False

            cur.execute(
                "DELETE FROM email_auth_tokens WHERE email = %s",
                (email,)
            )
            conn.commit()
            return True
