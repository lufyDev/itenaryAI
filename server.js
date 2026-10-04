require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

// CORS: explicit allowlist instead of the old wide-open cors().
// ALLOWED_ORIGINS is a comma-separated list, e.g.
//   https://itineraryai.in,https://www.itineraryai.in
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = same-origin, curl, or a server-side call. Allow.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Deny by omitting the CORS header rather than throwing — throwing
      // turns every probe into a 500 with a stack trace in the logs. The
      // browser blocks the response either way.
      return callback(null, false);
    },
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Liveness probe. Deliberately does not touch Mongo so a DB blip
// doesn't make the platform recycle a healthy container.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/survey", require("./routes/surveyRoutes"));

// Cloud Run / Fly inject PORT. 8080 stays the local default.
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS allowlist: ${allowedOrigins.join(", ")}`);
});

// The /generate-stream route holds an SSE connection open for up to 180s.
// Node's defaults would cut that off, so widen them past the agent budget.
server.keepAliveTimeout = 310_000;
server.headersTimeout = 320_000;
server.requestTimeout = 320_000;
