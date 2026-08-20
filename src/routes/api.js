const mongoose = require("mongoose");
const validation = require("../helpers/validation");
const authController = require("../controllers/authentication/authController");

const health = (req, res) => {
  res.json({
    status: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    jwt: Boolean(process.env.JWT_SECRET),
  });
};

const api = (express, app) => {
  const adminRoutes = require("./admin")(express.Router());
  const joinRoutes = require("./join")(express.Router());
  const channelRoutes = require("./channels")(express.Router());
  const chatRoutes = require("./chat")(express.Router());

  const mount = (prefix) => {
    app.get(`${prefix}/health`, health);
    app.use(`${prefix}/admin`, adminRoutes);
    app.use(`${prefix}/join`, joinRoutes);
    app.use(`${prefix}/channels`, channelRoutes);
    app.use(`${prefix}/chat`, chatRoutes);
  };

  mount("/api");
  mount("/app");

  app.get("/login", (req, res) => {
    res.json({ status: true, message: "login endpoint reachable" });
  });
  app.post("/login", validation("login"), authController.login);

  return app;
};

module.exports = api;
