#!/bin/bash

# StackIt Docker Management Script
# Simplified Docker operations for StackIt backend services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Docker Compose files
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
COMPOSE_DEV_FILE="$PROJECT_ROOT/docker-compose.dev.yml"
COMPOSE_PROD_FILE="$PROJECT_ROOT/docker-compose.prod.yml"

# Default environment
ENVIRONMENT="dev"

# Function to print colored output
print_header() {
    echo -e "\n${CYAN}🐳 StackIt Docker Manager${NC}"
    echo -e "${CYAN}=========================${NC}\n"
}

print_success() {
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

print_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# Help function
show_help() {
    print_header
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  up [env]          Start all services (dev|prod)"
    echo "  down [env]        Stop all services"
    echo "  restart [env]     Restart all services"
    echo "  build [env]       Build all services"
    echo "  logs [service]    Show logs for service or all services"
    echo "  status            Show status of all containers"
    echo "  clean             Remove all containers, volumes, and images"
    echo "  reset             Clean and rebuild everything"
    echo "  shell <service>   Open shell in running container"
    echo "  db-shell          Open PostgreSQL shell"
    echo "  redis-cli         Open Redis CLI"
    echo "  setup             Initial setup and database initialization"
    echo "  backup            Backup databases"
    echo "  restore [file]    Restore from backup"
    echo "  test              Run database connection tests"
    echo "  monitor           Show real-time container stats"
    echo ""
    echo "Development Commands:"
    echo "  dev               Start development environment with extras"
    echo "  dev-down          Stop development environment"
    echo "  dev-logs          Show development logs"
    echo "  seed              Seed database with sample data"
    echo ""
    echo "Production Commands:"
    echo "  prod              Start production environment"
    echo "  prod-down         Stop production environment"
    echo "  prod-deploy       Deploy to production"
    echo "  health            Check production health"
    echo ""
    echo "Maintenance Commands:"
    echo "  update            Pull latest images and restart"
    echo "  prune             Clean up unused Docker resources"
    echo "  volumes           List all project volumes"
    echo ""
    echo "Options:"
    echo "  --env=<env>       Specify environment (dev|prod)"
    echo "  --no-cache        Build without cache"
    echo "  --force           Force operation without prompts"
    echo "  --verbose         Verbose output"
    echo "  --help            Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 up dev                 # Start development environment"
    echo "  $0 logs postgres          # Show PostgreSQL logs"
    echo "  $0 shell postgres         # Open shell in PostgreSQL container"
    echo "  $0 db-shell               # Open psql shell"
    echo "  $0 clean --force          # Force clean all Docker resources"
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        echo "Please install Docker first: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running!"
        echo "Please start Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available!"
        echo "Please install Docker Compose."
        exit 1
    fi
}

# Get Docker Compose command
get_compose_cmd() {
    if docker compose version &> /dev/null; then
        echo "docker compose"
    else
        echo "docker-compose"
    fi
}

# Get compose files for environment
get_compose_files() {
    local env=$1
    case $env in
        "prod"|"production")
            echo "-f $COMPOSE_FILE -f $COMPOSE_PROD_FILE"
            ;;
        "dev"|"development"|*)
            echo "-f $COMPOSE_FILE -f $COMPOSE_DEV_FILE"
            ;;
    esac
}

# Start services
start_services() {
    local env=${1:-dev}
    local compose_cmd=$(get_compose_cmd)
    local compose_files=$(get_compose_files $env)

    print_step "Starting StackIt services in $env environment..."

    if [ "$env" = "dev" ]; then
        print_info "Starting development environment with PgAdmin and Redis Commander"
        $compose_cmd $compose_files --profile dev up -d
    else
        print_info "Starting production environment"
        $compose_cmd $compose_files up -d
    fi

    print_step "Waiting for services to be ready..."
    sleep 5

    # Check if main services are healthy
    local postgres_status=$($compose_cmd $compose_files ps postgres | grep -c "Up" || echo "0")
    local redis_status=$($compose_cmd $compose_files ps redis | grep -c "Up" || echo "0")

    if [ "$postgres_status" -gt 0 ] && [ "$redis_status" -gt 0 ]; then
        print_success "All services started successfully!"

        if [ "$env" = "dev" ]; then
            echo ""
            print_info "Development services available:"
            echo "  📊 PostgreSQL: localhost:5432"
            echo "  🔥 Redis: localhost:6379"
            echo "  🎛️  PgAdmin: http://localhost:5050 (admin@example.com / admin123)"
            echo "  🎛️  Redis Commander: http://localhost:8081 (admin / admin123)"
        else
            echo ""
            print_info "Production services available:"
            echo "  📊 PostgreSQL: localhost:5432"
            echo "  🔥 Redis: localhost:6379"
        fi
    else
        print_error "Some services failed to start properly!"
        show_status
        exit 1
    fi
}

# Stop services
stop_services() {
    local env=${1:-dev}
    local compose_cmd=$(get_compose_cmd)
    local compose_files=$(get_compose_files $env)

    print_step "Stopping StackIt services..."
    $compose_cmd $compose_files down
    print_success "All services stopped!"
}

