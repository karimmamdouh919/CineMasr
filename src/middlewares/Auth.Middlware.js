import jwt from 'jsonwebtoken';

// NOTE: This must match the token shape produced by the Auth module (Backend 1).
// Expected payload: { id, role }. Coordinate with your teammate so both sides
// use the exact same JWT_SECRET and payload fields (id + role).

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    next(error);
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // if (!req.user || !roles.includes(req.user.role)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'You do not have permission to perform this action'
    //   });
    // }

    next();
  };
};