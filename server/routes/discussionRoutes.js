const express = require("express");
const router = express.Router();

const {
  createDiscussion,
  getDiscussions,
} = require("../controllers/discussionController");

router.post("/discussions", createDiscussion);
router.get("/discussions", getDiscussions);

module.exports = router;