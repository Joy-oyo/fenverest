require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db'); // Import the DB connection

connectDB(); // Connect to the database

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // Middleware to parse JSON bodies

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});