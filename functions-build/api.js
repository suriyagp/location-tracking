const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
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
const router = express.Router();

router.post('/locations', async (req, res) => {
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

router.get('/locations/:username', async (req, res) => {
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

router.get('/users/check/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await Location.findOne({ username }).exec();
    res.json({ exists: !!user });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username' });
  }
});

app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app);
