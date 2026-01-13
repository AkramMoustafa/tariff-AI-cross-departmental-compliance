import boto3
import json
import os
import sys


def load_sanctions_data_from_s3():
    required_env_vars = [
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "AWS_REGION",
        "S3_BUCKET_NAME",
        "S3_OBJECT_KEY",
    ]

    missing = [v for v in required_env_vars if not os.getenv(v)]
    if missing:
        print("ERROR: Missing environment variables:")
        for v in missing:
            print(f"  - {v}")
        sys.exit(1)

    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION"),
    )

    bucket = os.getenv("S3_BUCKET_NAME")
    key = os.getenv("S3_OBJECT_KEY")

    print(f"Connecting to S3 bucket: {bucket}")
    print(f"Downloading object: {key}")

    response = s3.get_object(Bucket=bucket, Key=key)
    raw_data = response["Body"].read().decode("utf-8")

    print("Download complete.")
    print("Parsing JSON...")

    data = json.loads(raw_data)
    output_file = "sanction_list_shortened.json"

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(raw_data)

    print(f"File saved locally as: {os.path.abspath(output_file)}")
    print("JSON parsed successfully.")
    return data


def main():
    print("=== Amazon S3 Sanctions Loader ===")

    data = load_sanctions_data_from_s3()

    print("\n=== DATA SUMMARY ===")

    if isinstance(data, dict):
        print("Top-level type: dict")
        print("Top-level keys (first 10):")
        for k in list(data.keys())[:10]:
            print(f"  - {k}")

    elif isinstance(data, list):
        print("Top-level type: list")
        print(f"Number of records: {len(data)}")

    else:
        print(f"Unknown data type: {type(data)}")

    print("\nS3 loader program finished successfully.")


if __name__ == "__main__":
    main()
