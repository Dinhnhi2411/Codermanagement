const { sendResponse, AppError } = require("../helpers/utils");
const Task = require("../model/Task");
const User = require("../model/User");

const ObjectId = require("mongoose").Types.ObjectId;

const userController = {};

// CREATE NEW USER (ASSIGN TASK)

userController.createUser = async (req, res, next) => {
  const info = req.body;
  try {
    if (!info.name)
      throw new AppError(406, "Bad request", "Field name is required");

    const haveEmployee = await User.findOne({ name: info.name });
    if (haveEmployee){ 
       throw new AppError(400, "Bad request", "Employee is existed");
      }
    

    const created = await User.create(info);
    sendResponse(res, 200, true, created, null, "Create user Success");
  } catch (error) {
    next(error);
  }
};

//  GET ALL USERS

userController.getUser = async (req, res, next) => {
  let { tasks, name, limit, page, ...filterQuery } = req.query;

  limit = parseInt(limit) || 10;
  page = parseInt(page) || 1;

  const filterKeys = Object.keys(filterQuery);
  let filter = {};
  try {
    if (filterKeys.length) {
      filterKeys.map((key) => {
        if (!filterQuery[key]) delete filterQuery[key];
      });
      throw new AppError(
        400,
        "Bad Request",
        `Query ${filterKeys.map((e) => e)} is not allowed`
      );
    }

    if (name) filter = { name: name };
    const users = await User.find(filter)
      // .populate("tasks")
      .sort({ createAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      

    // const total = await User.find({ isDeleted: false }).count();
    // const data = { users, total };

    sendResponse(res, 200, true, users, null, "Search Success");
  } catch (err) {
    next(err);
  }
};

//  GET USER BY ID

userController.getUserById = async (req, res, next) => {
  const { id } = req.params;

  try {
    // validate inputs

    if (!ObjectId.isValid(id)) {
      throw new AppError(400, "Bad request", " invalid id");
    }

    const userId = await User.findById(id);

    if (!userId) {
      throw new AppError(400, "Bad request", " Not Found Employee");
    }
    // console.log(userId);
    const getTask = await Task.find({ owner: id });
    if (!getTask && getTask.length === 0) {
      return sendResponse(
        res,
        200,
        true,
        userId,
        null,
        " Get list tasks success"
      );
    }
    return sendResponse(
      res,
      200,
      true,
      { ...userId._doc, task: getTask },
      null,
      " Get list tasks success"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = userController;
