const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true }, 
        description: { type: String, required: true }, 
        status: {
            type: String, 
            enum: ["pending", "working", "review", "done", "archive" ],
            default: "pending", 
            required: true,
        },
        owner: { type: [mongoose.SchemaTypes.ObjectId], ref: "User"},
        isDeleted: { type: Boolean, default: false, required: true},
    },
    { timestamps: true }
);

taskSchema.pre(/^find/, function (next) {

  if (!("_conditions" in this)) return next();

  if (!("isDeleted" in taskSchema.paths)) {
    delete this["_conditions"]["all"];
    return next();
  }

  if (!("all" in this["_conditions"])) {
    this["_conditions"].isDeleted = false;
  } else {
    delete this["_conditions"]["all"];
  } 

  next();
});



const Task = mongoose.model("Task", taskSchema);

module.exports = Task;