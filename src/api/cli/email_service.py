import boto3

SES_REGION = "us-east-1"
SENDER_EMAIL = "noreply@nomioc.com"

ses = boto3.client("ses", region_name=SES_REGION)

def send_auth_token_email(to_email: str, token: str):
    ses.send_email(
        Source=SENDER_EMAIL,
        Destination={"ToAddresses": [to_email]},
        Message={
            "Subject": {"Data": "Your authentication token"},
            "Body": {
                "Text": {
                    "Data": f"Your authentication token is:\n\n{token}\n\nExpires in 15 minutes."
                }
            },
        },
    )

def send_generic_email(to_email: str, subject: str, body: str):
    ses.send_email(
        Source=SENDER_EMAIL,
        Destination={"ToAddresses": [to_email]},
        Message={
            "Subject": {"Data": subject, "Charset": "UTF-8"},
            "Body": {
                "Text": {"Data": body, "Charset": "UTF-8"}
            },
        },
    )