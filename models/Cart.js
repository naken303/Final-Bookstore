const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  sessionId: String, // For guest users
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For logged-in users
  items: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
      quantity: { type: Number, default: 1 },
      price: Number
    }
  ],
  totalAmount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Cart', cartSchema);
