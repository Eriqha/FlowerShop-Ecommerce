const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register user
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body; // add role
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, role }); // save role
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ 
            user: { 
                _id: user._id,
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role // include role in response
            }, 
            token 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ 
            user: { 
                _id: user._id,
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role // include role
            }, 
            token 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
