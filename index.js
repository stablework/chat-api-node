const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  },
});

require("./src/database/database")();
require("./src/helpers/passport")(app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("storage"));
app.use("/assets", express.static("src/assets"));

app.set("io", io);
require("./src/socket")(io);
require("./src/routes/api")(express, app);

app.get("/", (req, res) => {
  res.send("Chat API");
});

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Chat API listening on port ${port}`);
});
