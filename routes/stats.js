var express = require('express');
var router = express.Router();

const stats_controller = require("../controllers/statsController");
/* GET stats */

router.get("/", stats_controller.stats_list);

module.exports = router;
