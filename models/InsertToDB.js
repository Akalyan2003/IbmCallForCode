const express = require("express");
const { Pool } = require("pg");

// Initialize the app
const app = express();
const port = 5000;

// Middleware to parse JSON
app.use(express.json());

// PostgreSQL connection details
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "WaterQualityFactor",
  password: "12345", // Replace with your actual password
  port: 5432,
});

// Endpoint to receive sensor data
app.post("/water", async (req, res) => {
  try {
    // Destructure the parameters from the JSON body
    const { temperature, tds, ph, turbidity, area, district, state, country } =
      req.body;

    // Validate required fields
    if (!temperature || !tds || !area || !district || !state || !country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO waterquality (temperature, tds, ph, turbidity, area, district, state, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

    const result = await pool.query(query, [
      temperature || null,
      tds,
      ph || null,
      turbidity || null,
      area,
      district,
      state,
      country,
    ]);

    res.status(200).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Error saving data to the database" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
