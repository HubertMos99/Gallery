const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: Schema.Types.ObjectId, ref: "Image", required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("comment", CommentSchema);
