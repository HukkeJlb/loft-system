const mongoose = require("mongoose");
const bCrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    surName: {
      type: String,
      default: ""
    },
    firstName: {
      type: String,
      default: ""
    },
    middleName: {
      type: String,
      default: ""
    },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: ""
    },
    permissionId: {
      type: String,
      default: Math.random()
    },
    permission: {
      chat: {
        C: { type: Boolean, default: false },
        R: { type: Boolean, default: true },
        U: { type: Boolean, default: true },
        D: { type: Boolean, default: false }
      },
      news: {
        C: { type: Boolean, default: false },
        R: { type: Boolean, default: true },
        U: { type: Boolean, default: false },
        D: { type: Boolean, default: false }
      },
      setting: {
        C: { type: Boolean, default: false },
        R: { type: Boolean, default: false },
        U: { type: Boolean, default: false },
        D: { type: Boolean, default: false }
      }
    },
    access_token: {
      type: String,
      default: ""
    }
  },
  {
    toObject: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

userSchema.methods.setPassword = function(password) {
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

userSchema.methods.validPassword = function(password) {
  return bCrypt.compareSync(password, this.password);
};

userSchema.methods.setToken = function(token) {
  this.access_token = token;
};

module.exports = mongoose.model("User", userSchema);
