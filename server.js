require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/survey", require("./routes/surveyRoutes"));

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
