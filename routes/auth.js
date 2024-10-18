const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const Cart = require('../models/Cart');

// Render the registration page
router.get('/register', (req, res) => {
    res.render('register', { error: null });  // Always pass error as null if there's no error
});


// Handle registration form submission
router.post('/register', async (req, res) => {
    const { firstname, lastname, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render('register', { error: 'Passwords do not match.' });
    }

    try {
        // Check if email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { error: 'Email is already registered.' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role: 'user'
        });

        // Save the user in the database
        await newUser.save();

        // Merge guest cart with user cart
        if (req.session.cartId) {
            const guestCart = await Cart.findOne({ sessionId: req.session.cartId });

            if (guestCart) {
                // Check if the user already has a cart
                let userCart = await Cart.findOne({ userId: newUser._id });

                if (!userCart) {
                    // If the user doesn't have a cart, create one
                    userCart = new Cart({
                        userId: newUser._id,
                        items: [],
                        totalAmount: 0
                    });
                }

                // Merge guest cart items with the user cart
                guestCart.items.forEach(guestItem => {
                    const existingItem = userCart.items.find(item => item.bookId.equals(guestItem.bookId));

                    if (existingItem) {
                        // If the item already exists in the user cart, update quantity and price
                        existingItem.quantity += guestItem.quantity;
                    } else {
                        // Otherwise, add the new item from the guest cart
                        userCart.items.push(guestItem);
                    }
                });

                // Update the total amount
                userCart.totalAmount += guestCart.totalAmount;

                // Save the updated user cart and delete the guest cart
                await userCart.save();
                await guestCart.remove();

                // Clear the session cart ID
                delete req.session.cartId;
            }
        }

        // Set session for the user and redirect to the homepage
        req.session.user = newUser;
        return res.redirect('/');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Server error');
    }
});

// Render the login page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        // Merge guest cart with user cart
        if (req.session.cartId) {
            const guestCart = await Cart.findOne({ sessionId: req.session.cartId });

            if (guestCart) {
                let userCart = await Cart.findOne({ userId: user._id });

                if (!userCart) {
                    userCart = new Cart({
                        userId: user._id,
                        items: [],
                        totalAmount: 0
                    });
                }

                // Merge guest cart items with the user cart
                guestCart.items.forEach(guestItem => {
                    const existingItem = userCart.items.find(item => item.bookId.equals(guestItem.bookId));
                    if (existingItem) {
                        existingItem.quantity += guestItem.quantity;
                    } else {
                        userCart.items.push(guestItem);
                    }
                });

                // Update totalAmount and save
                userCart.totalAmount += guestCart.totalAmount;
                await userCart.save();
                await guestCart.remove();

                delete req.session.cartId;
            }
        }

        // Calculate cartCount for the user
        const userCart = await Cart.findOne({ userId: user._id });
        const cartCount = userCart ? userCart.items.reduce((total, item) => total + item.quantity, 0) : 0;
        
        // Store cartCount in session
        req.session.cartCount = cartCount;
        
        // Set session user and redirect
        req.session.user = user;
        req.session.userRole = user.role;
        if (user.role === 'admin') {
            return res.redirect('/book');
        } else if (user.role === 'user') {
            return res.redirect('/');
        } else {
            return res.status(403).send('Unauthorized'); // Unauthorized for unknown roles
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error');
    }
});



// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
