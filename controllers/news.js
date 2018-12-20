const News = require("../db/models/news");
const mongoose = require("mongoose");
const formDataParser = require("../helpers/formDataParser");

module.exports.getNews = async (req, res, next) => {
  try {
    const news = new News();
    const allNews = await news.getNews();
    if (allNews.length) {
      res.status(200).send(allNews);
    }
  } catch (err) {
    throw err;
  }
};

module.exports.newNews = async (req, res, next) => {
  try {
    const formData = formDataParser(req.text);
    const newPost = new News(formData);
    await newPost.save();

    const news = new News();
    const allNews = await news.getNews();

    res.status(201).json(allNews);
  } catch (err) {
    next(err);
  }
};

module.exports.updateNews = async (req, res, next) => {
  try {
    const formData = formDataParser(req.text);
    const news = new News();

    await News.findOneAndUpdate(
      { _id: req.params.id },
      { theme: formData.theme, text: formData.text },
      { new: true }
    );

    const newNews = await news.getNews();
    res.status(200).json(newNews);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteNews = async (req, res, next) => {
  try {
    const news = new News();

    await News.deleteOne({ _id: req.params.id });
    const allNews = await news.getNews();
    res.status(200).json(allNews);
  } catch (err) {
    next(err);
  }
};
