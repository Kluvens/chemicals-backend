const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const users = require('./routes/api/users');

const app = express();

// Connect Database
connectDB();

app.use(cors({ origin: true, credentials: true }));

// Init Middleware
app.use(express.json({ extended: false }));

// use Routes
app.use('/api/users', users);

const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));