const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // MUST be at the top
const cors = require('cors');

const app = express();

// Middleware
// Configure CORS: in development allow any origin (useful when frontend runs on different port), otherwise restrict
// Allow all origins in development so e.g. CRA's dynamic port works; in production rely on CORS_ORIGIN env
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: true }));
} else {
  app.use(cors({ origin: process.env.CORS_ORIGIN }));
}
app.use(express.json());

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addOnsRoutes = require('./routes/addOnsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addOns', addOnsRoutes);

// Root route for testing in browser
app.get('/', (req, res) => {
  res.send('🌸 Flower Shop API is running!');
});

// Global error handler for debugging
app.use((err, req, res, next) => {
  console.error('[Global Error Handler] Error:', err);
  res.status(500).json({ message: 'Unexpected server error', error: err.message });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the other process or set PORT env var.`);
    process.exit(1);
  }
  console.error('Server error', err);
});
