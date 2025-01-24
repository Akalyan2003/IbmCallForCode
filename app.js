const express = require("express");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/apiRoutes");

const app = express();
app.use(bodyParser.json());

// Use API routes
app.use("/api", apiRoutes);

// Start the server
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
