const express = require("express");
const createError = require("http-errors");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);

const db = require("./db");
const basicRouter = require("./routes/index");
const apiRouter = require("./routes/api");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  if (req.is("text/*")) {
    req.text = "";
    req.setEncoding("utf8");
    req.on("data", function(chunk) {
      req.text += chunk;
    });
    req.on("end", next);
  } else {
    next();
  }
});

app.use(cookieParser());
app.use(
  session({
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    secret: "key-secret",
    key: "homework5",
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 7 * 60 * 60 * 1000
    },
    saveUninitialized: false,
    resave: true,
    ephemeral: true,
    rolling: true
  })
);

require("./helpers/passport");
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", apiRouter);
app.use("/", basicRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.send({error: 'Что-то пошло не так...'});
});

module.exports = app;
