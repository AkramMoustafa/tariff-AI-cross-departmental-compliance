from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email
import os
from typing import Iterable


SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

FOUNDERS: list[str] = [
    "akram@nomioc.com",
]

FROM_EMAIL = "akram@nomioc.com"
REPLY_TO = "shelk1v@cmich.edu"


def _get_client() -> SendGridAPIClient | None:
    """
    Return a SendGrid client if API key is set, otherwise None.
    """
    if not SENDGRID_API_KEY:
        return None
    return SendGridAPIClient(SENDGRID_API_KEY)


def send_demo_email(demo) -> None:
    """
    Sends a demo request notification email to founders.
    Assumes demo has:
      - company_name
      - full_name
      - email
      - phone
    In dev (no SENDGRID_API_KEY), this becomes a no-op with a log.
    """
    client = _get_client()
    if client is None:
        print(
            "[email_service] SENDGRID_API_KEY is not set; "
            f"skipping email for demo request from {getattr(demo, 'email', 'unknown')}"
        )
        return

    to_emails: Iterable[str] = FOUNDERS

    message = Mail(
        from_email=Email(FROM_EMAIL, "NomiAI"),
        to_emails=to_emails,
        subject="New Demo Request",
        html_content=f"""
        <h3>New Demo Request</h3>
        <p><b>Company:</b> {demo.company_name}</p>
        <p><b>Name:</b> {demo.full_name}</p>
        <p><b>Email:</b> {demo.email}</p>
        <p><b>Phone:</b> {demo.phone}</p>
        """,
    )
    message.reply_to = REPLY_TO

    response = client.send(message)

    print("📧 SendGrid status:", response.status_code)
    print("📧 SendGrid body:", response.body)
    print("📧 SendGrid headers:", response.headers)
