const { executeQuery } = require("../models/db");
const { getWaterQuality } = require("./waterQualityController");

// Function to check fish survival based on water quality
async function checkFishSurvival(fishName, waterQuality) {
  const fishQuery = `SELECT water_type FROM fishes WHERE upper(fish_name) = upper($1)`;
  // console.log(fishName);
  const fishResult = await executeQuery(fishQuery, [fishName]);
  //console.log(fishResult);
  //console.log("here");
  if (fishResult.length === 0) {
    return "the data about the fish " + fishName + " is Wrong";
  }
  const waterType = fishResult[0].water_type;
  //console.log("inga");
  //console.log(waterType);
  if (waterType === "freshwater") {
    if (
      waterQuality.ph >= 6.5 &&
      waterQuality.ph <= 8.0 &&
      waterQuality.temperature >= 18 &&
      waterQuality.temperature <= 30 &&
      waterQuality.turbidity >= 1 &&
      waterQuality.tds <= 500
    ) {
      return "ok";
    }
    return "no";
  } else if (waterType === "saltwater") {
    if (
      waterQuality.ph >= 7.8 &&
      waterQuality.ph <= 8.5 &&
      waterQuality.temperature >= 24 &&
      waterQuality.tds >= 30000
    ) {
      return "ok";
    }
  }
  return "no";
}

async function recommendPlacesForFish(location) {
  const waterQuality = await getWaterQuality(location);

  if (!waterQuality) {
    return `No water quality data found for location: ${location}.`;
  }

  const { ph, temperature, turbidity, tds } = waterQuality;
  const fishRecommendations = [];

  // SQL Query to fetch suitable fish
  const fishQuery = `
    SELECT fish_name, scientific_name, common_habitat, water_type
    FROM fishes
    WHERE (water_type = 'freshwater' AND $1 BETWEEN 6.5 AND 8.0
           AND $2 BETWEEN 18 AND 30
           AND $3 BETWEEN 1 AND 10
           AND $4 BETWEEN 0 AND 500)
       OR (water_type = 'saltwater' AND $1 BETWEEN 7.8 AND 8.5
           AND $2 BETWEEN 24 AND 28
           AND $3 BETWEEN 1 AND 5
           AND $4 BETWEEN 30000 AND 40000)
  `;

  const suitableFish = await executeQuery(fishQuery, [
    parseFloat(ph),
    parseInt(temperature, 10),
    parseInt(turbidity, 10),
    parseInt(tds, 10),
  ]);

  if (suitableFish.length > 0) {
    suitableFish.forEach((fish) => {
      fishRecommendations.push({
        type: capitalizeFirstLetter(fish.water_type),
        name: fish.fish_name,
        scientific_name: fish.scientific_name,
        habitat: fish.common_habitat,
      });
    });
  }

  if (fishRecommendations.length === 0) {
    return `No suitable fish found for location: ${location} based on water quality.`;
  }

  // Formatting the output properly
  const formattedFishRecommendations = fishRecommendations
    .map((fish) => `Type: ${fish.type}, Name: ${fish.name}`)
    .join(", ");

  return formattedFishRecommendations;
}

// Helper function to capitalize the first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function findSuitableLocationsForFish(fishName) {
  const fishQuery = `
    SELECT water_type
    FROM fishes
    WHERE upper(fish_name) = upper($1)
  `;
  const fishResult = await executeQuery(fishQuery, [fishName]);

  if (fishResult.length === 0) {
    return null; // Fish not found
  }

  const waterType = fishResult[0].water_type;

  // Query to find locations with suitable water quality for the fish
  const locationQuery =
    waterType === "freshwater"
      ? `
    SELECT area, district, state, country
    FROM waterquality
    WHERE ph BETWEEN 6.5 AND 8.0
      AND temperature BETWEEN 18 AND 30
      AND turbidity BETWEEN 1 AND 10
      AND tds BETWEEN 0 AND 500
  `
      : `
    SELECT area, district, state, country
    FROM waterquality
    WHERE ph BETWEEN 7.8 AND 8.5
      AND temperature BETWEEN 24 AND 28
      AND turbidity BETWEEN 1 AND 5
      AND tds BETWEEN 30000 AND 40000
  `;

  const suitableLocations = await executeQuery(locationQuery);

  return suitableLocations.length > 0 ? suitableLocations : null;
}

async function recommendFishBasedOnQuality(location) {
  const waterQuality = await getWaterQuality(location);

  if (!waterQuality) {
    return `No water quality data found for location: ${location}.`;
  }

  const { ph, temperature, turbidity, tds } = waterQuality;
  const fishRecommendations = [];

  const fishQuery = `
    SELECT fish_name, scientific_name, common_habitat, water_type
    FROM fishes
    WHERE (water_type = 'freshwater' AND $1 BETWEEN 6.5 AND 8.0
           AND $2 BETWEEN 18 AND 30
           AND $3 BETWEEN 1 AND 10
           AND $4 BETWEEN 0 AND 500)
       OR (water_type = 'saltwater' AND $1 BETWEEN 7.8 AND 8.5
           AND $2 BETWEEN 24 AND 28
           AND $3 BETWEEN 1 AND 5
           AND $4 BETWEEN 30000 AND 40000)
  `;

  const suitableFish = await executeQuery(fishQuery, [
    parseFloat(ph),
    parseInt(temperature, 10),
    parseInt(turbidity, 10),
    parseInt(tds, 10),
  ]);

  if (suitableFish.length > 0) {
    suitableFish.forEach((fish) => {
      fishRecommendations.push({
        type:
          fish.water_type.charAt(0).toUpperCase() + fish.water_type.slice(1),
        name: fish.fish_name,
        scientific_name: fish.scientific_name,
        common_habitat: fish.common_habitat,
      });
    });
  }

  const formattedFishRecommendations = fishRecommendations
    .map((fish) => `Type: ${fish.type}, Name: ${fish.name}`)
    .join("; ");
  if (fishRecommendations.length === 0) {
    return `No suitable fish found for location: ${location} based on water quality.`;
  }

  return formattedFishRecommendations;
}
module.exports = {
  checkFishSurvival,
  recommendPlacesForFish,
  recommendFishBasedOnQuality,
};
