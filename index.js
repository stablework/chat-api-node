const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { allowedOrigins, corsOptions } = require("./src/helpers/cors");
const mongoose = require("mongoose");
const User = require("./src/models/user");

const healthPayload = () => ({
  status: true,
  message: "Chat API",
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  jwt: Boolean(process.env.JWT_SECRET),
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: corsOptions.methods,
  },
});

app.use(cors(corsOptions));

require("./src/database/database")();
require("./src/helpers/passport")(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("storage"));
app.use("/assets", express.static("src/assets"));

app.set("io", io);
require("./src/socket")(io);
require("./src/routes/api")(express, app);

app.get("/", async (req, res) => {
  const payload = healthPayload();
  try {
    const admin = await User.findOne({ role: "admin" }).select("name email role status");
    payload.admin = admin
      ? { name: admin.name, email: admin.email, role: admin.role, status: admin.status }
      : null;
  } catch (error) {
    payload.admin = { error: error.message };
  }
  res.json(payload);
});

app.get("/health", (req, res) => {
  res.json(healthPayload());
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    status: false,
    message: err.message || "Internal server error",
  });
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, "127.0.0.1", () => {
  console.log(`Chat API listening on 127.0.0.1:${port}`);
  console.log(`CORS origins: ${allowedOrigins.join(", ")}`);
});
