#!/usr/bin/env bash
# Apply CORS config to Firebase Storage bucket.
# Usage: ./scripts/set-storage-cors.sh <bucket-name>
set -euo pipefail
BUCKET="${1:-}"
if [ -z "$BUCKET" ]; then
  echo "Bucket name required. Example: ./scripts/set-storage-cors.sh adesos.appspot.com" >&2
  exit 1
fi
if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud CLI required. Install Google Cloud SDK." >&2
  exit 1
fi
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CORS_FILE="$ROOT_DIR/storage-cors.json"
if [ ! -f "$CORS_FILE" ]; then
  echo "CORS file not found: $CORS_FILE" >&2
  exit 1
fi
set -x
gcloud storage buckets update gs://$BUCKET --cors-file="$CORS_FILE"
# Show applied config
gcloud storage buckets describe gs://$BUCKET --format="value(crossOriginPolicy)" || true
gcloud storage buckets describe gs://$BUCKET --format="json(cors_config)" | sed 's/\\n/\n/g'
