const { executeQuery } = require("../models/db");
const { getWaterQuality } = require("./waterQualityController");

// Function to get crop requirements
async function getCropRequirements(plant) {
  const query = `SELECT ph_min, ph_max, tds_min, tds_max, turbidity, temp_min, temp_max FROM crops WHERE upper(crop_name) = upper($1)`;
  return await executeQuery(query, [plant]);
}

// Function to check if crop can survive in a location
async function checkCropSurvival(location, plant) {
  try {
    //console.log(plant);
    const waterQuality = await getWaterQuality(location);
    const cropRequirements = await getCropRequirements(plant);
    if (!cropRequirements || cropRequirements.length === 0) {
      return {
        valid: false,
        reason: "No crop data found for the specified plant.",
      };
    }

    const { ph_min, ph_max, tds_min, tds_max, turbidity, temp_min, temp_max } =
      cropRequirements[0];
    const { ph, turbidity: waterTurbidity, tds, temperature } = waterQuality;

    if (ph < ph_min || ph > ph_max) {
      return { valid: false, reason: `pH out of range for ${plant}.` };
    }
    if (waterTurbidity !== turbidity) {
      return { valid: false, reason: `Turbidity mismatch for ${plant}.` };
    }
    if (tds < tds_min || tds > tds_max) {
      return { valid: false, reason: `TDS out of range for ${plant}.` };
    }
    if (temperature < temp_min || temperature > temp_max) {
      return { valid: false, reason: `Temperature out of range for ${plant}.` };
    }

    return { valid: true, reason: `${plant} can survive in this location.` };
  } catch (error) {
    console.error("Error checking crop survival:", error);
    return { valid: false, reason: "Error in checking crop survival." };
  }
}

module.exports = { checkCropSurvival };
