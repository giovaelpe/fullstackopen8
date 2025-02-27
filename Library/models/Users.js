const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 4,
  },
  favoriteGenre: {
    type: String,
    required: true,
    minLength: 4,
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
  },
});

module.exports = mongoose.model("User", schema);
