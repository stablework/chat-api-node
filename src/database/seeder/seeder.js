const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const database = require("../database")();

const userSeeder = require("./user");

(async () => {
  await database;
  await userSeeder();
  console.log("Admin user ready: Admin / 123456");
  process.exit(0);
})();
