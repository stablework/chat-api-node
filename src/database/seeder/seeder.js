require("dotenv").config();
const database = require("../database")();

const userSeeder = require("./user");

(async () => {
  await database;
  await userSeeder();
  process.exit();
})();
