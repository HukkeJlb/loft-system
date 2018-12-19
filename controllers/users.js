const User = require("../db/models/users");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const uuid = require("uuid-v4");
const passport = require("passport");
const formDataParser = require("../helpers/formDataParser");

module.exports.saveNewUser = (req, res, next) => {
  const formData = formDataParser(req.text);
  User.find({ username: formData.username }, function(err, users) {
    if (users.length) {
      return res.status(406).json({ error: "Данное имя уже используется" });
    } else {
      const salt = bcrypt.genSaltSync(10);
      const password = formData.password;
      const user = new User();
      user.username = formData.username;
      user.surName = formData.surName;
      user.firstName = formData.firstName;
      user.middleName = formData.middleName;
      user.password = bcrypt.hashSync(password, salt);
      user.image = formData.image,
      user.permissionId = uuid();
      user.access_token = uuid();
      user
        .save()
        .then(user => {
          req.logIn(user, err => {
            if (err) next(err);
            res.status(200).send(user);
          });
        })
        .catch(next);
    }
  });
};

module.exports.login = (req, res, next) => {
  passport.authenticate("local", function(err, user, info) {
    console.log("user: ", user);
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.json({ error: "Пользователь не найден" });
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      const formData = formDataParser(req.text);
      if (formData.remembered) {
        const token = uuid();
        user.setToken(token);
        user.save().then(user => {
          res.cookie("token", token, {
            maxAge: 7 * 60 * 60 * 1000,
            path: "/",
            httpOnly: true
          });
          return res.json(user);
        });
      } else {
        return res.json(user);
      }
    });
  })(req, res, next);
};

module.exports.updateUser = (req, res, next) => {
  try {
    console.log(req.params.id);
    const formData = formDataParser(req.text);
    User.findById(req.params.id).then(user => {
      if (formData.oldPassword && formData.password) {
        if (user.validPassword(formData.oldPassword)) {
          user.setPassword(formData.password);
        } else {
          res.status(400).json({ error: "Неверный пароль!" });
        }
      }
      Array.from(Object.keys(formData))
        .filter(key => {
          return (
            key !== "id" &&
            key !== "oldPassword" &&
            key !== "password" &&
            key !== "image"
          );
        })
        .map(key => (user[key] = formData[key]));
      user.save().then(user => {
        res.json(user);
      });
    });
  } catch (err) {
    next(err);
  }
};

module.exports.deleteUser = (req, res, next) => {
  console.log(req.params.id);
  User.findOneAndRemove({ _id: req.params.id }, function(err, user) {
    if (err) {
      throw err;
    }
    console.log(`user id=${req.params.id} was deleted`);
  });
};
