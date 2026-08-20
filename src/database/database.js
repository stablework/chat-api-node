const mongoose = require("mongoose");

const database = async () => {
  if (!process.env.DATABASE) {
    console.error("DATABASE is not set");
    return;
  }

  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("Connected!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = database;
