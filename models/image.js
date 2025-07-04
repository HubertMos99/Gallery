const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  name: { type: String, maxLength: 100, required: true },
  description: { type: String, maxLength: 200 },
  path: { type: String, maxLength: 200 },
  gallery: { type: Schema.Types.ObjectId, ref: "Gallery", required: true }
}, { collection: 'images' });

// export modelu
module.exports = mongoose.model("Image", ImageSchema);
