const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Middleware to check if the user is logged in
function checkAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// GET /checkout route
router.get('/checkout', checkAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user._id; // Get the logged-in user's ID

        // Find the user's cart
        const cart = await Cart.findOne({ userId }).populate('items.bookId');
        
        // Check if the cart exists and has items
        if (!cart || cart.items.length === 0) {
            req.session.cartCount = 0; // Reset the cart count in session
            req.session.save(() => {
                // Redirect to the home page with a message
                res.send("<script>alert('Your cart is empty. Add some items first!'); window.location.href = '/';</script>");
            });
            return;
        }

        // Prepare the cart data to be rendered in the EJS view
        const cartItems = cart.items.map(item => ({
            book: {
                _id: item.bookId._id,
                title: item.bookId.title,
                imageUrl: item.bookId.imageUrl,
                price: item.bookId.price
            },
            quantity: item.quantity
        }));

        const totalAmount = cart.totalAmount;

        // Render the checkout page and pass the cart data and total amount
        res.render('checkout', {
            cart: cartItems,
            totalAmount: totalAmount,
            cartCount: req.session.cartCount || 0,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading checkout:', error);
        res.status(500).send('Server error. Please try again later.');
    }
});



router.post('/checkout', async (req, res) => {
    try {
        const userId = req.session.user._id;  // Ensure the user is logged in

        // Retrieve cart data for the logged-in user
        const cart = await Cart.findOne({ userId }).populate('items.bookId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty. Please add items to your cart before checkout.' });
        }

        // Get form data from the request
        const { receiptName, phoneNumber, address, payChoice, cardNumber, expireDate, cvc } = req.body;

        // Validate form data
        if (!receiptName || !phoneNumber || !address) {
            return res.status(400).json({ message: 'Please fill out the address details.' });
        }

        // If payment choice is credit card, validate card information
        if (payChoice === 'credit-card') {
            if (!cardNumber || !expireDate || !cvc) {
                return res.status(400).json({ message: 'Please provide all credit card details.' });
            }
        }

        // Create the order
        const newOrder = new Order({
            userId: userId,
            items: cart.items.map(item => ({
                bookId: item.bookId._id,
                title: item.bookId.title,
                quantity: item.quantity,
                price: item.bookId.price
            })),
            totalAmount: cart.totalAmount,
            paymentMethod: payChoice,
            creditCardDetails: payChoice === 'credit-card' ? { cardNumber, expireDate, cvc } : {},
            addressDetails: {
                receiptName,
                phoneNumber,
                address
            }
        });

        // Save the order in the database
        await newOrder.save();

        // Loop through each item in the cart to update book quantity
        for (let item of cart.items) {
            const book = await Book.findById(item.bookId._id);
            if (book) {
                // Reduce the stock by the quantity ordered
                if (book.qty >= item.quantity) {
                    book.qty -= item.quantity;
                    await book.save();
                } else {
                    return res.status(400).json({ message: `Not enough stock for ${book.title}.` });
                }
            }
        }

        // Clear the user's cart after successful checkout
        await Cart.deleteOne({ userId });

        // Redirect to order confirmation page or send success response
        res.redirect('/'); // You can create a confirmation page or send a success message
    } catch (error) {
        console.error('Error processing checkout:', error);
        res.status(500).json({ message: 'There was an error processing your order. Please try again later.' });
    }
});


module.exports = router;
