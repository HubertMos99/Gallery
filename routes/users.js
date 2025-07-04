var express = require('express');
var router = express.Router();

// import modułu kontrolera
const userController = require("../controllers/userController");

router.get("/", userController.userList);

// Obsługa GET: http://localhost/users/user_add
router.get("/user_add", userController.user_add_get);

// Obsługa POST: http://localhost/users/user_add
router.post("/user_add", userController.user_add_post);

// LOGOWANIE I WYLOGOWANIE
router.get("/user_login", userController.user_login_get);
router.post("/user_login", userController.user_login_post);
router.get("/user_logout", userController.user_logout_get);


module.exports = router;

// https://mongoosejs.com/docs/models.html