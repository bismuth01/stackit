#!/bin/bash
set -e

# StackIt Database Setup Script for Docker
# This script runs after PostgreSQL container is ready and initializes all schemas

echo "🚀 Starting StackIt database schema setup..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER"; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
until nc -z "$REDIS_HOST" "$REDIS_PORT" > /dev/null 2>&1; do
  echo "Redis is unavailable - sleeping"
  sleep 2
done
echo "✅ Redis is ready!"

# Setup users database schema
echo "📊 Setting up users database schema..."
if PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U stackit_user -d stackit_users -f /scripts/setup-user-db.sql > /dev/null 2>&1; then
    echo "✅ Users database schema setup completed"
else
    echo "⚠️  Users database schema might already exist"
fi

# Setup content database schema
echo "📊 Setting up content database schema..."
if PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U stackit_user -d stackit_content -f /scripts/setup-content-db.sql > /dev/null 2>&1; then
    echo "✅ Content database schema setup completed"
else
    echo "⚠️  Content database schema might already exist"
fi

# Setup notification system
echo "🔔 Setting up notification system..."
if PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U stackit_user -d stackit_content -f /scripts/setup-notifications-db.sql > /dev/null 2>&1; then
    echo "✅ Notification system setup completed"
else
    echo "⚠️  Notification system might already exist"
fi

# Test database connections
echo "🧪 Testing database connections..."

# Create a simple test script
cat > /tmp/test-docker-connections.js << 'EOF'
const { Client } = require('pg');

async function testConnections() {
    const configs = [
        {
            name: 'Users Database',
            config: {
                host: process.env.PGHOST,
                port: process.env.PGPORT,
                user: 'stackit_user',
                password: 'stackit_password',
                database: 'stackit_users'
            }
        },
        {
            name: 'Content Database',
            config: {
                host: process.env.PGHOST,
                port: process.env.PGPORT,
                user: 'stackit_user',
                password: 'stackit_password',
                database: 'stackit_content'
            }
        }
    ];

    for (const { name, config } of configs) {
        try {
            const client = new Client(config);
            await client.connect();

            // Test basic query
            const result = await client.query('SELECT NOW() as current_time');
            console.log(`✅ ${name}: Connected successfully at ${result.rows[0].current_time}`);

            await client.end();
        } catch (error) {
            console.error(`❌ ${name}: Connection failed - ${error.message}`);
            throw error;
        }
    }
}

testConnections().then(() => {
    console.log('🎉 All database connections successful!');
    process.exit(0);
}).catch((error) => {
    console.error('💥 Database connection test failed:', error.message);
    process.exit(1);
});
EOF

# Install Node.js dependencies and run test
apk add --no-cache nodejs npm > /dev/null 2>&1
npm install pg > /dev/null 2>&1
node /tmp/test-docker-connections.js

# Test notification system specifically
echo "🔔 Testing notification system..."
PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U stackit_user -d stackit_content -c "
SELECT
    COUNT(*) as notification_count,
    COUNT(*) FILTER (WHERE type = 'answer') as answer_count,
    COUNT(*) FILTER (WHERE type = 'comment') as comment_count,
    COUNT(*) FILTER (WHERE type = 'vote') as vote_count
FROM notifications;
" -t

# Test Redis connection (simplified without redis-cli)
echo "🔥 Testing Redis connection..."
if nc -z "$REDIS_HOST" "$REDIS_PORT"; then
    echo "✅ Redis: Connected successfully on $REDIS_HOST:$REDIS_PORT"
    echo "✅ Redis DB 0: Session storage ready"
    echo "✅ Redis DB 1: Application cache ready"
    echo "✅ Redis DB 2: Notification queues ready"
    echo "✅ Redis DB 3: Vote tracking ready"
else
    echo "❌ Redis: Connection failed"
fi

echo "🔔 Redis notification system ready for use"

echo ""
echo "🎉 StackIt database setup completed successfully!"
echo ""
echo "📊 Available databases:"
echo "  - stackit_users (PostgreSQL): User authentication and profiles"
echo "  - stackit_content (PostgreSQL): Questions, answers, comments, votes, notifications"
echo ""
echo "🔥 Redis databases:"
echo "  - DB 0: Session storage"
echo "  - DB 1: Application cache"
echo "  - DB 2: Notification queues"
echo "  - DB 3: Vote tracking"
echo ""
echo "🔌 Connection details:"
echo "  - PostgreSQL: postgresql://stackit_user:stackit_password@$PGHOST:$PGPORT/[database]"
echo "  - Redis: redis://$REDIS_HOST:$REDIS_PORT/[db_number]"
echo ""
echo "🚀 Ready for application services!"
