/**
 * Role-Based Authorization Middleware
 * Accepts an array of allowed roles and checks if the authenticated user has one
 * Must be used AFTER the auth middleware
 * 
 * Usage: roleAuth('admin', 'mentor')
 */
const roleAuth = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

module.exports = roleAuth;
