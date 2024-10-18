const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
            title: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['credit-card', 'pay-at-place'], required: true },
    creditCardDetails: {
        cardNumber: { type: String },
        expireDate: { type: String },
        cvc: { type: String }
    },
    addressDetails: {
        receiptName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        address: { type: String, required: true }
    },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, default: 'รอการจัดส่ง' } // Status of the order
});

module.exports = mongoose.model('Order', orderSchema);
