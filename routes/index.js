var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/about", function(req, res) {
  res.render("about", { title: "About", loggedUser: req.loggedUser });
});


module.exports = router;
