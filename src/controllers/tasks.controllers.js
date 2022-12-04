const { sendResponse, AppError } = require("../helpers/utils");
const Task = require("../model/Task");
const User = require("../model/User");
const ObjectId = require("mongoose").Types.ObjectId;
const taskController = {};

//  CREATE TASKS

taskController.createTask = async (req, res, next) => {
  const data = req.body;

  try {
    if (!data.title || !data.description)
      throw new AppError(400, "Bad request", "Missing title/description");

    const task = await Task.findOne({ title: data.title });
    if (task) throw new AppError(400, "Bad request", "Task is existed");

    const taskObj = await Task.create(data);
    sendResponse(res, 200, true, taskObj, null, "Create task success");
  } catch (err) {
    next(err);
  }
};

// EDIT-UPDATE TASK

taskController.updateTask = async (req, res, next) => {
  const { id } = req.params;
  const update = req.body;
  const { status, owner } = update;
  const allowUpdate = ["pending", "working", "review", "done", "archive"];
  try {
    //check invalid mongo object id
    if (!ObjectId.isValid(id))
      throw new AppError(400, "Invalid ObjectId", "Bad request");
    //missing status
    if (!status) throw new AppError(400, "Missing status", "Bad request");

    let task = await Task.findById(id);

    //check allowance status
    const currentStatus = allowUpdate.find((e) => e === status);
    //status is set done, it can’t be changed to other value except archive
    if (task.status === "done") {
      if (currentStatus !== "archive") {
        throw new AppError(
          400,
          "Done task just store as archive status",
          "Bad request"
        );
      } else {
        const updated = await Task.findByIdAndUpdate(id, update, {
          new: true,
        });
        sendResponse(res, 200, true, updated, null, "update task successfully");
        return;
      }
    }

    if (!currentStatus) {
      throw new AppError(403, "Status is not allow", "Bad request");
    }

    //assign task
    const assignTask = task.owner[0]?._id.toString() !== owner;
    console.log(assignTask);

    if (assignTask && owner) {
      task.owner.push(id);
      await task.save();
    }

    // unassign task
    if (!assignTask && owner) {
      const updated = await Task.findByIdAndUpdate(
        id,
        { ...update, owner: [] },
        { new: true }
      );
      sendResponse(res, 200, true, updated, null, "Unassign task successfully");
    }

    if ((currentStatus && assignTask) || (currentStatus && !owner)) {
      const updated = await Task.findByIdAndUpdate(id, update, { new: true });
      sendResponse(res, 200, true, updated, null, "update task successfully");
    }
  } catch (error) {
    next(error);
  }
};

taskController.getTaskById = async (req, res, next) => {
  const { id } = req.params;

  try {
    //check invalid mongo object id
    if (!ObjectId.isValid(id))
      throw new AppError(400, "Invalid ObjectId", "Bad request");

    const task = await Task.findById(id).populate("owner");
    //check task is not found
    if (!task) throw new AppError(404, "Task is not found", "Bad request");
    sendResponse(res, 200, true, task, null, "Get task successfully");
  } catch (error) {
    next(error);
  }
};

// GET TASK BY ID

taskController.getTaskById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) throw new AppError(402, "Cannot access task", "Bad request");
  try {
    if (!ObjectId.isValid(id))
      throw new AppError(400, "Bad request", "Ivalid id");
    // Find task by id
    const found = await Task.findOne({ _id: `${id}` });

    sendResponse(res, 200, true, found, null, "Get task successfully");
  } catch (error) {
    next(error);
  }
};

// GET ALLS TASKS

taskController.getTasks = async (req, res, next) => {
  let { page, limit, owner, status, search } = req.query;

  limit = parseInt(limit) || 10;
  page = parseInt(page) || 1;

  try {
    let filter = {};

    if (status) filter = { status, isDeleted: false };
    if (owner) filter = { owner, isDeleted: false };

    //
    if (search)
      filter = {
        $or: [
          { description: { $regex: `.*${search}.*` }, isDeleted: false },
          { title: { $regex: `.*${search}.*` }, isDeleted: false },
        ],
      };

    if (status && owner) filter = { status, owner, isDeleted: false };

    if (status && search)
      filter = {
        status,
        $or: [
          { description: { $regex: `.*${search}.*` }, isDeleted: false },
          { title: { $regex: `.*${search}.*` }, isDeleted: false },
        ],
        isDeleted: false,
      };

    //

    if (search && owner)
      filter = {
        owner,
        $or: [
          { description: { $regex: `.*${search}.*` }, isDeleted: false },
          { title: { $regex: `.*${search}.*` }, isDeleted: false },
        ],
        isDeleted: false,
      };

    //
    if (search && owner && status)
      filter = {
        owner,
        status,
        $or: [
          { description: { $regex: `.*${search}.*` }, isDeleted: false },
          { title: { $regex: `.*${search}.*` }, isDeleted: false },
        ],
        isDeleted: false,
      };

    //    create

    const task = await Task.find(filter)
      .populate("owner")
      .sort({ createAt: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Task.find({ isDeleted: false }).count();

    sendResponse(res, 200, true, { task, total }, null, "Get task success");
  } catch (err) {
    next(err);
  }
};

// DELETE TASKS

taskController.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteTask = await Task.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deleteTask) {
      throw new AppError(400, "Bad request", "Task is not found");
    }
    sendResponse(res, 200, true, deleteTask, null, "Delete task successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = taskController;
