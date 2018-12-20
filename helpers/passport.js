const mongoose = require("mongoose");
const User = mongoose.model("User");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.serializeUser(function(user, done) {
  console.log('user from serialize', user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    done(null, id);
  } else {
    User.findById(id, function(err, user) {
      console.log('user from deserialize', user); //user found
      done(err, user);
    });
  }
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password"
    },
    function(username, password, done) {
      console.log("username", username);
      console.log("password", password);
      User.findOne({ username: username })
        .then(user => {
          console.log("user from passport", user);
          if (!user) {
            return done(null, false, { message: "Пользователь не найден" });
          }
          if (!user.validPassword(password)) {
            return done(null, false, { message: "Неверный пароль" });
          }
          return done(null, user);
        })
        .catch(err => done(err));
    }
  )
);
