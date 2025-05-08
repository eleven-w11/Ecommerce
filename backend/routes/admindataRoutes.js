const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// Fetch user by ID
router.get('/data', async (req, res) => {
    try {
        const user = await User.find({}, { name: 1, email: 1, password: 1 });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

router.get('/data/:id', async (req, res) => {
    try {
        console.warn("userdataRoutes say's id = ", req.params.id);

        const user = await User.findById(req.params.id, { name: 1, email: 1, password: 1 }); // Find user by ID
        if (!user) {
            return res.status(404).json({ error: 'User not found' }); // If user not found
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("Error fetching user by ID:", err);
        res.status(500).json({ error: 'Failed to fetch user data' }); // Handle server error
    }
});

// PUT Route for updating user data
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    console.warn("admin Routes.js", req.body);

    console.warn("id name email", req.params.id, req.body.name, req.body.email);


    try {
        const user = await User.findByIdAndUpdate(
            id,
            { name, email },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update user' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: 'route Failed to delete user' });
    }
});
module.exports = router;
