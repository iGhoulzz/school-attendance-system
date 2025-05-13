// authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No Authorization header found');
      return res.status(401).json({ message: 'Authentication failed!' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received:', token);

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decodedToken);

    req.userId = decodedToken.userId;
    req.role = decodedToken.role;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Authentication failed!' });
  }
};

module.exports = authMiddleware;

