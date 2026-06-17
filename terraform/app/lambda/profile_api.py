import json
import os
import time
from decimal import Decimal

import boto3

TABLE_NAME = os.environ["USER_PROFILES_TABLE"]
CORS_ALLOW_ORIGIN = os.environ.get("CORS_ALLOW_ORIGIN", "*")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "content-type": "application/json",
            "access-control-allow-origin": CORS_ALLOW_ORIGIN,
            "access-control-allow-headers": "authorization,content-type",
            "access-control-allow-methods": "GET,POST,OPTIONS",
        },
        "body": json.dumps(body, default=_json_default),
    }


def _json_default(value):
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def _claims(event):
    return event.get("requestContext", {}).get("authorizer", {}).get("jwt", {}).get("claims", {})


def _clean_string(value, max_len=200):
    if value is None:
        return ""
    value = str(value).strip()
    return value[:max_len]


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")

    if method == "OPTIONS":
        return _response(204, {})

    claims = _claims(event)
    user_id = claims.get("sub")
    email = claims.get("email", "")

    if not user_id:
        return _response(401, {"error": "Unauthorized"})

    if method == "GET":
        result = table.get_item(Key={"user_id": user_id})
        profile = result.get("Item") or {
            "user_id": user_id,
            "email": email,
            "display_name": claims.get("name", ""),
            "plan": "free",
            "created_at": int(time.time()),
            "updated_at": int(time.time()),
        }
        return _response(200, profile)

    if method == "POST":
        try:
            payload = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return _response(400, {"error": "Invalid JSON"})

        now = int(time.time())
        display_name = _clean_string(payload.get("display_name"), 120)
        youtube_channel = _clean_string(payload.get("youtube_channel"), 200)

        item = {
            "user_id": user_id,
            "email": email,
            "display_name": display_name,
            "youtube_channel": youtube_channel,
            "plan": "free",
            "updated_at": now,
        }

        table.update_item(
            Key={"user_id": user_id},
            UpdateExpression=(
                "SET email = :email, display_name = :display_name, youtube_channel = :youtube_channel, "
                "#plan = if_not_exists(#plan, :plan), updated_at = :updated_at, created_at = if_not_exists(created_at, :created_at)"
            ),
            ExpressionAttributeNames={"#plan": "plan"},
            ExpressionAttributeValues={
                ":email": email,
                ":display_name": display_name,
                ":youtube_channel": youtube_channel,
                ":plan": "free",
                ":updated_at": now,
                ":created_at": now,
            },
        )

        result = table.get_item(Key={"user_id": user_id})
        return _response(200, result.get("Item", item))

    return _response(405, {"error": "Method not allowed"})
