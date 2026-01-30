import sys
import os
import argparse
import secrets
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from dotenv import load_dotenv

# 1. Calculate Paths
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)

# 2. Load Environment Variables
env_path = os.path.join(project_root, ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
    print(f" Loaded environment from {env_path}")
else:
    print("  Warning: .env file not found")

# 3. Add project root to python path
sys.path.append(project_root)

# 4. Import DB
try:
    from src.api.db import SessionLocal
    from src.api.models import ApiClient, User
except ImportError as e:
    print(f" Import Error: {e}")
    sys.exit(1)

def create_customer(name, tier, owner_email):
    db = SessionLocal()
    try:
        # 1. Find Owner (Optional)
        owner_id = None
        if owner_email:
            owner = db.query(User).filter(User.email == owner_email).first()
            if owner:
                owner_id = owner.id
                print(f"   Linked to user: {owner.email}")
            else:
                print(f"   Warning: User {owner_email} not found. Creating unlinked client.")
        
        # 2. Set Limits
        quotas = {
            "free": {"limit": 100, "rate": 10},
            "startup": {"limit": 10000, "rate": 60},
            "enterprise": {"limit": 1000000, "rate": 1000},
        }
        plan = quotas.get(tier, quotas["free"])

        # 3. Create Client
        new_client = ApiClient(
            name=name,
            tier=tier,
            client_id=f"nomi_{uuid4().hex[:12]}",
            client_secret_hash="MANAGED_VIA_TOKEN", 
            monthly_quota=plan["limit"],
            rate_limit_per_minute=plan["rate"],
            is_active=True,
            owner_client_user_id=owner_id
        )
        
        db.add(new_client)
        db.commit()
        db.refresh(new_client)

        # 4. Generate Token (BYPASSING OWNERSHIP CHECK)
        # We generate and insert manually since we are the System Admin
        token_str = "api_" + secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=8760) # 1 Year

        # Safety: Ensure token table exists (in case model was missing)
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS api_client_tokens (
                token VARCHAR PRIMARY KEY,
                api_client_id UUID NOT NULL REFERENCES api_clients(id) ON DELETE CASCADE,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                revoked BOOLEAN DEFAULT FALSE,
                last_used_at TIMESTAMP WITH TIME ZONE
            );
        """))
        db.commit()

        # Insert the token
        db.execute(
            text("""
                INSERT INTO api_client_tokens (token, api_client_id, expires_at, revoked)
                VALUES (:token, :client_id, :expires_at, FALSE)
            """),
            {
                "token": token_str,
                "client_id": new_client.id,
                "expires_at": expires_at
            }
        )
        db.commit()

        print(f"\n SUCCESS: Customer '{name}' created!")
        print(f"------------------------------------------------")
        print(f" Client ID: {new_client.client_id}")
        print(f" API Key:   {token_str}")
        print(f" Tier:      {tier.upper()} ({plan['limit']} req/month)")
        print(f"------------------------------------------------")
        print("  SAVE THIS KEY. It is only shown once.")

    except Exception as e:
        print(f" Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

def list_customers():
    db = SessionLocal()
    try:
        clients = db.query(ApiClient).all()
        print(f"\n{'NAME':<30} | {'TIER':<10} | {'USAGE':<10} | {'QUOTA':<10}")
        print("-" * 70)
        for c in clients:
            print(f"{c.name:<30} | {c.tier:<10} | {c.current_period_usage:<10} | {c.monthly_quota:<10}")
    except Exception as e:
        print(f" Error listing customers: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NomiAI API Customer Manager")
    subparsers = parser.add_subparsers(dest="command")

    create_parser = subparsers.add_parser("create", help="Create a new API customer")
    create_parser.add_argument("--name", required=True, help="Company Name")
    create_parser.add_argument("--tier", choices=["free", "startup", "enterprise"], default="free")
    create_parser.add_argument("--owner", help="Email of the human owner (optional)")

    list_parser = subparsers.add_parser("list", help="List all API customers")

    args = parser.parse_args()

    if args.command == "create":
        create_customer(args.name, args.tier, args.owner)
    elif args.command == "list":
        list_customers()
    else:
        parser.print_help()