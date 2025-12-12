const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

const isOrganizer = async (req, res, next) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ error: 'Access denied. Organizer role required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { auth, isOrganizer }; 