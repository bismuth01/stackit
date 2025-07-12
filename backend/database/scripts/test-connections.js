const { Client } = require("pg");
const redis = require("redis");

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "stackit_user",
  password: process.env.DB_PASSWORD || "stackit_password",
};

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
};

async function testPostgreSQLConnections() {
  console.log("🔍 Testing PostgreSQL connections...\n");

  const databases = [
    { name: "Users Database", db: "stackit_users" },
    { name: "Content Database", db: "stackit_content" },
  ];

  for (const database of databases) {
    try {
      console.log(`Testing ${database.name}...`);
      const client = new Client({
        ...dbConfig,
        database: database.db,
      });

      await client.connect();

      // Test basic query
      const result = await client.query(
        "SELECT NOW() as current_time, current_database() as db_name",
      );
      console.log(`✅ ${database.name} connected successfully`);
      console.log(`   Database: ${result.rows[0].db_name}`);
      console.log(`   Time: ${result.rows[0].current_time}`);

      // Test table counts if in content database
      if (database.db === "stackit_content") {
        try {
          const tableResult = await client.query(`
                        SELECT
                            (SELECT COUNT(*) FROM questions) as questions,
                            (SELECT COUNT(*) FROM answers) as answers,
                            (SELECT COUNT(*) FROM notifications) as notifications,
                            (SELECT COUNT(*) FROM user_notification_preferences) as preferences
                    `);
          console.log(
            `   Tables: ${tableResult.rows[0].questions} questions, ${tableResult.rows[0].answers} answers`,
          );
          console.log(
            `   Notifications: ${tableResult.rows[0].notifications} total, ${tableResult.rows[0].preferences} user preferences`,
          );
        } catch (tableError) {
          console.log(
            `   ⚠️  Could not query table counts: ${tableError.message}`,
          );
        }
      }

      if (database.db === "stackit_users") {
        try {
          const userResult = await client.query(
            "SELECT COUNT(*) as count FROM users",
          );
          console.log(`   Users: ${userResult.rows[0].count} registered`);
        } catch (userError) {
          console.log(
            `   ⚠️  Could not query user count: ${userError.message}`,
          );
        }
      }

      await client.end();
      console.log("");
    } catch (error) {
      console.error(`❌ ${database.name} connection failed:`);
      console.error(`   Error: ${error.message}`);
      console.log("");
      throw error;
    }
  }
}

async function testRedisConnections() {
  console.log("🔍 Testing Redis connections...\n");

  const databases = [
    { name: "Session Store (DB 0)", db: 0 },
    { name: "Cache Store (DB 1)", db: 1 },
    { name: "Notification Store (DB 2)", db: 2 },
    { name: "Vote Store (DB 3)", db: 3 },
  ];

  for (const database of databases) {
    let client;
    try {
      console.log(`Testing ${database.name}...`);

      client = redis.createClient({
        host: redisConfig.host,
        port: redisConfig.port,
        db: database.db,
      });

      await client.connect();

      // Test basic operations
      const pingResult = await client.ping();
      console.log(`✅ ${database.name} connected successfully`);
      console.log(`   Ping response: ${pingResult}`);

      // Test set/get operations
      const testKey = `test_connection_${Date.now()}`;
      await client.set(testKey, "test_value", { EX: 10 });
      const getValue = await client.get(testKey);

      if (getValue === "test_value") {
        console.log(`   Read/Write: Working`);
        await client.del(testKey);
      } else {
        console.log(`   ⚠️  Read/Write test failed`);
      }

      // Get database info
      const info = await client.info("keyspace");
      const dbInfo = info
        .split("\n")
        .find((line) => line.startsWith(`db${database.db}:`));
      if (dbInfo) {
        const keys = dbInfo.match(/keys=(\d+)/);
        console.log(`   Keys: ${keys ? keys[1] : "0"}`);
      } else {
        console.log(`   Keys: 0 (empty database)`);
      }

      await client.quit();
      console.log("");
    } catch (error) {
      console.error(`❌ ${database.name} connection failed:`);
      console.error(`   Error: ${error.message}`);
      if (client) {
        try {
          await client.quit();
        } catch (e) {}
      }
      console.log("");
      throw error;
    }
  }
}

async function testNotificationSystem() {
  console.log("🔍 Testing Notification System...\n");

  try {
    const client = new Client({
      ...dbConfig,
      database: "stackit_content",
    });

    await client.connect();

    // Test notification functions
    console.log("Testing notification functions...");

    // Test unread count function
    const unreadResult = await client.query(`
            SELECT get_unread_notification_count('11111111-1111-1111-1111-111111111111'::uuid) as count
        `);
    console.log(
      `✅ Unread count function works: ${unreadResult.rows[0].count} unread notifications`,
    );

    // Test notification triggers exist
    const triggerResult = await client.query(`
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers
            WHERE trigger_name LIKE '%notify%'
            ORDER BY trigger_name
        `);

    console.log(`✅ Found ${triggerResult.rows.length} notification triggers:`);
    triggerResult.rows.forEach((row) => {
      console.log(`   - ${row.trigger_name} on ${row.event_object_table}`);
    });

    // Test notification view
    const viewResult = await client.query(`
            SELECT COUNT(*) as count FROM notification_details LIMIT 1
        `);
    console.log(`✅ Notification view accessible`);

    await client.end();
    console.log("");
  } catch (error) {
    console.error("❌ Notification system test failed:");
    console.error(`   Error: ${error.message}`);
    console.log("");
    throw error;
  }
}

async function runAllTests() {
  console.log("🚀 StackIt Database Connection Tests");
  console.log("====================================\n");

  try {
    await testPostgreSQLConnections();
    await testRedisConnections();
    await testNotificationSystem();

    console.log("🎉 All tests passed successfully!");
    console.log("\n📊 Summary:");
    console.log("  ✅ PostgreSQL databases connected");
    console.log("  ✅ Redis databases connected");
    console.log("  ✅ Notification system functional");
    console.log("\n🔗 Connection details:");
    console.log(`  PostgreSQL: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`  Redis: ${redisConfig.host}:${redisConfig.port}`);
    console.log("\n🎛️  Management interfaces:");
    console.log("  PgAdmin: http://localhost:5050");
    console.log("  Redis Commander: http://localhost:8081");
  } catch (error) {
    console.error("\n💥 Tests failed!");
    console.error("Please check the error messages above and ensure:");
    console.error("  1. Docker containers are running: ./docker.sh status");
    console.error("  2. Database setup completed: ./docker.sh logs db_setup");
    console.error("  3. No port conflicts with local services");
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testPostgreSQLConnections,
  testRedisConnections,
  testNotificationSystem,
  runAllTests,
};
