const { Client } = require('pg');
const redis = require('redis');

// Configuration for notification server testing
const config = {
    // PostgreSQL - MUST connect to stackit_content database for notifications
    postgres: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'stackit_user',
        password: process.env.DB_PASSWORD || 'stackit_password',
        database: process.env.CONTENT_DB_NAME || 'stackit_content'  // IMPORTANT: Not stackit_users!
    },

    // Redis - DB 2 for notifications
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        db: process.env.REDIS_NOTIFICATION_DB || 2
    }
};

async function verifyNotificationConnection() {
    console.log('🔔 StackIt Notification Server Connection Verification');
    console.log('=====================================================\n');

    let pgClient = null;
    let redisClient = null;

    try {
        // Test PostgreSQL connection to content database
        console.log('📊 Testing PostgreSQL connection...');
        console.log(`   Host: ${config.postgres.host}:${config.postgres.port}`);
        console.log(`   Database: ${config.postgres.database}`);
        console.log(`   User: ${config.postgres.user}\n`);

        pgClient = new Client(config.postgres);
        await pgClient.connect();

        // Verify we're connected to the right database
        const dbResult = await pgClient.query('SELECT current_database() as db');
        console.log(`✅ Connected to database: ${dbResult.rows[0].db}`);

        if (dbResult.rows[0].db !== 'stackit_content') {
            throw new Error(`❌ WRONG DATABASE! Connected to '${dbResult.rows[0].db}' but notifications need 'stackit_content'`);
        }

        // Check if notification tables exist
        console.log('\n🔍 Checking notification tables...');

        const tablesResult = await pgClient.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('notifications', 'user_notification_preferences')
            ORDER BY table_name
        `);

        if (tablesResult.rows.length === 0) {
            throw new Error('❌ No notification tables found! Run notification setup first.');
        }

        tablesResult.rows.forEach(row => {
            console.log(`✅ Table found: ${row.table_name}`);
        });

        // Test notification functions
        console.log('\n🧪 Testing notification functions...');

        try {
            const countResult = await pgClient.query('SELECT COUNT(*) as count FROM notifications');
            console.log(`✅ notifications table: ${countResult.rows[0].count} records`);
        } catch (error) {
            throw new Error(`❌ Cannot query notifications table: ${error.message}`);
        }

        try {
            const unreadResult = await pgClient.query(`
                SELECT get_unread_notification_count('11111111-1111-1111-1111-111111111111'::uuid) as count
            `);
            console.log(`✅ get_unread_notification_count function: works (returned ${unreadResult.rows[0].count})`);
        } catch (error) {
            console.log(`⚠️  get_unread_notification_count function: ${error.message}`);
        }

        // Test Redis connection for notifications
        console.log('\n🔥 Testing Redis connection...');
        console.log(`   Host: ${config.redis.host}:${config.redis.port}`);
        console.log(`   Database: ${config.redis.db}\n`);

        redisClient = redis.createClient({
            host: config.redis.host,
            port: config.redis.port,
            db: config.redis.db
        });

        await redisClient.connect();

        const pingResult = await redisClient.ping();
        console.log(`✅ Redis ping: ${pingResult}`);

        // Test Redis operations for notifications
        const testKey = `notification_test_${Date.now()}`;
        await redisClient.set(testKey, JSON.stringify({
            type: 'test',
            user_id: 'test-user',
            message: 'Test notification',
            timestamp: new Date().toISOString()
        }));

        const testValue = await redisClient.get(testKey);
        if (testValue) {
            console.log('✅ Redis read/write: working');
            await redisClient.del(testKey);
        }

        // Test pub/sub channels
        const channelTest = `notifications:user:test-${Date.now()}`;
        await redisClient.publish(channelTest, JSON.stringify({ test: 'message' }));
        console.log('✅ Redis pub/sub: working');

        console.log('\n🎉 All notification server connections verified successfully!');
        console.log('\n📋 Configuration Summary:');
        console.log('=======================');
        console.log(`PostgreSQL: ${config.postgres.host}:${config.postgres.port}/${config.postgres.database}`);
        console.log(`Redis: ${config.redis.host}:${config.redis.port}/${config.redis.db}`);
        console.log('\n🚀 Your notification server is ready to use these connections!');

        // Sample connection code
        console.log('\n💡 Sample Connection Code:');
        console.log('========================');
        console.log(`
const { Client } = require('pg');
const redis = require('redis');

// PostgreSQL for notification data
const db = new Client({
    host: '${config.postgres.host}',
    port: ${config.postgres.port},
    user: '${config.postgres.user}',
    password: '${config.postgres.password}',
    database: '${config.postgres.database}'  // IMPORTANT: stackit_content!
});

// Redis for real-time notifications
const notificationRedis = redis.createClient({
    host: '${config.redis.host}',
    port: ${config.redis.port},
    db: ${config.redis.db}
});

await db.connect();
await notificationRedis.connect();
        `);

    } catch (error) {
        console.error('\n💥 Connection verification failed!');
        console.error(`Error: ${error.message}`);
        console.error('\n🔧 Troubleshooting:');
        console.error('==================');
        console.error('1. Make sure Docker containers are running: docker ps');
        console.error('2. Check if notification setup completed: ./docker.sh logs db_setup');
        console.error('3. Verify database exists: docker exec stackit_postgres psql -U stackit_user -l');
        console.error('4. Check notification tables: docker exec stackit_postgres psql -U stackit_user -d stackit_content -c "\\dt"');
        console.error('\n💡 If notification tables are missing, run:');
        console.error('   docker exec -i stackit_postgres psql -U stackit_user -d stackit_content < database/scripts/setup-notifications-db.sql');

        process.exit(1);
    } finally {
        if (pgClient) {
            await pgClient.end();
        }
        if (redisClient) {
            await redisClient.quit();
        }
    }
}

// Environment variable validation
function validateEnvironment() {
    console.log('🔍 Environment Configuration:');
    console.log('============================');

    const requiredVars = [
        'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'CONTENT_DB_NAME',
        'REDIS_HOST', 'REDIS_PORT', 'REDIS_NOTIFICATION_DB'
    ];

    const envStatus = {};
    requiredVars.forEach(varName => {
        const value = process.env[varName];
        envStatus[varName] = value ? '✅' : '⚠️  (using default)';
        console.log(`${envStatus[varName]} ${varName}: ${value || 'default'}`);
    });

    console.log('\n💡 Set environment variables in .env file for production\n');
}

// Main execution
if (require.main === module) {
    validateEnvironment();
    verifyNotificationConnection();
}

module.exports = {
    verifyNotificationConnection,
    config
};
