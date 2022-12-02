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

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;