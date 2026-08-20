const mongoose = require("mongoose");

const api = (express, app) => {
  app.get("/api/health", (req, res) => {
    res.json({
      status: true,
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      jwt: Boolean(process.env.JWT_SECRET),
    });
  });

  const adminRoutes = require("./admin")(express.Router());
  app.use("/api/admin", adminRoutes);

  const joinRoutes = require("./join")(express.Router());
  app.use("/api/join", joinRoutes);

  const channelRoutes = require("./channels")(express.Router());
  app.use("/api/channels", channelRoutes);

  const chatRoutes = require("./chat")(express.Router());
  app.use("/api/chat", chatRoutes);

  return app;
};

module.exports = api;
