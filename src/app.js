require("dotenv").config(); // <-- load .env first

const express = require("express");
const cors = require("cors");
const webRoutes = require("./routes/web.routes");
const { runActivityScheduler } = require("./services/scheduler.service");

const app = express();

// Enable CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// JSON parsing
app.use(express.json());

// EJS setup
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Tailwind static folder (optional if using CDN)
app.use(express.static(__dirname + "/public"));

// Run scheduler
runActivityScheduler();

// Routes
app.use("/", webRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
