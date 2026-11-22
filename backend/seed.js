// Optional: fills the database with sample tasks so you can take screenshots.
// Usage: npm run seed        (add samples)
//        npm run seed -- --clear   (delete ALL tasks)
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Task = require("./models/Task");

const day = (n) => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() + n); return d; };
const samples = [
  { title: "Submit Avenir To-Do project", description: "Push code, screenshots and README to GitHub.", category: "Internship", priority: "High", dueDate: day(0), isImportant: true },
  { title: "Revise Machine Learning notes", description: "Unit 3 and Unit 4.", category: "Study", priority: "Medium", dueDate: day(2) },
  { title: "Buy sketchbook and pencils", category: "Shopping", priority: "Low", dueDate: day(4) },
  { title: "Reply to startup partner", description: "Discuss the athlete platform roadmap.", category: "Work", priority: "High", dueDate: day(-1), isImportant: true },
  { title: "Upload new Redbubble design", category: "Personal", priority: "Medium", dueDate: day(6) },
  { title: "Finish portfolio website", category: "Internship", priority: "Medium", completed: true, dueDate: day(-3) },
  { title: "Plan weekly study schedule", category: "Study", priority: "Low", completed: true }
];

(async () => {
  try {
    await connectDB();
    if (process.argv.includes("--clear")) { await Task.deleteMany({}); console.log("All tasks deleted."); }
    else { await Task.insertMany(samples); console.log(`Added ${samples.length} sample tasks.`); }
  } catch (e) { console.error(e.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();
