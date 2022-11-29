const { sendResponse, AppError } = require("../helpers/utils");
const Task = require("../models/Task");
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
    sendResponse(res, 200, true, null, "Create task success");
  } catch (err) {
    next(err);
  }
};

// UPDATE TASK

taskController.updateTask = async (req, res, next) => {
  const { id } = req.params;
  const update = req.body;
  const { status, owner } = update;
  const allowUpdate = ["pending", "working", "review", "done", "archive"];

  try {
    if (!ObjectId.isValid(id))
      throw new AppError(400, "Bad request", "Ivalid id");
    let task = await Task.findById(id);

    const nowStatus = allowUpdate.find((e) => e === status);

    if (task.status === "done") {
      if (nowStatus != "archive") {
        throw new AppError(400, "Bad request", "Done task, now just archive");
      } else {
        const updated = await Task.findByIdAndUpdate(id, update, { new: true });
        sendResponse(res, 200, true, updated, null, "Update task success");
        return;
      }
    }

    if (!nowStatus) {
      throw new AppError(400, "Bad request", "Status is not allow");
    }

    // assign tasks

    const assignTask = task.owner[0]._id.toString() != owner;
    console.log(assignTask);

    if (assignTask && owner) {
      task.onwer.push(id);
      await task.save();
    }
    if (!assignTask && owner) {
      const updated = await task.findByIdAndUpdate(
        id,
        { ...update, owner: [] },
        { new: true }
      );
      sendResponse(res, 200, true, updated, null, "Remove assign success");
    }

    if (!status) throw new AppError(400, "Bad request", "Missing status");

    if ((nowStatus && assignTask) || (nowStatus && !owner)) {
      const updated = await Task.findByIdAndUpdate(id, update, { new: true });
      sendResponse(res, 200, true, updated, null, " Update task success");
    }
  } catch (err) {
    next(err);
  }
};

// GET TASK BY ID

taskController.getTaskById = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!ObjectId.isValid(id))
      throw new AppError(400, "Bad request", "Invalid id");
    const task = await Task.findById(id).populate("owner");

    if (!task) throw new AppError(400, "Bad request", "Task is not found");
    sendResponse(200, res, true, task, null, "Get list task succes");
  } catch (err) {
    next(err);
  }
};

// GET ALLS TASKS

ttaskController.getTasks = async (req, res, next) => {
  let { page, limit, owner, status, search } = req.query;

  limit = parseInt(limit) || 10;
  page = parseInt(page) || 1;

  try {
    let filter = {};

    if (status) filter = { status, isDeleted: false };
    if (owner) filter = { owner, isDeleted: false };

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

    const task = await Task.find(filter)
      .opulate("owner")
      .sort({ createAt: -1 })
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
  const { id } = req.params;
  try {
    //validate input
    if (!ObjectId.isValid(id))
      throw new AppError(400, "Bad request", "Invalid ObjectId");

    const deleted = {
      isDeleted: true,
    };
    const task = await Task.findByIdAndUpdate(id, deleted, { new: true });

    if (!task) throw new AppError(400, "Bad request", "Task is not found");
    //send res
    sendResponse(res, 200, true, task, null, "Delete task successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = taskController;
