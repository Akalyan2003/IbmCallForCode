const { getWaterQuality } = require("../models/db");

// Function to identify diseases based on water quality
async function DiseasesInWater(water) {
  let diseaseList = [];

  if (water.ph < 6.5 || water.ph > 8.5) {
    diseaseList.push("Cholera", "Dysentery", "Gastroenteritis");
  }
  if (water.tds > 1000) {
    diseaseList.push("Kidney Damage");
  }
  if (water.turbidity > 5) {
    diseaseList.push("Typhoid");
  }
  return diseaseList.length > 0 ? diseaseList : ["No significant disease risk"];
}

// Function to get diseases based on a location's water quality
async function getDiseasesByLocation(location) {
  try {
    const water = await getWaterQuality(location);
    if (!water) {
      return `No water quality data found for location: ${location}.`;
    }
    const diseases = await DiseasesInWater(water);
    return diseases;
  } catch (error) {
    console.error("Error fetching diseases:", error);
    throw error;
  }
}

module.exports = {
  getDiseasesByLocation,
  DiseasesInWater,
};
