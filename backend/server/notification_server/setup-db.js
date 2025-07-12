const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function setupDatabase() {
  console.log("🚀 Setting up notification database...");

  try {
    // First, drop the table if it exists to start fresh
    console.log("🧹 Cleaning existing tables...");
    await pool.query("DROP TABLE IF EXISTS notifications CASCADE");

    // Read the schema file
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Execute the schema
    await pool.query(schema);

    console.log("✅ Database schema created successfully");

    // Test the connection by counting existing notifications
    const result = await pool.query("SELECT COUNT(*) FROM notifications");
    console.log(
      `📊 Current notifications in database: ${result.rows[0].count}`,
    );
  } catch (error) {
    console.error("❌ Error setting up database:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function testConnection() {
  console.log("🔍 Testing database connection...");

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Database connection successful");
    console.log(`📅 Server time: ${result.rows[0].now}`);
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

async function main() {
  console.log("=====================================");
  console.log("🗄️  Notification Database Setup");
  console.log("=====================================");

  const connected = await testConnection();

  if (connected) {
    await setupDatabase();
    console.log("\n🎉 Database setup completed successfully!");
    console.log("You can now start the server with: npm run dev");
  } else {
    console.log("\n❌ Database setup failed");
    console.log(
      "Please check your DATABASE_URL and ensure PostgreSQL is running",
    );
    process.exit(1);
  }
}

main().catch(console.error);
