const mongoose = require("mongoose");
const Task = require("../models/Task");

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const allowed = ["title", "description", "category", "priority", "dueDate", "completed", "isImportant"];
function cleanPayload(body) {
  const result = {};
  for (const key of allowed) if (body[key] !== undefined) result[key] = body[key];
  if (typeof result.title === "string") result.title = result.title.trim();
  if (typeof result.description === "string") result.description = result.description.trim();
  return result;
}

exports.getTasks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.completed === "true") filter.completed = true;
  if (req.query.completed === "false") filter.completed = false;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.important === "true") filter.isImportant = true;
  if (req.query.search) {
    const term = req.query.search.trim().slice(0, 100);
    filter.$or = [
      { title: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { description: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
    ];
  }
  const sort = req.query.sort || "newest";
  const rank = { High: 3, Medium: 2, Low: 1 };
  const tasks = await Task.find(filter).sort(sort === "oldest" ? { createdAt: 1 } : sort === "alphabetical" ? { title: 1 } : { createdAt: -1 });
  if (sort === "priority") tasks.sort((a, b) => rank[b.priority] - rank[a.priority]);
  if (sort === "dueDate") tasks.sort((a, b) => (a.dueDate ? a.dueDate.getTime() : Infinity) - (b.dueDate ? b.dueDate.getTime() : Infinity));
  res.json({ success: true, count: tasks.length, data: tasks });
});

exports.getTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid task ID." });
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: "Task not found." });
  res.json({ success: true, data: task });
});

exports.createTask = asyncHandler(async (req, res) => {
  const payload = cleanPayload(req.body);
  if (!payload.title || !payload.title.trim()) return res.status(400).json({ success: false, message: "Task title is required." });
  const task = await Task.create(payload);
  res.status(201).json({ success: true, message: "Task created.", data: task });
});

exports.updateTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid task ID." });
  const payload = cleanPayload(req.body);
  if (payload.title !== undefined && !payload.title) return res.status(400).json({ success: false, message: "Task title cannot be empty." });
  const task = await Task.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!task) return res.status(404).json({ success: false, message: "Task not found." });
  res.json({ success: true, message: "Task updated.", data: task });
});

exports.toggleComplete = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid task ID." });
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: "Task not found." });
  task.completed = !task.completed;
  await task.save();
  res.json({ success: true, message: "Task status updated.", data: task });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid task ID." });
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: "Task not found." });
  res.json({ success: true, message: "Task deleted." });
});
