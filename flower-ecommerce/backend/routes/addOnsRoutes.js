// routes/addOnsRoutes.js
const express = require('express');
const router = express.Router();
const AddOn = require('../models/Addon');

// Create new add-on
router.post('/', async (req, res) => {
  try {
    const addOn = await AddOn.create(req.body);
    res.status(201).json(addOn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all add-ons
router.get('/', async (req, res) => {
  try {
    const addOns = await AddOn.find();
    res.json(addOns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get add-on by ID
router.get('/:id', async (req, res) => {
  try {
    const addOn = await AddOn.findById(req.params.id);
    if (!addOn) return res.status(404).json({ message: 'Add-on not found' });
    res.json(addOn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update add-on
router.put('/:id', async (req, res) => {
  try {
    const addOn = await AddOn.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!addOn) return res.status(404).json({ message: 'Add-on not found' });
    res.json(addOn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete add-on
router.delete('/:id', async (req, res) => {
  try {
    const addOn = await AddOn.findByIdAndDelete(req.params.id);
    if (!addOn) return res.status(404).json({ message: 'Add-on not found' });
    res.json({ message: 'Add-on deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
