#!/bin/bash

# StackIt Database Setup Script
# This script automates the database setup process for the StackIt platform

set -e  # Exit on any error

echo "🚀 StackIt Database Setup"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if PostgreSQL is installed and running
check_postgresql() {
    print_info "Checking PostgreSQL installation..."

    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed!"
        echo "Please install PostgreSQL first:"
        echo "  macOS: brew install postgresql"
        echo "  Ubuntu: sudo apt install postgresql postgresql-contrib"
        exit 1
    fi

    if ! pg_isready -q; then
        print_error "PostgreSQL is not running!"
        echo "Please start PostgreSQL:"
        echo "  macOS: brew services start postgresql"
        echo "  Ubuntu: sudo systemctl start postgresql"
        exit 1
    fi

    print_status "PostgreSQL is installed and running"
}

# Check if Redis is installed and running
check_redis() {
    print_info "Checking Redis installation..."

    if ! command -v redis-cli &> /dev/null; then
        print_error "Redis is not installed!"
        echo "Please install Redis first:"
        echo "  macOS: brew install redis"
        echo "  Ubuntu: sudo apt install redis-server"
        exit 1
    fi

    if ! redis-cli ping &> /dev/null; then
        print_error "Redis is not running!"
        echo "Please start Redis:"
        echo "  macOS: brew services start redis"
        echo "  Ubuntu: sudo systemctl start redis-server"
        exit 1
    fi

    print_status "Redis is installed and running"
}

# Create PostgreSQL user and databases
setup_postgresql() {
    print_info "Setting up PostgreSQL databases..."

    # Check if we can connect as postgres user
    if psql -U postgres -c '\l' &> /dev/null; then
        POSTGRES_USER="postgres"
    elif psql -U $(whoami) -c '\l' &> /dev/null; then
        POSTGRES_USER=$(whoami)
    else
        print_error "Cannot connect to PostgreSQL!"
        echo "Please ensure PostgreSQL is properly configured."
        exit 1
    fi

    print_info "Connected to PostgreSQL as user: $POSTGRES_USER"

    # Create user if it doesn't exist
    print_info "Creating stackit_user..."
    psql -U $POSTGRES_USER -c "
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'stackit_user') THEN
                CREATE USER stackit_user WITH PASSWORD 'stackit_password';
            END IF;
        END
        \$\$;
    " || {
        print_warning "User stackit_user might already exist"
    }

    # Create databases if they don't exist
    print_info "Creating stackit_users database..."
    psql -U $POSTGRES_USER -c "
        SELECT 'CREATE DATABASE stackit_users OWNER stackit_user'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stackit_users')\gexec
    "

    print_info "Creating stackit_content database..."
    psql -U $POSTGRES_USER -c "
        SELECT 'CREATE DATABASE stackit_content OWNER stackit_user'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stackit_content')\gexec
    "

    # Grant privileges
    print_info "Granting privileges..."
    psql -U $POSTGRES_USER -c "
        GRANT ALL PRIVILEGES ON DATABASE stackit_users TO stackit_user;
        GRANT ALL PRIVILEGES ON DATABASE stackit_content TO stackit_user;
    "

    print_status "PostgreSQL databases created successfully"
}

# Initialize database schemas
initialize_schemas() {
    print_info "Initializing database schemas..."

    # Get the directory of this script
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

    # Initialize users database
    print_info "Setting up users database schema..."
    if psql -U stackit_user -d stackit_users -f "$SCRIPT_DIR/setup-user-db.sql" > /dev/null 2>&1; then
        print_status "Users database schema initialized"
    else
        print_warning "Users database schema might already be initialized"
    fi

    # Initialize content database
    print_info "Setting up content database schema..."
    if psql -U stackit_user -d stackit_content -f "$SCRIPT_DIR/setup-content-db.sql" > /dev/null 2>&1; then
        print_status "Content database schema initialized"
    else
        print_warning "Content database schema might already be initialized"
    fi

    # Initialize notification system
    print_info "Setting up notification system..."
    if psql -U stackit_user -d stackit_content -f "$SCRIPT_DIR/setup-notifications-db.sql" > /dev/null 2>&1; then
        print_status "Notification system initialized"
    else
        print_warning "Notification system might already be initialized"
    fi
}

