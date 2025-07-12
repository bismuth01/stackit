// Simple Database Connection Test (No external dependencies)
// This script tests basic database connections without requiring npm install

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testPostgreSQL() {
  log('\n🔍 Testing PostgreSQL Connection...', 'blue');

  try {
    // Test if PostgreSQL is running
    const { stdout: pgReady } = await execAsync('pg_isready');
    log('✅ PostgreSQL is running', 'green');

    // Test connection to users database
    const usersTest = await execAsync('psql -U stackit_user -d stackit_users -c "SELECT COUNT(*) FROM users;" 2>/dev/null');
    log('✅ Users database connected', 'green');
    log(`   Users count: ${usersTest.stdout.trim().split('\n')[2].trim()}`, 'blue');

    // Test connection to content database
    const contentTest = await execAsync('psql -U stackit_user -d stackit_content -c "SELECT COUNT(*) FROM questions;" 2>/dev/null');
    log('✅ Content database connected', 'green');
    log(`   Questions count: ${contentTest.stdout.trim().split('\n')[2].trim()}`, 'blue');

    return true;
  } catch (error) {
    log('❌ PostgreSQL connection failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testRedis() {
  log('\n🔍 Testing Redis Connection...', 'blue');

  try {
    // Test Redis connection
    const { stdout } = await execAsync('redis-cli ping');
    if (stdout.trim() === 'PONG') {
      log('✅ Redis is running and responding', 'green');

      // Test different Redis databases
      await execAsync('redis-cli -n 0 set test:session "test_data"');
      await execAsync('redis-cli -n 1 set test:cache "cache_data"');
      await execAsync('redis-cli -n 2 set test:notification "notification_data"');
      await execAsync('redis-cli -n 3 set test:vote "vote_data"');

      log('✅ All Redis databases (0-3) accessible', 'green');

      // Cleanup test data
      await execAsync('redis-cli -n 0 del test:session');
      await execAsync('redis-cli -n 1 del test:cache');
      await execAsync('redis-cli -n 2 del test:notification');
      await execAsync('redis-cli -n 3 del test:vote');

      return true;
    } else {
      throw new Error('Redis not responding properly');
    }
  } catch (error) {
    log('❌ Redis connection failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function displayDatabaseInfo() {
  log('\n📊 Database Information...', 'blue');

  try {
    // PostgreSQL version
    const { stdout: pgVersion } = await execAsync('psql -U stackit_user -d stackit_users -c "SELECT version();" -t');
    const version = pgVersion.trim().split(' ')[1];
    log(`PostgreSQL Version: ${version}`, 'blue');

    // Database sizes
    const { stdout: userDbSize } = await execAsync('psql -U stackit_user -d stackit_users -c "SELECT pg_size_pretty(pg_database_size(\'stackit_users\'));" -t');
    log(`Users DB Size: ${userDbSize.trim()}`, 'blue');

    const { stdout: contentDbSize } = await execAsync('psql -U stackit_user -d stackit_content -c "SELECT pg_size_pretty(pg_database_size(\'stackit_content\'));" -t');
    log(`Content DB Size: ${contentDbSize.trim()}`, 'blue');

    // Redis info
    const { stdout: redisInfo } = await execAsync('redis-cli info server | grep redis_version');
    log(`Redis Version: ${redisInfo.split(':')[1].trim()}`, 'blue');

  } catch (error) {
    log('⚠️  Could not retrieve all database information', 'yellow');
  }
}

async function testSampleData() {
  log('\n🔍 Testing Sample Data...', 'blue');

  try {
    // Check sample users
    const { stdout: users } = await execAsync('psql -U stackit_user -d stackit_users -c "SELECT username, reputation FROM users LIMIT 3;" -t');
    log('Sample users found:', 'green');
    users.trim().split('\n').forEach(user => {
      if (user.trim()) {
        log(`   ${user.trim()}`, 'blue');
      }
    });

    // Check sample tags
    const { stdout: tags } = await execAsync('psql -U stackit_user -d stackit_content -c "SELECT name, usage_count FROM tags;" -t');
    log('Sample tags found:', 'green');
    tags.trim().split('\n').forEach(tag => {
      if (tag.trim()) {
        log(`   ${tag.trim()}`, 'blue');
      }
    });

    return true;
  } catch (error) {
    log('⚠️  Could not verify sample data', 'yellow');
    return false;
  }
}

async function showConnectionStrings() {
  log('\n🔗 Connection Strings:', 'blue');
  log('Users DB: postgresql://stackit_user:stackit_password@localhost:5432/stackit_users', 'blue');
  log('Content DB: postgresql://stackit_user:stackit_password@localhost:5432/stackit_content', 'blue');
  log('Redis: redis://localhost:6379', 'blue');
  log('Session Store: redis://localhost:6379/0', 'blue');
  log('Cache Store: redis://localhost:6379/1', 'blue');
  log('Notification Store: redis://localhost:6379/2', 'blue');
  log('Vote Store: redis://localhost:6379/3', 'blue');
}

async function main() {
  log('🚀 StackIt Database Simple Connection Test', 'green');
  log('==========================================', 'green');

  const startTime = Date.now();

  // Run tests
  const pgTest = await testPostgreSQL();
  const redisTest = await testRedis();

  if (pgTest && redisTest) {
    await testSampleData();
    await displayDatabaseInfo();
    await showConnectionStrings();

    const endTime = Date.now();
    const duration = endTime - startTime;

    log('\n🎉 All database connections successful!', 'green');
    log(`⏱️  Test completed in ${duration}ms`, 'blue');
    log('\n🚀 Your StackIt platform database is ready!', 'green');
    log('\nNext steps:', 'yellow');
    log('1. Install Node.js and npm if not already installed', 'blue');
    log('2. Install dependencies for each service:', 'blue');
    log('   cd auth-service && npm install', 'blue');
    log('   cd content-service && npm install', 'blue');
    log('   cd notification-service && npm install', 'blue');
    log('3. Start developing your services!', 'blue');

    process.exit(0);
  } else {
    log('\n❌ Some database connections failed', 'red');
    log('\n🔧 Troubleshooting:', 'yellow');
    log('1. Make sure PostgreSQL is running:', 'blue');
    log('   macOS: brew services start postgresql', 'blue');
    log('   Ubuntu: sudo systemctl start postgresql', 'blue');
    log('2. Make sure Redis is running:', 'blue');
    log('   macOS: brew services start redis', 'blue');
    log('   Ubuntu: sudo systemctl start redis-server', 'blue');
    log('3. Check if databases were created:', 'blue');
    log('   ./database/scripts/setup-databases.sh', 'blue');

    process.exit(1);
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  log('\n\n🛑 Test interrupted by user', 'yellow');
  process.exit(0);
});

// Run the test
main().catch(error => {
  log('\n❌ Unexpected error:', 'red');
  log(error.message, 'red');
  process.exit(1);
});
