const { executeQuery } = require("../models/db");

// Function to get water quality data for a specific location
async function getWaterQuality(location) {
  const query = `
    SELECT ph, turbidity, tds, temperature
    FROM waterquality
    WHERE UPPER(area) = UPPER($1) OR UPPER(district) = UPPER($1) OR UPPER(state) = UPPER($1);
  `;
  const values = [location];
  try {
    const result = await executeQuery(query, values);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching water quality data:", error);
    throw error;
  }
}

async function calculateSum(param, location) {
  const query = `
    SELECT SUM(${param}) AS total
    FROM waterquality
    WHERE UPPER(area) = $1 OR UPPER(district) = $1 OR UPPER(state) = $1
  `;
  const result = await executeQuery(query, [location.toUpperCase()]);
  return result.length > 0 ? result[0].total : null;
}

async function calculateAverage(param, location) {
  const query = `
    SELECT AVG(${param}) AS average
    FROM waterquality
    WHERE UPPER(area) = $1 OR UPPER(district) = $1 OR UPPER(state) = $1
  `;
  const result = await executeQuery(query, [location.toUpperCase()]);
  return result.length > 0 ? result[0].average : null;
}

async function calculateMin(param, location) {
  const query = `
    SELECT MIN(${param}) AS minimum
    FROM waterquality
    WHERE UPPER(area) = $1 OR UPPER(district) = $1 OR UPPER(state) = $1
  `;
  const result = await executeQuery(query, [location.toUpperCase()]);
  return result.length > 0 ? result[0].minimum : null;
}

async function calculateMax(param, location) {
  const query = `
    SELECT MAX(${param}) AS maximum
    FROM waterquality
    WHERE UPPER(area) = $1 OR UPPER(district) = $1 OR UPPER(state) = $1
  `;
  const result = await executeQuery(query, [location.toUpperCase()]);
  return result.length > 0 ? result[0].maximum : null;
}

async function WPI(count, order, operation) {
  //console.log(order);
  const sortOrder =
    operation === "least" || operation === "worst" || operation === null
      ? "asc"
      : "desc";

  const sqlQuery = `
    WITH WaterPurity AS (
        SELECT 
            id,
            area,
            district,
            state,
            country,
            CASE WHEN ph BETWEEN 6.5 AND 8.5 THEN 5 ELSE 1 END AS pH_Score,
            CASE WHEN turbidity BETWEEN 0 AND 5 THEN 5 WHEN turbidity BETWEEN 5 AND 10 THEN 3 ELSE 1 END AS Turbidity_Score,
            CASE WHEN temperature BETWEEN 0 AND 25 THEN 5 WHEN temperature > 25 THEN 3 ELSE 1 END AS Temperature_Score,
            CASE WHEN tds BETWEEN 0 AND 300 THEN 5 WHEN tds BETWEEN 300 AND 600 THEN 3 ELSE 1 END AS TDS_Score,
            (0.4 * CASE WHEN ph BETWEEN 6.5 AND 8.5 THEN 5 ELSE 1 END) + 
            (0.3 * CASE WHEN turbidity BETWEEN 0 AND 5 THEN 5 ELSE 1 END) +
            (0.2 * CASE WHEN temperature BETWEEN 0 AND 25 THEN 5 ELSE 1 END) +
            (0.1 * CASE WHEN tds BETWEEN 0 AND 300 THEN 5 ELSE 1 END) AS WPI
        FROM waterquality
    )
    SELECT area, district, state, country, MAX(WPI) AS Best_WPI 
    FROM WaterPurity
    GROUP BY area, district, state, country
    ORDER BY Best_WPI ${sortOrder}
    LIMIT $1;
  `;

  return await executeQuery(sqlQuery, [count]); // Pass the count as the parameter
}

module.exports = {
  getWaterQuality,
  calculateSum,
  calculateAverage,
  calculateMin,
  calculateMax,
  WPI,
};
