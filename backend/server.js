require("dotenv").config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false }));

app.get("/api/health", (req, res) => res.json({ success: true, message: "TaskFlow API is healthy." }));
app.use("/api/tasks", taskRoutes);
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`TaskFlow running at http://localhost:${PORT}`)))
  .catch((err) => {
    console.error("Could not start TaskFlow:", err.message);
    process.exit(1);
  });
