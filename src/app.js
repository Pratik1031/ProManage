const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
// cors setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// app configs
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes Import
const user_routes = require("./routes/user.routes");
const task_routes = require("./routes/task.routes");

// routes
app.get("/", (req, res) => {
  res.send("Hello Dev ");
});

app.use("/api/v1/users", user_routes);
app.use("/api/v1/task", task_routes);

module.exports = app;
