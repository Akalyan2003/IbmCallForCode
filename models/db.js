const { Pool } = require("pg");

// PostgreSQL connection details
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "WaterQualityFactor",
  password: "12345",
  port: 5432,
});

// Function to execute a query
async function executeQuery(query, params = []) {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

module.exports = { executeQuery };
