const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
    try {
        const order = await Order.create({
            ...req.body,
            user: req.user._id
        });
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId }).populate('items.product');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
