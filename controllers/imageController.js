const image = require("../models/image");
const comment = require("../models/comment");

// Import modeli gallery i user - potrzebne do doawania obrazka
const gallery = require("../models/gallery");
const user = require("../models/user");

const multer = require("multer");
const path = require("path");

const asyncHandler = require("express-async-handler");

// Import funkcji walidatora.
const { body, validationResult } = require("express-validator");

exports.image_list = asyncHandler(async (req, res, next) => {
  const all_images = await image.find({}).populate("gallery").exec();
 res.render("image_list", { title: "List of all images:", image_list: all_images });
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // np. 1627483823.jpg
    }
});

const upload = multer({ storage: storage });

// OBSŁUGA DODAWANIA OBRAZKA
// Kontroler wyświetlania formularza dodawania obrazka - GET.
exports.image_add_get = asyncHandler(async (req, res, next) => {
    //utworzyć kod podobny jak przy wyświetlaniu formularza dodawania Galerii - GET.

    const all_galleries = await gallery.find().exec();

    if (req.loggedUser === "admin") {
        res.render("image_form_admin", {
            title: "Add Image (admin)",
            galleries: all_galleries,
        });
    } else if (req.loggedUser == null) {
        res.send("You must be logged in to add an image.");
    } else {
        let owner = await user.findOne({"username": req.loggedUser}).exec();
        const userGalleries = await gallery.find({ user: owner.id }).exec();
        res.render("image_form_user", {
            title: "Add Image",
            galleries: userGalleries,
        });
    }
});

// OBSŁUGA DODAWANIA OBRAZKA
// Kontroler przetwarzania danych formularza dodawania obrazka - POST.
exports.image_add_post = [
    upload.single("i_path"), // <-- multer obsługuje plik
    body("i_name", "Image name too short.")
        .trim()
        .isLength({ min: 2 })
        .escape(),

    body("i_description")
        .trim()
        .escape(),

    body("i_gallery", "Gallery must be selected.")
        .trim()
        .notEmpty()
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const all_galleries = await gallery.find().exec();

        const newImage = new image({
            name: req.body.i_name,
            description: req.body.i_description,
            path: req.file ? req.file.filename : null, // zapisujemy tylko nazwę pliku
            gallery: req.body.i_gallery,
        });

        if (!errors.isEmpty()) {
            const formView = req.loggedUser === "admin" ? "image_form_admin" : "image_form_user";
            return res.render(formView, {
                title: "Add Image",
                image: newImage,
                galleries: all_galleries,
                messages: errors.array().map(err => err.msg),
            });
        }

        await newImage.save();
        res.redirect("/images"); // lub wróć do formularza z komunikatem
    })
];

exports.image_show_get = asyncHandler(async (req, res, next) => {
    const image_id = req.query.image_id;
    const foundImage = await image.findById(image_id).exec();
    const comments = await comment.find({ image: image_id }).populate("author").sort({ date: -1 }).exec();

    if (!foundImage) {
        return res.status(404).send("Image not found");
    }

    res.render("image_show", {
        title: "Image preview",
        image: foundImage,
        comments,
        loggedUser: req.loggedUser,
    });
});


exports.image_update_get = asyncHandler(async (req, res, next) => {
    const image_id = req.query.image_id;
    const imageObj = await image.findById(image_id).populate("gallery").exec();

    if (!imageObj) return res.status(404).send("Image not found");

    let userGalleries;

    if (req.loggedUser === "admin") {
        userGalleries = await gallery.find().sort({ name: 1 }).exec();
    } else {
        const currentUser = await user.findOne({ username: req.loggedUser }).exec();
        userGalleries = await gallery.find({ user: currentUser._id }).exec();

        // sprawdź czy user jest właścicielem galerii
        if (!imageObj.gallery.user.equals(currentUser._id)) {
            return res.status(403).send("Not authorized");
        }
    }

    res.render("image_update", {
        title: "Update image:",
        image: imageObj,
        galleries: userGalleries,
        messages: [],
    });
});

exports.image_update_post = asyncHandler(async (req, res, next) => {
    const image_id = req.query.image_id;
    const imageObj = await image.findById(image_id).populate("gallery").exec();

    if (!imageObj) return res.status(404).send("Image not found");

    const currentUser = await user.findOne({ username: req.loggedUser }).exec();

    if (req.loggedUser !== "admin" && !imageObj.gallery.user.equals(currentUser._id)) {
        return res.status(403).send("Not authorized");
    }

    const updated = await image.findByIdAndUpdate(image_id, {
        name: req.body.i_name,
        description: req.body.i_description,
        gallery: req.body.i_gallery,
    });

    if (updated) {
        res.redirect("/galleries/gallery_browse");
    } else {
        res.send("Update error");
    }
});

exports.image_delete = asyncHandler(async (req, res, next) => {
    const image_id = req.params.image_id;
    const imageObj = await image.findById(image_id).populate("gallery").exec();

    if (!imageObj) return res.status(404).send("Image not found");

    const currentUser = await user.findOne({ username: req.loggedUser }).exec();

    if (req.loggedUser !== "admin" && !imageObj.gallery.user.equals(currentUser._id)) {
        return res.status(403).send("Not authorized");
    }

    await image.findByIdAndDelete(image_id);
    res.redirect("/galleries/gallery_browse");
});

exports.image_comment_post = asyncHandler(async (req, res, next) => {
    const image_id = req.params.image_id;

    const currentUser = await user.findOne({ username: req.loggedUser }).exec();

    if (!currentUser) return res.status(403).send("Login required");

    const newComment = new comment({
        content: req.body.comment_content,
        author: currentUser._id,
        image: image_id,
    });

    await newComment.save();
    res.redirect(`/images/image_show?image_id=${image_id}`);
});
