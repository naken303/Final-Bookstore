const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  publisher: String,
  description: String,
  isbn: String,
  imageUrl: String,
  category: String,
  qty: String,
  price: Number,
});

module.exports = mongoose.model('Book', bookSchema);
