#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${YORANZIFY_APP_DIR:-/var/www/yoranzify}"
SERVICE_NAME="${YORANZIFY_SERVICE_NAME:-yoranzify}"

cd "$APP_DIR"

if ! git diff --quiet || ! git diff --cached --quiet || [[ -n "$(git ls-files --others --exclude-standard)" ]]; then
  echo "Deployment stopped: the server working tree has local changes."
  git status --short
  exit 1
fi

git fetch origin main
git merge --ff-only origin/main
npm ci
npx prisma generate
npx prisma migrate deploy
NODE_OPTIONS="--max-old-space-size=1536" npm run build
sudo systemctl restart "$SERVICE_NAME"
sudo systemctl is-active --quiet "$SERVICE_NAME"
curl --fail --silent --show-error http://127.0.0.1:3000/api/health
echo
echo "Yoranzify deployment completed successfully."
