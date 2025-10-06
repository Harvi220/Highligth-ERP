#!/bin/sh
set -e

echo "🚀 Starting Frontend application..."

# Replace environment variables in runtime config
if [ -n "$VITE_API_URL" ]; then
    echo "📝 Configuring API URL: $VITE_API_URL"
    # Create runtime config file that will be loaded by the app
    cat > /usr/share/nginx/html/config.js <<EOF
window.ENV = {
    VITE_API_URL: "${VITE_API_URL}"
};
EOF
fi

echo "✅ Frontend ready!"

# Pass control to default nginx entrypoint
exec /docker-entrypoint.sh "$@"
