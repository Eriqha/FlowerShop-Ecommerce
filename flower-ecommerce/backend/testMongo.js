const mongoose = require('mongoose');
require('dotenv').config(); 

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected!'))
.catch(err => console.error('Connection Error:', err.message));
