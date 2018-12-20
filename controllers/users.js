const fs = require("fs");
const path = require("path");
const User = require("../db/models/users");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const uuid = require("uuid-v4");
const passport = require("passport");
const formidable = require("formidable");
const formDataParser = require("../helpers/formDataParser");
const generateNewFilename = require("../helpers/generateNewFilename");

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then(users => {
      res.status(200).json(users);
    })
    .catch(next);
};

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
      user.image = formData.image;
      user.permissionId = uuid();
      user.access_token = "";
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
  const formData = formDataParser(req.text);

  User.findOne({ username: formData.username })
    .then(user => {
      if (!user) {
        return res.json({ error: "Пользователь не найден" });
      }

      if (!user.validPassword(formData.password)) {
        return res.json({ error: "Неверный пароль" });
      }

      if (formData.remembered) {
        const token = uuid();
        user.setToken(token);
        user.save().then(user => {
          res.cookie("access_token", token, {
            maxAge: 7 * 60 * 60 * 1000,
            path: "/",
            httpOnly: true
          });
          return res.send(user);
        });
      } else {
        return res.send(user);
      }
    })
    .catch(next);

  // passport.authenticate("local", function(err, user, info) {
  //   // console.log("passport user from session: ", req.session.passport.user);
  //   // console.log("req.user: ", req.user);
  //   if (err) {
  //     return next(err);
  //   }
  //   if (!user) {
  //     return res.json({ error: "Пользователь не найден" });
  //   }
  //   req.logIn(user, function(err) {
  //     if (err) {
  //       return next(err);
  //     }
  //     const formData = formDataParser(req.text);
  //     if (formData.remembered) {
  //       const token = uuid();
  //       user.setToken(token);
  //       user.save().then(user => {
  //         res.cookie("access_token", token, {
  //           maxAge: 7 * 60 * 60 * 1000,
  //           path: "/",
  //           httpOnly: true
  //         });
  //         return res.json(user);
  //       });
  //     } else {
  //       return res.json(user);
  //     }
  //   });
  // })(req, res, next);
};

module.exports.authFromToken = async (req, res, next) => {
  const access_token = req.cookies.access_token;
  if (access_token) {
    try {
      const user = await User.findOne({ access_token: access_token });
      console.log(user);
      if (user) {
        req.logIn(user, err => {
          if (err) {
            next(err);
          }
          res.status(200).json(user);
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
};

module.exports.updateUser = (req, res, next) => {
  const formData = formDataParser(req.text);
  User.findById(req.params.id)
    .then(user => {
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
      user
        .save()
        .then(user => {
          res.json(user);
        })
        .catch(next);
    })
    .catch(next);
};

module.exports.updateUserPermission = (req, res, next) => {
  const formData = formDataParser(req.text);
  User.findOne({ permissionId: req.params.id }).then(user => {
    user.permission = {
      chat: { ...user.permission.chat, ...formData.permission.chat },
      news: { ...user.permission.news, ...formData.permission.news },
      setting: { ...user.permission.setting, ...formData.permission.setting }
    };

    user.save();
  });

  User.find({})
    .then(users => {
      res.status(200).json(users);
    })
    .catch(next);
};

module.exports.saveUserImage = (req, res, next) => {
  let userId = req.params.id;
  let form = new formidable.IncomingForm();
  let upload = path.join("./public", "upload");

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload);
  }

  form.uploadDir = path.join(process.cwd(), upload);

  form.parse(req, function(err, fields, files) {
    if (err) {
      return next(err);
    }

    let imageObj = files[userId];

    const fileName = path.join(upload, generateNewFilename(imageObj.name));

    fs.rename(imageObj.path, fileName, function(err) {
      if (err) {
        console.error(err.message);
        return res.json({ error: err.message });
      }
      let image = fileName.substr(fileName.indexOf("/"));

      User.findOneAndUpdate(
        { _id: userId },
        { image: image },
        { new: true }
      )
        .then(user => {
          return res.json({ path: user.image });
        })
        .catch(next);
    });
  });
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
