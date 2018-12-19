const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsSchema = new Schema({
  userId: {
    ref: "users",
    type: Schema.Types.ObjectId
  },
  theme: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true }
});

newsSchema.methods.getNews = function() {
  return this.model("News").aggregate([
    {
      $lookup: {
        from: "User",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
  ]);
};

module.exports = mongoose.model("News", newsSchema);
