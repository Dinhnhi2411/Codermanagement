const express = require("express");
const router = express.Router();
const {
  createTask,
  updateTask,
  getTaskById,
  deleteTask,
  getTasks,
} = require("../controllers/tasks.controllers");

// POST TASK
/**
 * @route POST api/task
 * @descriptions create a new task
 * @access private, assiger
 */
router.post("/", createTask);

// PUT TASK
/**
 * @route PUT api/tasks/:id
 * @description update status or assignee to assign or unassign task to employee
 * @access private, assigner
 * @allowUpdates : {
 * "description": string,
 * "new status":string,
 * "new owner":objectId string to assign task,
 * "remove owner":objectId string to owner
 * }
 */

router.put("/:id", updateTask);

// GET BY ID TASK
/**
 * @route GET api/tasks/:id
 * @description get detail description of this task by task's id
 * @access private, assigner
 */

router.get("/:id", getTaskById);

// GET ALL TASKS
/**
 * @route GET api/tasks
 * @description Get all task
 * @access private, assigner
 */

router.get("/", getTasks);

// DELETE TASK
/**
 * @route DELETE api/tasks/:id
 * @description delete task when done
 * @access private, assigner
 */

router.delete("/:id", deleteTask);

module.exports = router;