# Restart services
restart_services() {
    local env=${1:-dev}
    print_step "Restarting StackIt services..."
    stop_services $env
    sleep 2
    start_services $env
}

# Build services
build_services() {
    local env=${1:-dev}
    local compose_cmd=$(get_compose_cmd)
    local compose_files=$(get_compose_files $env)
    local no_cache=${2:-false}

    print_step "Building StackIt services..."

    if [ "$no_cache" = "true" ]; then
        $compose_cmd $compose_files build --no-cache
    else
        $compose_cmd $compose_files build
    fi

    print_success "Services built successfully!"
}

# Show logs
show_logs() {
    local service=$1
    local compose_cmd=$(get_compose_cmd)
    local compose_files=$(get_compose_files $ENVIRONMENT)

    if [ -n "$service" ]; then
        print_info "Showing logs for $service..."
        $compose_cmd $compose_files logs -f $service
    else
        print_info "Showing logs for all services..."
        $compose_cmd $compose_files logs -f
    fi
}

# Show status
show_status() {
    local compose_cmd=$(get_compose_cmd)
    local compose_files=$(get_compose_files $ENVIRONMENT)

    print_info "Container status:"
    $compose_cmd $compose_files ps

    echo ""
    print_info "Resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.PIDs}}" $(docker ps --format "{{.Names}}" | grep stackit) 2>/dev/null || echo "No StackIt containers running"
}

# Clean up
clean_all() {
    local force=${1:-false}
    local compose_cmd=$(get_compose_cmd)

    if [ "$force" != "true" ]; then
        echo -e "${YELLOW}⚠️  This will remove ALL StackIt containers, volumes, and networks!${NC}"
        echo -e "${YELLOW}⚠️  This action cannot be undone!${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Operation cancelled."
            exit 0
        fi
    fi

    print_step "Stopping all services..."
    $compose_cmd -f $COMPOSE_FILE -f $COMPOSE_DEV_FILE down 2>/dev/null || true
    $compose_cmd -f $COMPOSE_FILE -f $COMPOSE_PROD_FILE down 2>/dev/null || true

    print_step "Removing containers..."
    docker ps -a --filter "name=stackit" --format "{{.ID}}" | xargs -r docker rm -f

    print_step "Removing volumes..."
    docker volume ls --filter "name=stackit" --format "{{.Name}}" | xargs -r docker volume rm

    print_step "Removing networks..."
    docker network ls --filter "name=stackit" --format "{{.Name}}" | xargs -r docker network rm 2>/dev/null || true

    print_step "Removing images..."
    docker images --filter "reference=stackit*" --format "{{.ID}}" | xargs -r docker rmi -f

    print_success "Cleanup completed!"
}

# Reset everything
reset_all() {
    print_step "Resetting StackIt Docker environment..."
    clean_all true
    sleep 2
    build_services $ENVIRONMENT
    start_services $ENVIRONMENT
    print_success "Reset completed!"
}

# Open shell in container
open_shell() {
    local service=$1

    if [ -z "$service" ]; then
        print_error "Please specify a service name"
        exit 1
    fi

    local container_id=$(docker ps --filter "name=stackit_$service" --format "{{.ID}}" | head -1)

    if [ -z "$container_id" ]; then
        print_error "Container stackit_$service is not running"
        exit 1
    fi

    print_info "Opening shell in $service container..."
    docker exec -it $container_id /bin/sh
}

# Open database shell
open_db_shell() {
    local container_id=$(docker ps --filter "name=stackit_postgres" --format "{{.ID}}" | head -1)

    if [ -z "$container_id" ]; then
        print_error "PostgreSQL container is not running"
        exit 1
    fi

    print_info "Opening PostgreSQL shell..."
    docker exec -it $container_id psql -U stackit_user -d stackit_content
}

# Open Redis CLI
open_redis_cli() {
    local container_id=$(docker ps --filter "name=stackit_redis" --format "{{.ID}}" | head -1)

    if [ -z "$container_id" ]; then
        print_error "Redis container is not running"
        exit 1
    fi

    print_info "Opening Redis CLI..."
    docker exec -it $container_id redis-cli
}

# Setup project
setup_project() {
    print_step "Setting up StackIt Docker environment..."

    # Create necessary directories
    mkdir -p "$PROJECT_ROOT/docker/volumes/postgres_dev"
    mkdir -p "$PROJECT_ROOT/docker/volumes/redis_dev"
    mkdir -p "$PROJECT_ROOT/secrets"

    # Create environment file if it doesn't exist
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        print_step "Creating .env file from template..."
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
        print_info "Please edit .env file with your configuration"
    fi

    # Create production secrets if they don't exist
    if [ ! -f "$PROJECT_ROOT/secrets/postgres_admin_password.txt" ]; then
        echo "$(openssl rand -base64 32)" > "$PROJECT_ROOT/secrets/postgres_admin_password.txt"
        print_info "Generated PostgreSQL admin password"
    fi

    if [ ! -f "$PROJECT_ROOT/secrets/redis_password.txt" ]; then
        echo "$(openssl rand -base64 32)" > "$PROJECT_ROOT/secrets/redis_password.txt"
        print_info "Generated Redis password"
    fi

    # Make scripts executable
    chmod +x "$PROJECT_ROOT/docker/postgres/init/01-init-databases.sh"
    chmod +x "$PROJECT_ROOT/docker/postgres/setup/run-setup.sh"

    print_success "Setup completed!"
    print_info "You can now run: $0 up dev"
}

