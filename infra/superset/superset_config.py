import os

FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,
    "EMBEDDABLE_CHARTS": True,
}

TALISMAN_ENABLED = False

HTTP_HEADERS = {
    "X-Frame-Options": "ALLOWALL",
}

GUEST_ROLE_NAME = "Public"
GUEST_TOKEN_JWT_EXP_SECONDS = 600

SQLALCHEMY_DATABASE_URI = os.environ.get(
    "SUPERSET_META_DB_URI",
    "postgresql://powerboard:powerboard_dev@postgres:5432/powerboard_superset"
)

SECRET_KEY = os.environ.get("SUPERSET_SECRET_KEY", "powerboard_superset_dev_secret")

# Disable CSRF for API endpoints
WTF_CSRF_ENABLED = False

# Allow cross-origin requests for embedding
CORS_OPTIONS = {
    "supports_credentials": True,
    "allow_headers": ["*"],
    "resources": ["*"],
    "origins": ["*"],
}
