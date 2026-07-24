const express = require("express");
const router = express.Router();
const { analyzeBug } = require("../controllers/bugController");

router.post("/analyze", analyzeBug);

module.exports = router;