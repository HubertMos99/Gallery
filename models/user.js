const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, maxLength: 100 },
  surname: { type: String, maxLength: 100 },
  username: { type: String, maxLength: 100 },
  password: { type: String }
}, { collection: 'users'});

// Export model
module.exports = mongoose.model("User", UserSchema);

//(Model) User => (kolekcja) users
