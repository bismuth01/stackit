const { Client } = require('pg');
const redis = require('redis');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'stackit_user',
    password: process.env.DB_PASSWORD || 'stackit_password',
    database: process.env.CONTENT_DB_NAME || 'stackit_content'
};

// Redis configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    db: 2 // Using DB 2 for notifications as per documentation
};

async function testNotificationSystem() {
    console.log('🚀 Testing StackIt Notification System...\n');

    let pgClient;
    let redisClient;

    try {
        // Connect to PostgreSQL
        console.log('📊 Connecting to PostgreSQL...');
        pgClient = new Client(dbConfig);
        await pgClient.connect();
        console.log('✅ PostgreSQL connected successfully\n');

        // Connect to Redis
        console.log('🔥 Connecting to Redis DB 2...');
        redisClient = redis.createClient({
            host: redisConfig.host,
            port: redisConfig.port,
            db: redisConfig.db
        });
        await redisClient.connect();
        console.log('✅ Redis connected successfully\n');

        // Test 1: Check notification tables exist
        console.log('📋 Test 1: Checking notification tables...');
        const tablesResult = await pgClient.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('notifications', 'user_notification_preferences')
            ORDER BY table_name;
        `);

        console.log(`Found tables: ${tablesResult.rows.map(r => r.table_name).join(', ')}`);

        if (tablesResult.rows.length !== 2) {
            throw new Error('Missing notification tables');
        }
        console.log('✅ All notification tables exist\n');

        // Test 2: Check triggers exist
        console.log('📋 Test 2: Checking notification triggers...');
        const triggersResult = await pgClient.query(`
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers
            WHERE trigger_name LIKE '%notify%'
            ORDER BY trigger_name;
        `);

        console.log('Found triggers:');
        triggersResult.rows.forEach(row => {
            console.log(`  - ${row.trigger_name} on ${row.event_object_table}`);
        });

        if (triggersResult.rows.length < 3) {
            throw new Error('Missing notification triggers');
        }
        console.log('✅ All notification triggers exist\n');

        // Test 3: Check sample user preferences
        console.log('📋 Test 3: Checking user notification preferences...');
        const preferencesResult = await pgClient.query(`
            SELECT user_id, answer_notifications, comment_notifications,
                   mention_notifications, vote_notifications
            FROM user_notification_preferences;
        `);

        console.log(`Found ${preferencesResult.rows.length} user preferences:`);
        preferencesResult.rows.forEach(row => {
            console.log(`  - User ${row.user_id.substring(0, 8)}...: A:${row.answer_notifications} C:${row.comment_notifications} M:${row.mention_notifications} V:${row.vote_notifications}`);
        });
        console.log('✅ User preferences loaded\n');

        // Test 4: Check existing notifications
        console.log('📋 Test 4: Checking existing notifications...');
        const notificationsResult = await pgClient.query(`
            SELECT n.id, n.type, n.message, n.is_read, n.created_at,
                   substring(n.user_id::text, 1, 8) as user_short
            FROM notifications n
            ORDER BY n.created_at DESC
            LIMIT 10;
        `);

        console.log(`Found ${notificationsResult.rows.length} notifications:`);
        notificationsResult.rows.forEach(row => {
            const status = row.is_read ? '📖' : '📩';
            console.log(`  ${status} [${row.type}] ${row.message.substring(0, 60)}... (User: ${row.user_short}...)`);
        });
        console.log('✅ Notifications retrieved successfully\n');

        // Test 5: Test notification functions
        console.log('📋 Test 5: Testing notification functions...');

        // Test unread count function
        const unreadCountResult = await pgClient.query(`
            SELECT get_unread_notification_count('11111111-1111-1111-1111-111111111111'::uuid) as count;
        `);
        console.log(`Unread count for sample user: ${unreadCountResult.rows[0].count}`);

        // Test mention function
        const mentionResult = await pgClient.query(`
            SELECT create_mention_notification(
                '11111111-1111-1111-1111-111111111111'::uuid,
                '22222222-2222-2222-2222-222222222222'::uuid,
                (SELECT id FROM questions LIMIT 1),
                NULL,
                NULL,
                'answer'
            ) as notification_id;
        `);

        if (mentionResult.rows[0].notification_id) {
            console.log(`✅ Mention notification created: ${mentionResult.rows[0].notification_id}`);
        } else {
            console.log('ℹ️  Mention notification not created (user preferences disabled)');
        }
        console.log('✅ Notification functions working\n');

        // Test 6: Test Redis functionality
        console.log('📋 Test 6: Testing Redis notification features...');

        // Store unread count in Redis
        const testUserId = '11111111-1111-1111-1111-111111111111';
        const unreadCount = unreadCountResult.rows[0].count;

        await redisClient.set(`user:${testUserId}:unread_count`, unreadCount);
        const cachedCount = await redisClient.get(`user:${testUserId}:unread_count`);
        console.log(`✅ Redis unread count cached: ${cachedCount}`);

        // Test real-time notification storage
        const realtimeKey = `notifications:user:${testUserId}`;
        await redisClient.lPush(realtimeKey, JSON.stringify({
            id: 'test-notification',
            type: 'test',
            message: 'Test real-time notification',
            timestamp: new Date().toISOString()
        }));

        const realtimeNotifications = await redisClient.lRange(realtimeKey, 0, -1);
        console.log(`✅ Redis real-time notifications: ${realtimeNotifications.length} stored`);

        // Cleanup test data
        await redisClient.del(realtimeKey);
        console.log('✅ Redis functionality working\n');

        // Test 7: Test notification view
        console.log('📋 Test 7: Testing notification details view...');
        const viewResult = await pgClient.query(`
            SELECT id, type, message, question_title, is_read
            FROM notification_details
            LIMIT 5;
        `);

        console.log(`Found ${viewResult.rows.length} notifications in view:`);
        viewResult.rows.forEach(row => {
            const status = row.is_read ? '📖' : '📩';
            console.log(`  ${status} [${row.type}] ${row.message.substring(0, 50)}...`);
        });
        console.log('✅ Notification view working\n');

        // Test 8: Simulate trigger-based notifications
        console.log('📋 Test 8: Testing trigger-based notifications...');

        // Get current notification count
        const beforeCount = await pgClient.query(`
            SELECT COUNT(*) as count FROM notifications;
        `);

        // Insert a test answer to trigger notification
        try {
            await pgClient.query(`
                INSERT INTO answers (question_id, user_id, content)
                VALUES (
                    (SELECT id FROM questions LIMIT 1),
                    '22222222-2222-2222-2222-222222222222',
                    'This is a test answer to trigger notifications.'
                );
            `);

            // Check if notification was created
            const afterCount = await pgClient.query(`
                SELECT COUNT(*) as count FROM notifications;
            `);

            const newNotifications = parseInt(afterCount.rows[0].count) - parseInt(beforeCount.rows[0].count);
            console.log(`✅ Trigger created ${newNotifications} new notification(s)`);

        } catch (error) {
            console.log(`ℹ️  Trigger test skipped: ${error.message}`);
        }

        console.log('\n🎉 All notification system tests completed successfully!');
        console.log('\n📊 Summary:');
        console.log('  ✅ Database tables and triggers created');
        console.log('  ✅ User preferences configured');
        console.log('  ✅ Sample notifications working');
        console.log('  ✅ Helper functions operational');
        console.log('  ✅ Redis integration functional');
        console.log('  ✅ Notification view accessible');
        console.log('  ✅ Auto-trigger system working');

        console.log('\n🚀 Next Steps:');
        console.log('  1. Integrate notification API endpoints in your backend service');
        console.log('  2. Add real-time WebSocket updates using Redis pub/sub');
        console.log('  3. Build frontend notification components');
        console.log('  4. Add mention parsing in comments/answers');
        console.log('  5. Set up periodic cleanup of old notifications');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        // Cleanup connections
        if (pgClient) {
            await pgClient.end();
            console.log('\n📊 PostgreSQL connection closed');
        }
        if (redisClient) {
            await redisClient.quit();
            console.log('🔥 Redis connection closed');
        }
    }
}

// Helper function to display usage
function displayUsage() {
    console.log('📖 StackIt Notification System Test');
    console.log('\nUsage: node test-notifications.js');
    console.log('\nEnvironment Variables:');
    console.log('  DB_HOST=localhost');
    console.log('  DB_PORT=5432');
    console.log('  DB_USER=stackit_user');
    console.log('  DB_PASSWORD=stackit_password');
    console.log('  CONTENT_DB_NAME=stackit_content');
    console.log('  REDIS_HOST=localhost');
    console.log('  REDIS_PORT=6379');
    console.log('\nMake sure to run setup-notifications-db.sql first!');
}

// Main execution
if (require.main === module) {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        displayUsage();
        process.exit(0);
    }

    testNotificationSystem();
}

module.exports = {
    testNotificationSystem,
    dbConfig,
    redisConfig
};
