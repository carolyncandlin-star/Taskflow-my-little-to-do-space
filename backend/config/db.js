const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing. Copy .env.example to .env and set it.");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  } catch (err) {
    throw new Error(`Cannot reach MongoDB (${err.message}). Is MongoDB running, or is your Atlas URI/IP access correct?`);
  }
  console.log("MongoDB connected");
}

module.exports = connectDB;
