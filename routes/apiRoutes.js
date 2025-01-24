const express = require("express");
const {
  calculateSum,
  calculateAverage,
  calculateMin,
  calculateMax,
  getWaterQuality,
} = require("../controllers/waterQualityController");
const {
  checkFishSurvival,
  recommendPlacesForFish,
  recommendFishBasedOnQuality,
} = require("../controllers/fishController");
const { checkCropSurvival } = require("../controllers/cropController");
const { WPI } = require("../controllers/waterQualityController");
const { DiseasesInWater } = require("../controllers/diseaseController");

const router = express.Router();

router.post("/query", async (req, res) => {
  const {
    operation,
    parameter,
    location,
    fishName,
    count,
    order,
    plants,
    crop,
  } = req.body;

  try {
    let result;

    switch (operation) {
      case "sum":
        result = await calculateSum(parameter, location);
        if (result === null) {
          return res.status(404).json({
            error: `No data found for the given location: ${location}.`,
          });
        }
        res.json({
          result: `The ${operation} of the ${parameter} in ${location} is ${result}`,
        });
        break;

      case "average":
        result = await calculateAverage(parameter, location);
        if (result === null) {
          return res.status(404).json({
            error: `No data found for the given location: ${location}.`,
          });
        }
        res.json({
          result: `The ${operation} of the ${parameter} in ${location} is ${result}`,
        });
        break;

      case "minimum":
        result = await calculateMin(parameter, location);
        if (result === null) {
          return res.status(404).json({
            error: `No data found for the given location: ${location}.`,
          });
        }
        res.json({
          result: `The ${operation} of the ${parameter} in ${location} is ${result}`,
        });
        break;

      case "maximum":
        result = await calculateMax(parameter, location);
        if (result === null) {
          return res.status(404).json({
            error: `No data found for the given location: ${location}.`,
          });
        }
        res.json({
          result: `The ${operation} of the ${parameter} in ${location} is ${result}`,
        });
        break;

      case "fishplace":
        result = await recommendPlacesForFish(location);
        if (!result || result.length === 0) {
          return res.status(404).json({
            error: `No suitable places found for fish based on water quality in location: ${location}.`,
          });
        }
        res.json({
          result: `The ${operation} of the ${location} is ${result}`,
        });
        break;

      case "recommend fish":
        result = await recommendFishBasedOnQuality(location);
        if (result === null || result.length === 0) {
          return res.status(404).json({
            error: `No suitable fish found for location: ${location}.`,
          });
        }
        res.json({
          result: `The recommended fish for the in ${location} is ${result}`,
        });
        break;

      case "survive":
      case "live":
        if (fishName === null || location === null) {
          return res.json({
            result: "data is not enough",
          });
        }
        const waterQuality = await getWaterQuality(location);
        //console.log(waterQuality);
        result = await checkFishSurvival(fishName, waterQuality);
        if (result === "ok") {
          res.json({
            result: `the Fish can survive in ${location}`,
          });
        } else if (result === "no") {
          res.json({
            result: `the Fish cannot survive in ${location}`,
          });
        } else {
          res.json({
            result: { result },
          });
        }

        break;

      case "top":
      case "best":
      case "least":
      case "worst":
        let a = parseInt(count);
        //console.log(a);

        const details = await WPI(a, order, operation);
        res.json({
          result: { details },
        });
        break;

      case "diseases":
      case "disease":
        const water = await getWaterQuality(location);
        const compare = await DiseasesInWater(water);
        return res.json({
          result: `${compare} are the diseases in ${location}`,
        });
      case "crops":
      case "crop":
        // console.log(plants);
        const check = await checkCropSurvival(location, plants);
        return res.json({
          result: check,
        });

      default:
        return res
          .status(400)
          .json({ error: `Operation ${operation} not supported.` });
    }
  } catch (error) {
    console.error("Error handling query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
