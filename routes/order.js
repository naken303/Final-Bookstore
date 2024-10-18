const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');

router.get('/order', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Ensure user is logged in
    }

    try {
        // Find the logged-in user's orders
        const orders = await Order.find({ userId: req.session.user._id });

        res.render('orderHistory', {
            orders, // Pass the orders to the template
            cartCount: req.session.cartCount || 0,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).send('Server error');
    }
});


module.exports = router;
