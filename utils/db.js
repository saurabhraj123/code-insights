const mongoose = require("mongoose");

let connection;

async function connect() {
  if (connection) return;

  const db = await mongoose.connect(process.env.MONGODB_URL);
  connection = db.connection;
}

async function disconnect() {
  if (connection) {
    if (process.env.NODE_ENV == "production") {
      await mongoose.disconnect();
      connection = null;
    } else {
      console.log("not disconnected");
    }
  }
}

const db = { connect, disconnect };
module.exports = db;
