const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.render('users', { users })
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Server Error');
    }
})

router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.query;

        const users = await User.find({
            $or: [
                { firstname: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search
                { lastname: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ]
        });

        res.json(users); // Send the filtered users as JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Route to get user details for editing
router.get('/:id/edit', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user); // Send the user data as JSON for the frontend to populate the form
    } catch (err) {
        console.error('Error fetching user:', err.message);
        res.status(500).send('Server error');
    }
});

// Route to handle editing an existing user
router.post('/:id/edit', async (req, res) => {
    const userId = req.params.id;

    try {
        const { firstname, lastname, email, role } = req.body;

        // Find the user by ID and update their details
        const user = await User.findByIdAndUpdate(userId, {
            firstname,
            lastname,
            email,
            role
        }, { new: true });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Redirect back to the user list
        res.redirect('/user');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Server error');
    }
});

// Route to delete a user by ID
router.delete('/:id/delete', async (req, res) => {
    const userId = req.params.id;

    try {
        // Find the user by ID and delete it
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with a success message
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
