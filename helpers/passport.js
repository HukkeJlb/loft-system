const mongoose = require("mongoose");
const User = mongoose.model("User");
const LocalStrategy = require("passport-local").Strategy;

module.exports = passport => {
  passport.use(
    new LocalStrategy(function(username, password, done) {
      // console.log("username", username);
      // console.log("password", password);
      User.findOne({ username: username })
        .then(user => {
          // console.log("user from passport", user);
          if (!user) {
            return done(null, false, { message: "Пользователь не найден" });
          }
          if (!user.validPassword(password)) {
            return done(null, false, { message: "Неверный пароль" });
          }
          return done(null, user);
        })
        .catch(err => done(err));
    })
  );

  passport.serializeUser(function(user, done) {
    // console.log("user from serialize", user);
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    // console.log("userId from deserialize - ", id);
    User.findOne(
      {
        _id: id
      },
      function(err, user) {
        done(err, user);
      }
    );
  });
};
