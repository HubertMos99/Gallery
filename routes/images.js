var express = require('express');
var router = express.Router();

const image_controller = require("../controllers/imageController");
const authenticate = require("../middleware/authenticate");

router.get("/", image_controller.image_list);

//Wyświetlanie formularza dodawania obrazka - GET.
router.get("/image_add", authenticate, image_controller.image_add_get);
//Przetwarzanie danych formularza dodawania obrazka - POST.
router.post("/image_add", authenticate, image_controller.image_add_post);

router.get("/image_show", authenticate, image_controller.image_show_get);

router.get("/image_update", authenticate, image_controller.image_update_get);
router.post("/image_update", authenticate, image_controller.image_update_post);

router.post("/image_delete/:image_id", authenticate, image_controller.image_delete);

// Dodanie komentarza do obrazka
router.post("/image_comment/:image_id", authenticate, image_controller.image_comment_post);

router.post('/test', (req, res) => {
    console.log('BODY:', req.body);
    res.send('BODY received: ' + JSON.stringify(req.body));
});


module.exports = router;
