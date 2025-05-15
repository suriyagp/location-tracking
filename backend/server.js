const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist/demo')));

// Connect to MongoDB Atlas
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gps-tracker';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define MongoDB schema
const locationSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  accuracy: { type: Number }
});

const Location = mongoose.model('Location', locationSchema);

// API routes
app.post('/api/locations', async (req, res) => {
  try {
    const { username, latitude, longitude, timestamp, accuracy } = req.body;
    
    if (!username || !latitude || !longitude) {
      return res.status(400).json({ error: 'Username, latitude, and longitude are required' });
    }
    
    const location = new Location({
      username,
      latitude,
      longitude,
      timestamp: timestamp || new Date(),
      accuracy
    });
    
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({ error: 'Failed to save location data' });
  }
});

app.get('/api/locations/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const locations = await Location.find({ username })
      .sort({ timestamp: 1 })
      .limit(50)
      .exec();
    
    res.json({
      username,
      locations
    });
  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({ error: 'Failed to fetch location history' });
  }
});

app.get('/api/users/check/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await Location.findOne({ username }).exec();
    res.json({ exists: !!user });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username' });
  }
});

// Serve Angular app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/demo/browser/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});