# Run tests
run_tests() {
    local compose_cmd=$(get_compose_cmd)
    local compose_files=$(get_compose_files $ENVIRONMENT)

    print_step "Running database connection tests..."

    # Check if services are running
    local postgres_running=$($compose_cmd $compose_files ps postgres | grep -c "Up" || echo "0")

    if [ "$postgres_running" -eq 0 ]; then
        print_error "PostgreSQL is not running. Start services first with: $0 up"
        exit 1
    fi

    # Run tests inside the setup container
    docker run --rm \
        --network stackit_network \
        -v "$PROJECT_ROOT/database/scripts:/scripts" \
        -e PGHOST=postgres \
        -e PGPORT=5432 \
        -e PGUSER=stackit_user \
        -e PGPASSWORD=stackit_password \
        -e REDIS_HOST=redis \
        -e REDIS_PORT=6379 \
        postgres:15-alpine \
        sh -c "
            apk add --no-cache nodejs npm > /dev/null 2>&1
            npm install pg redis > /dev/null 2>&1
            node /scripts/test-connections.js
        "
}

# Monitor containers
monitor_containers() {
    print_info "Monitoring StackIt containers (Press Ctrl+C to exit)..."
    docker stats $(docker ps --filter "name=stackit" --format "{{.Names}}" | tr '\n' ' ')
}

# Backup databases
backup_databases() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$PROJECT_ROOT/docker/volumes/backups/$timestamp"

    mkdir -p "$backup_dir"

    print_step "Creating database backup..."

    # Backup PostgreSQL
    docker exec stackit_postgres pg_dump -U stackit_user stackit_users > "$backup_dir/stackit_users.sql"
    docker exec stackit_postgres pg_dump -U stackit_user stackit_content > "$backup_dir/stackit_content.sql"

    # Backup Redis
    docker exec stackit_redis redis-cli SAVE
    docker cp stackit_redis:/data/dump.rdb "$backup_dir/redis_dump.rdb"

    print_success "Backup created at: $backup_dir"
}

# Update services
update_services() {
    local compose_cmd=$(get_compose_cmd)
    local compose_files=$(get_compose_files $ENVIRONMENT)

    print_step "Updating StackIt services..."

    # Pull latest images
    $compose_cmd $compose_files pull

    # Restart services
    $compose_cmd $compose_files up -d

    print_success "Services updated!"
}

# Parse command line arguments
FORCE=false
NO_CACHE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --env=*)
            ENVIRONMENT="${1#*=}"
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            set -x
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            break
            ;;
    esac
done

# Main command handling
COMMAND=${1:-help}

# Check Docker before running commands (except help)
if [ "$COMMAND" != "help" ]; then
    check_docker
fi

case $COMMAND in
    "up")
        ENV=${2:-$ENVIRONMENT}
        start_services $ENV
        ;;
    "down")
        ENV=${2:-$ENVIRONMENT}
        stop_services $ENV
        ;;
    "restart")
        ENV=${2:-$ENVIRONMENT}
        restart_services $ENV
        ;;
    "build")
        ENV=${2:-$ENVIRONMENT}
        build_services $ENV $NO_CACHE
        ;;
    "logs")
        show_logs $2
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_all $FORCE
        ;;
    "reset")
        reset_all
        ;;
    "shell")
        open_shell $2
        ;;
    "db-shell")
        open_db_shell
        ;;
    "redis-cli")
        open_redis_cli
        ;;
    "setup")
        setup_project
        ;;
    "test")
        run_tests
        ;;
    "monitor")
        monitor_containers
        ;;
    "backup")
        backup_databases
        ;;
    "update")
        update_services
        ;;
    "dev")
        start_services "dev"
        ;;
    "dev-down")
        stop_services "dev"
        ;;
    "dev-logs")
        ENVIRONMENT="dev"
        show_logs
        ;;
    "prod")
        start_services "prod"
        ;;
    "prod-down")
        stop_services "prod"
        ;;
    "health")
        # Simple health check
        print_info "Checking service health..."
        show_status
        ;;
    "prune")
        print_step "Cleaning up unused Docker resources..."
        docker system prune -f
        print_success "Docker cleanup completed!"
        ;;
    "volumes")
        print_info "StackIt Docker volumes:"
        docker volume ls --filter "name=stackit"
        ;;
    "help"|*)
        show_help
        ;;
esac
