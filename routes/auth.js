/**
 * Project name: Task Manager with User Authentication
 * File: authentication from routes which will do the routing for authentication
 * Author: Shahriar Muktadir
 * Description: This is a task manager app used by mongoDB and env files mid level project
 * Date: 23.03.2026
 */

// dependencies
const express = require('express');
const router = express.Router(); // router = express.Router() – এটি একটি মিনি-অ্যাপ। 
// এখানে আমরা শুধু /api/auth-এর অধীনে আসা রিকোয়েস্টগুলো হ্যান্ডেল করব।
const User = require('../models/User.js');

// Register
router.post('/register', async (req, res) => {
    try {
        // First, extract the data sent by the client
        const { username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields required' });
        }

        // Check if a user with this username or email already exists
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Create a new user document (password will be hashed automatically by the pre('save') hook)
        const user = new User({ username, email, password });
        await user.save(); // save to database

        // Set session – auto‑login after registration
        req.session.userId = user._id;

        // Send success response (201 Created)
        res.status(201).json({
            message: 'User created',
            user: { id: user._id, username, email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare the provided password with the stored hash
        const isMatch = await user.comparePassword(password); // ✅ correct: pass plain string, not an object
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Store user id in session
        req.session.userId = user._id;

        res.json({
            message: 'Logged in',
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Could not log out' });
        res.json({ message: 'Logged out' });
    });
});

// Get current user (check session)
router.get('/me', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const user = await User.findById(req.session.userId).select('-password'); // exclude password field
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Exports
module.exports = router;