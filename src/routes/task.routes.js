const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const verifyJWT = require("../middlewares/auth.middleware");

router.route("/create").post(verifyJWT, taskController.create_task);
router.route("/alltasks").get(verifyJWT, taskController.all_task);
router.route("/tasks/:id").delete(verifyJWT, taskController.delete_task);
router.route("/tasks/:id").put(verifyJWT, taskController.update_task);

module.exports = router;