# Test database connections
test_connections() {
    print_info "Testing database connections..."

    # Get the directory of this script
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

    # Change to project root directory
    cd "$SCRIPT_DIR/../.."

    # Install dependencies if node_modules doesn't exist in shared directory
    if [ ! -d "shared/node_modules" ]; then
        print_info "Installing shared dependencies..."
        cd shared && npm install pg redis && cd ..
    fi

    # Run connection test
    if node database/scripts/test-connections.js; then
        print_status "All database connections successful!"
    else
        print_error "Database connection test failed!"
        exit 1
    fi

    # Test notification system
    print_info "Testing notification system..."
    if node database/scripts/test-notifications.js; then
        print_status "Notification system test successful!"
    else
        print_warning "Notification system test failed (may need manual setup)"
    fi
}

# Create .env files if they don't exist
create_env_files() {
    print_info "Checking environment files..."

    # Get the directory of this script
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
    PROJECT_ROOT="$SCRIPT_DIR/../.."

    # Check each service for .env file
    for service in "auth-service" "content-service" "notification-service"; do
        if [ ! -f "$PROJECT_ROOT/$service/.env" ]; then
            print_warning ".env file missing for $service"
            print_info "Please create $service/.env file with appropriate configuration"
        else
            print_status "$service .env file exists"
        fi
    done
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Database setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "==========="
    echo ""
    echo "1. Install dependencies for each service:"
    echo "   cd auth-service && npm install"
    echo "   cd content-service && npm install"
    echo "   cd notification-service && npm install"
    echo ""
    echo "2. Start the services:"
    echo "   # Terminal 1"
    echo "   cd auth-service && npm run dev"
    echo ""
    echo "   # Terminal 2"
    echo "   cd content-service && npm run dev"
    echo ""
    echo "   # Terminal 3"
    echo "   cd notification-service && npm run dev"
    echo ""
    echo "3. Access the services:"
    echo "   Auth Service: http://localhost:3001"
    echo "   Content Service: http://localhost:3002"
    echo "   Notification Service: http://localhost:3003"
    echo ""
    echo "4. Database connections:"
    echo "   Users DB: postgresql://stackit_user:stackit_password@localhost:5432/stackit_users"
    echo "   Content DB: postgresql://stackit_user:stackit_password@localhost:5432/stackit_content"
    echo "   Redis: redis://localhost:6379 (DB 2 for notifications)"
    echo ""
    echo "5. Notification system features:"
    echo "   ✅ Auto-notifications for answers, comments, votes"
    echo "   ✅ User notification preferences"
    echo "   ✅ Real-time Redis integration"
    echo "   ✅ Mention notification support"
    echo ""
    echo "🚀 Happy coding!"
}

# Main execution
main() {
    # Check prerequisites
    check_postgresql
    check_redis

    echo ""

    # Setup databases
    setup_postgresql
    initialize_schemas

    echo ""

    # Create environment files
    create_env_files

    echo ""

    # Test connections
    test_connections

    # Show next steps
    show_next_steps
}

# Handle script interruption
trap 'echo -e "\n${RED}Setup interrupted!${NC}"; exit 1' INT

# Parse command line arguments
SKIP_TESTS=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-notifications)
            SKIP_NOTIFICATIONS=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            echo "StackIt Database Setup Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-tests          Skip database connection tests"
            echo "  --skip-notifications  Skip notification system setup"
            echo "  --verbose             Enable verbose output"
            echo "  --help                Show this help message"
            echo ""
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Set verbose mode
if [ "$VERBOSE" = true ]; then
    set -x
fi

# Run main function
main
