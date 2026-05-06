#!/bin/sh
set -e

echo "========================================"
echo " TaskFlow AI — Production Startup"
echo "========================================"

echo ""
echo "📋 Environment check..."
echo "   NODE_ENV: ${NODE_ENV}"
echo "   PORT: ${PORT}"
echo "   DB: $([ -n "$DATABASE_URL" ] && echo 'SET' || echo '⚠️  NOT SET')"

echo ""
echo "🔄 Running Prisma migrations..."
if npx prisma migrate deploy; then
  echo "✅ Migrations applied successfully"
else
  echo "⚠️  Migration warning — continuing to start server anyway"
fi

echo ""
echo "🚀 Starting server..."
exec node dist/index.js
