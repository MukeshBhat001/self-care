import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, age, gender } = req.body;
        console.log('Registration attempt for:', email);

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user - password will be hashed by the pre-save hook
        const user = new User({
            username,
            email,
            password,
            age: age || undefined,
            gender: gender || undefined
        });

        await user.save();
        console.log('User registered successfully:', email);

        // Create JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                age: user.age,
                gender: user.gender
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

       

        console.log('Login successful for:', email);

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                age: user.age,
                gender: user.gender
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Error during login' });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const user = await User.findById(userId).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { username, email, age, gender } = req.body;
        
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.age = age || user.age;
        user.gender = gender || user.gender;

        await user.save();

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            age: user.age,
            gender: user.gender
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            age: user.age,
            gender: user.gender
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
