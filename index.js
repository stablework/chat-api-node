const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { allowedOrigins, corsOptions } = require("./src/helpers/cors");
const mongoose = require("mongoose");

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
    origin: true,
    credentials: true,
    methods: corsOptions.methods,
  },
});

app.use(cors(corsOptions));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept,Origin,X-Requested-With");
  }
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  return next();
});

require("./src/database/database")();
require("./src/helpers/passport")(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("storage"));
app.use("/assets", express.static("src/assets"));

app.set("io", io);
require("./src/socket")(io);
require("./src/routes/api")(express, app);

app.get("/", (req, res) => {
  res.json(healthPayload());
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
