const express = require("express");
const router = express.Router();
const {
  analyzeBug,
  getHistory,
  getHistoryItem,
} = require("../controllers/bugController");

router.post("/analyze", analyzeBug);
router.get("/history", getHistory);
router.get("/history/:id", getHistoryItem);

module.exports = router;
