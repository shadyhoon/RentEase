// Use after verifyToken. Restricts access by role. Pass allowed roles: e.g. authorizeRole('tenant')
function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Access denied. Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission for this resource.',
      });
    }
    next();
  };
}

module.exports = authorizeRole;
