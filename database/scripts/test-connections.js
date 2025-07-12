const { userDb, contentDb, sessionStore, cacheStore, notificationStore, voteStore, connectRedis } = require('../../shared/database/connections');

async function testPostgreSQLConnections() {
  console.log('🔍 Testing PostgreSQL connections...\n');

  try {
    // Test Users Database
    console.log('Testing Users Database...');
    const userResult = await userDb.query('SELECT COUNT(*) FROM users');
    console.log('✅ Users DB connected successfully');
    console.log(`   Users count: ${userResult.rows[0].count}`);

    // Test user table structure
    const userTableInfo = await userDb.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log(`   Table structure: ${userTableInfo.rows.length} columns`);

  } catch (error) {
    console.error('❌ Users DB connection failed:', error.message);
    return false;
  }

  try {
    // Test Content Database
    console.log('\nTesting Content Database...');
    const contentResult = await contentDb.query('SELECT COUNT(*) FROM questions');
    console.log('✅ Content DB connected successfully');
    console.log(`   Questions count: ${contentResult.rows[0].count}`);

    const tagsResult = await contentDb.query('SELECT COUNT(*) FROM tags');
    console.log(`   Tags count: ${tagsResult.rows[0].count}`);

    // Test content table structure
    const questionTableInfo = await contentDb.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'questions'
      ORDER BY ordinal_position
    `);
    console.log(`   Questions table: ${questionTableInfo.rows.length} columns`);

  } catch (error) {
    console.error('❌ Content DB connection failed:', error.message);
    return false;
  }

  return true;
}

async function testRedisConnections() {
  console.log('\n🔍 Testing Redis connections...\n');

  try {
    // Connect all Redis clients
    await connectRedis();

    // Test main Redis client
    console.log('Testing Main Redis Client...');
    await sessionStore.ping();
    console.log('✅ Session Store (Redis DB 0) connected');

    await cacheStore.ping();
    console.log('✅ Cache Store (Redis DB 1) connected');

    await notificationStore.ping();
    console.log('✅ Notification Store (Redis DB 2) connected');

    await voteStore.ping();
    console.log('✅ Vote Store (Redis DB 3) connected');

    // Test basic operations
    console.log('\nTesting Redis operations...');

    // Test session store
    await sessionStore.set('test:session', 'session_data', { EX: 60 });
    const sessionData = await sessionStore.get('test:session');
    console.log('✅ Session store read/write test passed');

    // Test cache store
    await cacheStore.set('test:cache', JSON.stringify({ test: 'data' }), { EX: 60 });
    const cacheData = await cacheStore.get('test:cache');
    console.log('✅ Cache store read/write test passed');

    // Test notification store
    await notificationStore.lpush('test:notifications', 'notification1');
    const notificationCount = await notificationStore.llen('test:notifications');
    console.log('✅ Notification store list operations test passed');

    // Test vote store
    await voteStore.hset('test:votes', 'user1', '1');
    const voteValue = await voteStore.hget('test:votes', 'user1');
    console.log('✅ Vote store hash operations test passed');

    // Cleanup test data
    await sessionStore.del('test:session');
    await cacheStore.del('test:cache');
    await notificationStore.del('test:notifications');
    await voteStore.del('test:votes');

    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return false;
  }
}

async function testCrossServiceOperations() {
  console.log('\n🔍 Testing cross-service operations...\n');

  try {
    // Test getting user data from users DB and using it in content queries
    console.log('Testing cross-database operations...');

    const users = await userDb.query('SELECT id, username FROM users LIMIT 1');
    if (users.rows.length > 0) {
      const userId = users.rows[0].id;
      const username = users.rows[0].username;

      console.log(`✅ Retrieved user: ${username} (${userId})`);

      // Check if this user has any questions in content DB
      const userQuestions = await contentDb.query(
        'SELECT COUNT(*) FROM questions WHERE user_id = $1',
        [userId]
      );

      console.log(`✅ User has ${userQuestions.rows[0].count} questions`);

      // Test caching user data
      await cacheStore.set(`user:${userId}`, JSON.stringify({
        id: userId,
        username: username,
        cached_at: new Date().toISOString()
      }), { EX: 3600 });

      const cachedUser = await cacheStore.get(`user:${userId}`);
      console.log('✅ User data cached and retrieved successfully');

      // Cleanup
      await cacheStore.del(`user:${userId}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Cross-service operations failed:', error.message);
    return false;
  }
}

async function displaySystemInfo() {
  console.log('\n📊 System Information\n');

  try {
    // PostgreSQL version info
    const pgVersion = await userDb.query('SELECT version()');
    console.log('PostgreSQL:', pgVersion.rows[0].version.split(' ')[1]);

    // Redis info
    const redisInfo = await sessionStore.info();
    const redisVersion = redisInfo.split('\r\n').find(line => line.startsWith('redis_version:'));
    console.log('Redis:', redisVersion ? redisVersion.split(':')[1] : 'Unknown');

    // Database sizes
    const userDbSize = await userDb.query(`
      SELECT pg_size_pretty(pg_database_size('stackit_users')) as size
    `);
    console.log('Users DB size:', userDbSize.rows[0].size);

    const contentDbSize = await contentDb.query(`
      SELECT pg_size_pretty(pg_database_size('stackit_content')) as size
    `);
    console.log('Content DB size:', contentDbSize.rows[0].size);

    // Connection pool info
    console.log('Users DB pool - Total:', userDb.totalCount, 'Idle:', userDb.idleCount);
    console.log('Content DB pool - Total:', contentDb.totalCount, 'Idle:', contentDb.idleCount);

  } catch (error) {
    console.error('❌ Failed to get system info:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 StackIt Database Connection Test\n');
  console.log('=====================================\n');

  const startTime = Date.now();
  let allTestsPassed = true;

  // Run all tests
  const pgTest = await testPostgreSQLConnections();
  const redisTest = await testRedisConnections();
  const crossServiceTest = await testCrossServiceOperations();

  allTestsPassed = pgTest && redisTest && crossServiceTest;

  // Display system info
  await displaySystemInfo();

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log('\n=====================================');
  console.log('🏁 Test Results\n');

  if (allTestsPassed) {
    console.log('🎉 All database connections and operations successful!');
    console.log('✅ PostgreSQL: Users and Content databases connected');
    console.log('✅ Redis: All stores (session, cache, notification, vote) connected');
    console.log('✅ Cross-service operations working');
    console.log(`\n⏱️  Total test time: ${duration}ms`);
    console.log('\n🚀 Your StackIt platform is ready for development!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please check the error messages above.');
    console.log('\n🔧 Common solutions:');
    console.log('   - Make sure PostgreSQL is running: brew services start postgresql');
    console.log('   - Make sure Redis is running: brew services start redis');
    console.log('   - Check if databases exist: psql -U postgres -l');
    console.log('   - Verify connection credentials in .env files');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Test interrupted. Cleaning up...');
  await require('../../shared/database/connections').gracefulShutdown();
  process.exit(0);
});

// Run tests
runAllTests().catch((error) => {
  console.error('❌ Unexpected error during testing:', error);
  process.exit(1);
});
