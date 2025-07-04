var express = require('express');
var router = express.Router();

const authenticate = require('../middleware/authenticate');
const gallery_controller = require("../controllers/galleryController");

const Gallery = require("../models/gallery");



// Obsługa GET: http://localhost/galleries/gallery_add
router.get("/gallery_add", gallery_controller.gallery_add_get);

// Obsługa POST: http://localhost/galleries/gallery_add
router.post("/gallery_add", gallery_controller.gallery_add_post);

router.get("/gallery_add", authenticate, gallery_controller.gallery_add_get);
router.post("/gallery_add", authenticate, gallery_controller.gallery_add_post);

// Wyświetlanie formularza przeglądania galerii GET (/galleries/gallery_browse)
router.get("/gallery_browse", authenticate, gallery_controller.gallery_browse_get);
// Przetwarzanie danych formularza przeglądania galerii POST(/galleries/gallery_browse)
router.post("/gallery_browse", authenticate, gallery_controller.gallery_browse_post);

// Edycja galerii
router.get("/gallery_update/:id", authenticate, gallery_controller.gallery_update_get);
router.post("/gallery_update/:id", authenticate, gallery_controller.gallery_update_post);

// Usuwanie galerii
router.post("/gallery_delete/:id", authenticate, gallery_controller.gallery_delete_post);


router.get("/", gallery_controller.gallery_list);

// Zwraca galerie danego użytkownika — AJAX
// AJAX: Pobierz galerie dla danego usera
router.get("/user/:id/galleries", authenticate, async (req, res) => {
    try {
        const galleries = await Gallery.find({ user: req.params.id }).select("_id name").exec();
        res.json(galleries);
    } catch (err) {
        console.error("Błąd przy pobieraniu galerii:", err);
        res.status(500).json({ error: "Błąd serwera" });
    }
});



module.exports = router;
