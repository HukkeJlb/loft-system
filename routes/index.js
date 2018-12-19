const express = require("express");
const path = require('path');
const router = express.Router();

router.get('*', async (req, res, next) =>{
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

router.get("/", function(req, res, next) {
  res.json({ success: true });
});

module.exports = router;
