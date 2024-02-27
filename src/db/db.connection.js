const mongoose = require("mongoose");
const { DB_NAME } = require("../constants");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(`${process.env.DB_URL}`);
    console.log("Database Connected Sucessfully 👌👌");
  } catch (error) {
    console.log("Mongo Database Connection Error 💀💀 ", error);
  }
};

module.exports = connectDB;
