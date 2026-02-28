const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header',authHeader)

    if (!authHeader) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>


    const decoded = jwt.verify(token, 'Electronic-component');
    req.loginId = decoded.loginId;


    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
