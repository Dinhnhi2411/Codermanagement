const express = require("express");
const router = express.Router();
const {
  createTask,
  updateTask,
  getTaskById,
  deleteTask,
  getTasks,
} = require("../controllers/tasks.controllers");

/**
 * @route POST api/task
 * @descriptions create a new task
 * @access private
 */
router.post("/", createTask);
router.put("/:id", updateTask);
router.get("/:id", getTaskById);
router.delete("/:id", deleteTask);
router.get("/", getTasks);

module.exports = router;
