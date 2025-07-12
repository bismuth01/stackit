#!/bin/bash
set -e

# PostgreSQL Database Initialization Script
# This script runs automatically when the PostgreSQL container starts for the first time

echo "🚀 Initializing StackIt databases..."

# Create the stackit_user
echo "📊 Creating stackit_user..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'stackit_user') THEN
            CREATE USER stackit_user WITH PASSWORD 'stackit_password';
            ALTER USER stackit_user CREATEDB;
        END IF;
    END
    \$\$;
EOSQL

# Create stackit_users database
echo "📊 Creating stackit_users database..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE stackit_users OWNER stackit_user'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stackit_users')\gexec
EOSQL

# Create stackit_content database
echo "📊 Creating stackit_content database..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE stackit_content OWNER stackit_user'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stackit_content')\gexec
EOSQL

# Grant privileges
echo "🔐 Granting privileges..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    GRANT ALL PRIVILEGES ON DATABASE stackit_users TO stackit_user;
    GRANT ALL PRIVILEGES ON DATABASE stackit_content TO stackit_user;
EOSQL

echo "✅ Database initialization completed!"
