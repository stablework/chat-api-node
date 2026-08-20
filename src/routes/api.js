const api = (express, app) => {
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
