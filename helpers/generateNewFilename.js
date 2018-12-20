const path = require("path");

const generateNewFilename = filename => {
  var string = "";
  var extension = path.extname(filename);
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 10; i++) {
    string += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  var newFilename = string + extension;

  return newFilename;
};

module.exports = generateNewFilename;