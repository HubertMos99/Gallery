const gallery = require("../models/gallery");
const user = require("../models/user");
const image = require("../models/image");

const asyncHandler = require("express-async-handler");

exports.gallery_list = asyncHandler(async (req, res, next) => {
  const all_galleries = await gallery.find({}).populate("user").exec();
  res.render("gallery_list", { title: "List of all galleries:", gallery_list: all_galleries });
});

// Import walidatora.
const { body, validationResult } = require("express-validator");

// GET - Kontroler wyświetlania formularza dodawania nowej galerii (metoda GET).
exports.gallery_add_get = asyncHandler(async (req, res, next) => {

  // pobranie listy userów z bazy
  const all_users = await user.find().sort({surname:1}).exec();
  // rendering formularza
  if (req.loggedUser === "admin") {
    // pokaz formularz z listą użytkowników
    res.render("gallery_form_admin", {title: "Add Gallery (admin)", all_users});
  } else if(req.loggedUser == null) {

    console.log("Musisz się zalogować żeby dodać galerię", req.loggedUser);
  } else {
    // zwykły użytkownik — przypisanie do siebie
    res.render("gallery_form_user", { title: "Add Gallery", user: req.loggedUser });
  }



});

// POST - Kontroler (lista funkcji) obsługi danych z formularza dodawania nowej galerii (metoda POST).
exports.gallery_add_post = [
  body("g_name", "Gallery name too short.")
      .trim()
      .isLength({ min: 2 })
      .escape(),

  body("g_description")
      .trim()
      .escape(),

  // UWAGA: to pole będzie walidowane tylko jeśli dodaje admin
  body("g_user", "Username must be selected.")
      .optional({ checkFalsy: true })
      .trim()
      .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const all_users = await user.find().sort({ last_name: 1 }).exec();

    // Wybierz autora zależnie od tego, kto dodał galerię
    let selectedUser;

    if (req.loggedUser === "admin") {
      if (!req.body.g_user) {
        // Admin nie wybrał użytkownika — formularz niepoprawny
        const myMessages = ["You must select a user."];
        return res.render("gallery_form_admin", {
          title: "Add gallery:",
          gallery: {},
          all_users,
          messages: myMessages,
        });
      }
      selectedUser = req.body.g_user;
    } else {
      let owner = await user.findOne({"username": req.loggedUser}).exec();
      selectedUser = owner.id;
    }

    const newgallery = new gallery({
      name: req.body.g_name,
      description: req.body.g_description,
      user: selectedUser,
      date: new Date(),
    });

    if (!errors.isEmpty()) {
      let myMessages = errors.array().map(err => err.msg);
      const formView = req.loggedUser === "admin" ? "gallery_form_admin" : "gallery_form_user";
      res.render(formView, {
        title: "Add gallery:",
        gallery: newgallery,
        all_users,
        user: req.loggedUser,
        messages: myMessages,
      });
      return;
    }

    const galleryExists = await gallery.findOne({
      name: req.body.g_name,
      user: selectedUser,
    })
        .collation({ locale: "pl", strength: 2 })
        .exec();

    if (galleryExists) {
      const formView = req.loggedUser === "admin" ? "gallery_form_admin" : "gallery_form_user";
      res.render(formView, {
        title: "Add gallery:",
        gallery: newgallery,
        all_users,
        user: req.loggedUser,
        messages: [`Gallery "${newgallery.name}" already exists!`],
      });
      return;
    }

    await newgallery.save().then(() => {
      const formView = req.loggedUser === "admin" ? "gallery_form_admin" : "gallery_form_user";
      res.render(formView, {
        title: "Add gallery:",
        gallery: newgallery,
        all_users,
        user: req.loggedUser,
        messages: [`Gallery "${newgallery.name}" added!`],
      });
    });
  }),
];

// Kontroler wyświetlania formularza GET gallery_browse - wyświetla formularz wyboru galerii
exports.gallery_browse_get = asyncHandler(async (req, res, next) => {
// Pokaż formularz wyboru gallerii
  const all_galleries = await gallery.find({}).exec();
  res.render("gallery_browse", { title: "Select gallery:", galleries: all_galleries, loggedUser: req.loggedUser
  });
});
// Kontroler przetwarzania formularza POST gallery_browse - wyświetla brazki, ale też formularz wyboru galerii
exports.gallery_browse_post = asyncHandler(async (req, res, next) => {
// Pokaż listę obrazków wybranej gallerii
  const all_galleries = await gallery.find({}).exec();
  let gallery_images = [];
  let sel_gallery = null
  if (req.body.s_gallery) {
    gallery_images = await image.find({ gallery: req.body.s_gallery }).exec();
    sel_gallery = req.body.s_gallery

    selected_gallery = await gallery.findById(sel_gallery).populate("user").exec();
  }
  res.render("gallery_browse", { title: "View gallery:", galleries: all_galleries, images: gallery_images,
    sel_gallery: sel_gallery, loggedUser: req.loggedUser, gallery: selected_gallery});
});

exports.gallery_update_get = asyncHandler(async (req, res, next) => {
  const galleryId = req.params.id;
  const currentGallery = await gallery.findById(galleryId).populate("user").exec();

  if (!currentGallery) return res.status(404).send("Gallery not found");

  const loggedUsername = req.loggedUser;

  if (
      loggedUsername !== "admin" &&
      currentGallery.user.username !== loggedUsername
  ) {
    return res.status(403).send("Not authorized");
  }

  res.render("gallery_update", {
    title: "Update gallery:",
    gallery: currentGallery,
    messages: [],
  });
});

exports.gallery_update_post = [
  body("g_name", "Gallery name too short.").trim().isLength({ min: 2 }).escape(),
  body("g_description").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const galleryId = req.params.id;
    const currentGallery = await gallery.findById(galleryId).populate("user").exec();

    if (!currentGallery) return res.status(404).send("Gallery not found");

    const loggedUsername = req.loggedUser;

    if (
        loggedUsername !== "admin" &&
        currentGallery.user.username !== loggedUsername
    ) {
      return res.status(403).send("Not authorized");
    }

    currentGallery.name = req.body.g_name;
    currentGallery.description = req.body.g_description;

    if (!errors.isEmpty()) {
      return res.render("gallery_update", {
        title: "Update gallery:",
        gallery: currentGallery,
        messages: errors.array().map((err) => err.msg),
      });
    }

    await currentGallery.save();
    res.redirect("/galleries/gallery_browse");
  }),
];

exports.gallery_delete_post = asyncHandler(async (req, res, next) => {
  const galleryId = req.params.id;
  const galleryToDelete = await gallery.findById(galleryId).populate("user").exec();

  if (!galleryToDelete) return res.status(404).send("Gallery not found");

  const loggedUsername = req.loggedUser;

  if (
      loggedUsername !== "admin" &&
      galleryToDelete.user.username !== loggedUsername
  ) {
    return res.status(403).send("Not authorized");
  }

  // Usunięcie obrazków z bazy (ale nie z dysku)
  await image.deleteMany({ gallery: galleryId }).exec();

  // Usunięcie galerii
  await gallery.findByIdAndDelete(galleryId).exec();

  res.redirect("/galleries/gallery_browse");
});



