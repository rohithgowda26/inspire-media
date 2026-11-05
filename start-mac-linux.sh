#!/usr/bin/env bash
# Inspire Media website — one-step start (macOS / Linux)
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Download the LTS version from https://nodejs.org, install it, then run this again."
  exit 1
fi
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Node.js $(node -v) is too old. Please install Node.js 20 or newer from https://nodejs.org"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run only, about 1-2 minutes)..."
  npm install
fi

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local — add your RESEND_API_KEY there so the contact form can email you."
fi

echo ""
echo "Starting Inspire Media at http://localhost:3000  (press Ctrl+C to stop)"
( sleep 6; (command -v open >/dev/null && open http://localhost:3000) || (command -v xdg-open >/dev/null && xdg-open http://localhost:3000) || true ) &
npm run dev
