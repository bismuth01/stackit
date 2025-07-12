const { Pool } = require('pg');
const redis = require('redis');

// PostgreSQL connections
const userDbPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.USER_DB_NAME || 'stackit_users',
  user: process.env.DB_USER || 'stackit_user',
  password: process.env.DB_PASSWORD || 'stackit_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const contentDbPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.CONTENT_DB_NAME || 'stackit_content',
  user: process.env.DB_USER || 'stackit_user',
  password: process.env.DB_PASSWORD || 'stackit_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

// Different Redis databases for different purposes
const sessionStore = redis.createClient({
  ...redisConfig,
  db: 0
});

const cacheStore = redis.createClient({
  ...redisConfig,
  db: 1
});

const notificationStore = redis.createClient({
  ...redisConfig,
  db: 2
});

const voteStore = redis.createClient({
  ...redisConfig,
  db: 3
});

// Main Redis client (default db)
const redisClient = redis.createClient(redisConfig);

// Error handling for PostgreSQL connections
userDbPool.on('error', (err) => {
  console.error('Unexpected error on user database client', err);
  process.exit(-1);
});

contentDbPool.on('error', (err) => {
  console.error('Unexpected error on content database client', err);
  process.exit(-1);
});

// Error handling for Redis connections
const handleRedisError = (client, name) => {
  client.on('error', (err) => {
    console.error(`Redis ${name} error:`, err);
  });

  client.on('connect', () => {
    console.log(`Redis ${name} connected`);
  });

  client.on('ready', () => {
    console.log(`Redis ${name} ready`);
  });

  client.on('end', () => {
    console.log(`Redis ${name} connection ended`);
  });
};

handleRedisError(redisClient, 'main');
handleRedisError(sessionStore, 'session store');
handleRedisError(cacheStore, 'cache store');
handleRedisError(notificationStore, 'notification store');
handleRedisError(voteStore, 'vote store');

// Connect Redis clients
const connectRedis = async () => {
  try {
    await Promise.all([
      redisClient.connect(),
      sessionStore.connect(),
      cacheStore.connect(),
      notificationStore.connect(),
      voteStore.connect(),
    ]);
    console.log('All Redis connections established');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(-1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Starting graceful shutdown...');

  try {
    // Close PostgreSQL pools
    await userDbPool.end();
    await contentDbPool.end();

    // Close Redis connections
    await Promise.all([
      redisClient.quit(),
      sessionStore.quit(),
      cacheStore.quit(),
      notificationStore.quit(),
      voteStore.quit(),
    ]);

    console.log('All database connections closed');
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
  }
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = {
  userDb: userDbPool,
  contentDb: contentDbPool,
  redis: redisClient,
  sessionStore,
  cacheStore,
  notificationStore,
  voteStore,
  connectRedis,
  gracefulShutdown,
};
