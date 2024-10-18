const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Cart = require('../models/Cart');
const Book = require('../models/Book');

router.get('/', async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        const sessionId = req.sessionID;

        // Find the cart by userId (for logged-in users) or sessionId (for guests)
        let cart;
        if (userId) {
            cart = await Cart.findOne({ userId }).populate('items.bookId'); // Populate book details
        } else {
            cart = await Cart.findOne({ sessionId }).populate('items.bookId');
        }

        if (!cart) {
            return res.json({ items: [], totalAmount: 0 }); // Return empty cart if none found
        }

        // Prepare cart data with populated book info
        const cartData = {
            items: cart.items.map(item => ({
                book: {
                    _id: item.bookId._id,
                    title: item.bookId.title,
                    imageUrl: item.bookId.imageUrl,
                    price: item.price,
                },
                quantity: item.quantity
            })),
            totalAmount: cart.totalAmount
        };

        res.json(cartData);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Error fetching cart' });
    }
});

// Route to update the quantity of a cart item
router.post('/update', async (req, res) => {
    const { bookId, quantity } = req.body;

    try {
        const userId = req.session.user ? req.session.user._id : null;
        const sessionId = req.sessionID;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Ensure requested quantity does not exceed available stock
        if (quantity > book.qty) {
            return res.status(400).json({
                message: `Only ${book.qty} of ${book.title} available in stock.`,
                availableStock: book.qty
            });
        }

        let cart = userId 
            ? await Cart.findOne({ userId }) 
            : await Cart.findOne({ sessionId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.bookId.toString() === bookId);

        if (itemIndex !== -1) {
            cart.items[itemIndex].quantity = quantity;
            cart.totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
            await cart.save();
            res.json({ success: true, cart });
        } else {
            res.status(404).json({ message: 'Book not found in cart' });
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Error updating cart item' });
    }
});

router.post('/add', async (req, res) => {
    try {
        const bookId = req.body.bookId;

        // Find the book details (including stock)
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Get userId (if logged in) or sessionId (for guest users)
        const userId = req.session.user ? req.session.user._id : null;
        const sessionId = req.sessionID;

        // Find the cart based on userId (for logged-in users) or sessionId (for guest users)
        let cart;
        if (userId) {
            cart = await Cart.findOne({ userId });
        } else {
            cart = await Cart.findOne({ sessionId });
        }

        // If no cart exists, create a new one
        if (!cart) {
            cart = new Cart({ sessionId: sessionId, items: [], totalAmount: 0 });
            if (userId) {
                cart.userId = userId;
            }
        }

        // Check if the book is already in the cart
        const existingItem = cart.items.find(item => item.bookId == bookId);

        // Calculate the total quantity that will be in the cart after the addition
        let newQuantity = 1; // Start with adding one item
        if (existingItem) {
            newQuantity = existingItem.quantity + 1;
        }

        // Check if adding the new item will exceed the available stock
        if (newQuantity > book.qty) {
            return res.status(400).json({ message: `Only ${book.qty} of ${book.title} available in stock.` });
        }

        // Add or update the item in the cart
        if (existingItem) {
            existingItem.quantity = newQuantity;
        } else {
            cart.items.push({ bookId: bookId, quantity: 1, price: book.price });
        }

        // Recalculate the total amount in the cart
        cart.totalAmount = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        // Save the updated cart in the database
        await cart.save();

        // Calculate the total quantity of items in the cart
        const cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);

        // Store the cart count in the session
        req.session.cartCount = cartCount;

        // Send the cart count back to the client
        res.json({ cartCount: cartCount });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'There was an error adding the item to the cart' });
    }
});

// Route to remove an item from the cart
router.post('/remove', async (req, res) => {
    const { bookId } = req.body;

    try {
        const userId = req.session.user ? req.session.user._id : null;
        const sessionId = req.sessionID;

        let cart = userId 
            ? await Cart.findOne({ userId }) 
            : await Cart.findOne({ sessionId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.bookId.toString() !== bookId);
        cart.totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

        await cart.save();
        res.json({ success: true, cart });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Error removing cart item' });
    }
});


module.exports = router;