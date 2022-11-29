var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Hello Coder Management");
});

const userRouter = require("./user.api");
router.use("/users", userRouter);

// const taskRouter = require("./task.api");
// router.use("/tasks", taskRouter);

module.exports = router;