const express = require('express');
const router = express.Router();
const { getPrivateData } = require("../features/auth/private");
const { protect } = require("../features/auth/middleware/auth");

router.route('/').get(protect, getPrivateData);

module.exports = router;
