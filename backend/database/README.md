# StackIt Database Setup Guide

This directory contains all the database setup scripts, schemas, and utilities for the StackIt platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Setup](#quick-setup)
- [Manual Setup](#manual-setup)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## 🎯 Overview

The StackIt platform uses a microservices architecture with:

- **PostgreSQL**: Two separate databases
  - `stackit_users`: User authentication and profiles
  - `stackit_content`: Questions, answers, votes, and comments
- **Redis**: Multiple databases for different purposes
  - DB 0: Session storage
  - DB 1: Application cache
  - DB 2: Notification queues
  - DB 3: Vote tracking

## 🚀 Quick Setup

### Option 1: Docker Setup (Recommended)

The easiest way to get started with StackIt databases:

```bash
# Navigate to backend directory
cd backend

# One-command setup
./docker.sh setup
./docker.sh up dev
```

This provides:
- ✅ **PostgreSQL** with all schemas and data
- ✅ **Redis** with optimized configuration  
- ✅ **PgAdmin** at http://localhost:5050
- ✅ **Redis Commander** at http://localhost:8081
- ✅ **Automatic testing** and health checks

See [Docker Guide](../DOCKER.md) for complete documentation.

### Option 2: Local Installation

If you prefer local installation:

#### Prerequisites

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Install Redis**
   ```bash
   # macOS
   brew install redis
   brew services start redis

   # Ubuntu/Debian
   sudo apt install redis-server
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   ```

3. **Install Node.js** (if not already installed)
   ```bash
   # macOS
   brew install node

   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

#### Automated Setup

Run the automated setup script:

```bash
# From the project root
chmod +x database/scripts/setup-databases.sh
./database/scripts/setup-databases.sh
```

This script will:
- ✅ Check PostgreSQL and Redis installations
- ✅ Create database user and databases
- ✅ Initialize schemas with sample data
- ✅ Test all connections
- ✅ Display next steps

#### Verify Setup

```bash
# Test database connections
node database/scripts/test-connections.js
```

## 🔧 Manual Setup (Local Installation Only)

If you prefer to set up manually or the automated script fails:

### 1. Create PostgreSQL User and Databases

```bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL shell:
CREATE USER stackit_user WITH PASSWORD 'stackit_password';
CREATE DATABASE stackit_users OWNER stackit_user;
CREATE DATABASE stackit_content OWNER stackit_user;
GRANT ALL PRIVILEGES ON DATABASE stackit_users TO stackit_user;
GRANT ALL PRIVILEGES ON DATABASE stackit_content TO stackit_user;
\q
```

### 2. Initialize Database Schemas

```bash
# Setup users database
psql -U stackit_user -d stackit_users -f database/scripts/setup-user-db.sql

# Setup content database
psql -U stackit_user -d stackit_content -f database/scripts/setup-content-db.sql

# Setup notification system
psql -U stackit_user -d stackit_content -f database/scripts/setup-notifications-db.sql
```

### 3. Test Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

## 📊 Database Schema

### Users Database (`stackit_users`)

#### Tables:
- **`users`**: Core user information
  - `id` (UUID, Primary Key)
  - `username` (VARCHAR, Unique)
  - `email` (VARCHAR, Unique)
  - `password_hash` (VARCHAR)
  - `display_name` (VARCHAR)
  - `bio` (TEXT)
  - `avatar_url` (TEXT)
  - `reputation` (INTEGER)
  - `is_verified` (BOOLEAN)
  - `is_active` (BOOLEAN)
  - `created_at`, `updated_at`, `last_login` (TIMESTAMP)

- **`user_sessions`**: Active user sessions
  - `session_id` (VARCHAR, Primary Key)
  - `user_id` (UUID, Foreign Key)
  - `expires_at` (TIMESTAMP)
  - `created_at` (TIMESTAMP)

- **`user_preferences`**: User settings
  - `user_id` (UUID, Primary Key)
  - `email_notifications` (BOOLEAN)
  - `push_notifications` (BOOLEAN)
  - `theme` (VARCHAR)
  - `language` (VARCHAR)
  - `updated_at` (TIMESTAMP)

### Content Database (`stackit_content`)

#### Tables:
- **`questions`**: User questions
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, References users.id)
  - `title` (VARCHAR)
  - `content` (TEXT)
  - `tags` (TEXT[])
  - `vote_count` (INTEGER)
  - `answer_count` (INTEGER)
  - `view_count` (INTEGER)
  - `is_answered` (BOOLEAN)
  - `accepted_answer_id` (UUID)
  - `created_at`, `updated_at` (TIMESTAMP)

- **`answers`**: Answers to questions
  - `id` (UUID, Primary Key)
  - `question_id` (UUID, Foreign Key)
  - `user_id` (UUID, References users.id)
  - `content` (TEXT)
  - `vote_count` (INTEGER)
  - `is_accepted` (BOOLEAN)
  - `created_at`, `updated_at` (TIMESTAMP)

- **`votes`**: User votes on questions/answers
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, References users.id)
  - `target_id` (UUID)
  - `target_type` (VARCHAR: 'question' | 'answer')
  - `vote_type` (VARCHAR: 'up' | 'down')
  - `created_at` (TIMESTAMP)

- **`comments`**: Comments on questions/answers
  - `id` (UUID, Primary Key)
  - `target_id` (UUID)
  - `target_type` (VARCHAR: 'question' | 'answer')
  - `user_id` (UUID, References users.id)
  - `content` (TEXT)
  - `created_at`, `updated_at` (TIMESTAMP)

- **`tags`**: Available tags
  - `id` (UUID, Primary Key)
  - `name` (VARCHAR, Unique)
  - `description` (TEXT)
  - `usage_count` (INTEGER)
  - `created_at` (TIMESTAMP)

- **`notifications`**: In-app notification system
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, References users.id)
  - `type` (VARCHAR: 'answer' | 'comment' | 'mention' | 'vote')
  - `message` (TEXT)
  - `actor_user_id` (UUID, References users.id)
  - `question_id`, `answer_id`, `comment_id` (UUID, Context references)
  - `is_read` (BOOLEAN)
  - `created_at` (TIMESTAMP)

- **`user_notification_preferences`**: User notification settings
  - `user_id` (UUID, Primary Key, References users.id)
  - `answer_notifications`, `comment_notifications`, `mention_notifications`, `vote_notifications` (BOOLEAN)
  - `created_at`, `updated_at` (TIMESTAMP)

#### Triggers:
- **`update_vote_counts`**: Automatically updates vote counts when votes are added/removed
- **`notify_question_answered`**: Creates notification when someone answers a question
- **`notify_content_commented`**: Creates notification when someone comments on content
- **`notify_content_voted`**: Creates notification when someone upvotes content

## 🧪 Testing

### Connection Test
```bash
node database/scripts/test-connections.js
```

### Notification System Test
```bash
node database/scripts/test-notifications.js
```

### Manual Database Queries
```bash
# Test users database
psql -U stackit_user -d stackit_users -c "SELECT COUNT(*) FROM users;"

# Test content database
psql -U stackit_user -d stackit_content -c "SELECT COUNT(*) FROM questions;"

# Test Redis
redis-cli -n 0 ping  # Session store
redis-cli -n 1 ping  # Cache store
redis-cli -n 2 ping  # Notification store
redis-cli -n 3 ping  # Vote store

# Test notification system
SELECT COUNT(*) FROM notifications;
SELECT COUNT(*) FROM user_notification_preferences;
```

### Sample Data Verification
```sql
-- Check sample users
SELECT username, email, reputation FROM users;

-- Check sample questions
SELECT title, tags, vote_count FROM questions;

-- Check sample tags
SELECT name, usage_count FROM tags;

-- Check notification system
SELECT type, message, is_read FROM notifications LIMIT 5;
SELECT user_id, answer_notifications FROM user_notification_preferences;
```

## 🔍 Troubleshooting

### Common Issues

#### PostgreSQL Connection Issues

**Error**: `FATAL: role "stackit_user" does not exist`
```bash
# Create the user manually
psql -U postgres -c "CREATE USER stackit_user WITH PASSWORD 'stackit_password';"
```

**Error**: `FATAL: database "stackit_users" does not exist`
```bash
# Create the databases manually
psql -U postgres -c "CREATE DATABASE stackit_users OWNER stackit_user;"
psql -U postgres -c "CREATE DATABASE stackit_content OWNER stackit_user;"
```

**Error**: `FATAL: password authentication failed`
```bash
# Check pg_hba.conf file (usually in /usr/local/var/postgres/ on macOS)
# Change authentication method to 'md5' or 'trust' for local connections
```

#### Redis Connection Issues

**Error**: `Could not connect to Redis at 127.0.0.1:6379`
```bash
# Start Redis service
# macOS:
brew services start redis

# Ubuntu:
sudo systemctl start redis-server
```

**Error**: `Redis connection timeout`
```bash
# Check Redis configuration
redis-cli config get timeout
redis-cli config set timeout 0  # Disable timeout
```

#### Permission Issues

**Error**: `permission denied for database`
```bash
# Grant proper permissions
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE stackit_users TO stackit_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE stackit_content TO stackit_user;"
```

### Debugging Commands

```bash
# Check PostgreSQL status
pg_isready

# Check Redis status
redis-cli ping

# View PostgreSQL logs (macOS)
tail -f /usr/local/var/log/postgres.log

# View Redis logs (Ubuntu)
sudo journalctl -u redis-server -f

# Check database sizes
psql -U stackit_user -d stackit_users -c "SELECT pg_size_pretty(pg_database_size('stackit_users'));"
psql -U stackit_user -d stackit_content -c "SELECT pg_size_pretty(pg_database_size('stackit_content'));"
```

## ⚙️ Advanced Configuration

### Environment Variables

Each service uses environment variables for database configuration:

```bash
# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_USER=stackit_user
DB_PASSWORD=stackit_password
USER_DB_NAME=stackit_users
CONTENT_DB_NAME=stackit_content

# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Connection Pooling

PostgreSQL connection pools are configured with:
- **Max connections**: 20
- **Idle timeout**: 30 seconds
- **Connection timeout**: 2 seconds

### Redis Databases

- **DB 0**: Session storage (auth-service)
- **DB 1**: Application cache (content-service)
- **DB 2**: Notification queues (notification-service)
- **DB 3**: Vote tracking and real-time features

### Performance Optimization

#### PostgreSQL Indexes
```sql
-- Users database indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_reputation ON users(reputation DESC);

-- Content database indexes
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_vote_count ON questions(vote_count DESC);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
```

#### Redis Configuration
```redis
# Optimize for development
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Backup and Restore

#### PostgreSQL Backup
```bash
# Backup users database
pg_dump -U stackit_user -h localhost stackit_users > database/backups/users_backup.sql

# Backup content database
pg_dump -U stackit_user -h localhost stackit_content > database/backups/content_backup.sql
```

#### PostgreSQL Restore
```bash
# Restore users database
psql -U stackit_user -d stackit_users < database/backups/users_backup.sql

# Restore content database
psql -U stackit_user -d stackit_content < database/backups/content_backup.sql
```

#### Redis Backup
```bash
# Redis automatically creates dump.rdb file
# Copy it for backup
cp /usr/local/var/db/redis/dump.rdb database/backups/redis_backup.rdb
```

## 📁 Directory Structure

```
database/
├── README.md                     # This file
├── scripts/
│   ├── setup-databases.sh        # Automated setup script
│   ├── setup-user-db.sql         # Users database schema
│   ├── setup-content-db.sql      # Content database schema
│   ├── setup-notifications-db.sql # Notification system schema
│   ├── test-connections.js       # Connection test script
│   └── test-notifications.js     # Notification system test
└── backups/                      # Database backup files
    ├── users_backup.sql
    ├── content_backup.sql
    └── redis_backup.rdb
```


## 🔗 Related Documentation

- [Auth Service Documentation](../auth-service/README.md)
- [Content Service Documentation](../content-service/README.md)
- [Notification Service Documentation](../notification-service/README.md)
- [Frontend Documentation](../frontend/README.md)

---

**Happy coding! 🚀**
