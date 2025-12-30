from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email
import os

# Read API key from environment
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

if not SENDGRID_API_KEY:
    raise RuntimeError("SENDGRID_API_KEY is not set")

FOUNDERS = [
    "akram@nomioc.com"
]
# Verified sender in SendGrid
FROM_EMAIL = "akram@nomioc.com"


def send_demo_email(demo):
    """
    Sends a demo request notification email to founders.
    Assumes demo has:
      - company_name
      - full_name
      - email
      - phone
    """

    message = Mail(
        from_email=Email(FROM_EMAIL, "NomiAI"),
        to_emails=FOUNDERS,
        subject="New Demo Request",
        html_content=f"""
        <h3>New Demo Request</h3>
        <p><b>Company:</b> {demo.company_name}</p>
        <p><b>Name:</b> {demo.full_name}</p>
        <p><b>Email:</b> {demo.email}</p>
        <p><b>Phone:</b> {demo.phone}</p>
        """
    )

    # Explicit reply-to (recommended)
    message.reply_to = "shelk1v@cmich.edu"

    sg = SendGridAPIClient(SENDGRID_API_KEY)
    response = sg.send(message)

    # Debug / audit logs
    print("📧 SendGrid status:", response.status_code)
    print("📧 SendGrid body:", response.body)
    print("📧 SendGrid headers:", response.headers)
