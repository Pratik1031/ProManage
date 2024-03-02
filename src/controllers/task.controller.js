const Task = require("../models/task.models");
const asyncHandler = require("../utils/asyncHandler");
const api_error = require("../utils/api_error");
const api_response = require("../utils/api_response");

const create_task = asyncHandler(async (req, res) => {
  const task = new Task({ ...req.body, createdBy: req.userId });

  // const newTask = new Task(req.body);
  // const savedTask = await task.save();

  return res
    .status(200)
    .json(new api_response(201, task, "Task Created SucessFully"));
});

const all_task = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ createdBy: req.userId });

  if (!tasks) {
    throw new api_error(404, "Please Create a Task First !!");
  }

  return res
    .status(200)
    .json(new api_response(201, tasks, "All Tasks Fetched sucessfully"));
});

const delete_task = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.userId,
  });
  if (!task) {
    throw new api_error(404, "Tasks Not found");
  }

  return res
    .status(200)
    .json(new api_response(201, "Task Deleted SucessFully"));
});

const update_task = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.userId },
    req.body,
    { new: true }
  );
  if (!task) {
    throw new api_error(404, "Tasks Not found");
  }
  return res
    .status(200)
    .json(new api_response(201, task, "Task Updated Sucesfully"));
});
module.exports = { create_task, all_task, delete_task, update_task };
