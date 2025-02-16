const User = require("../Models/authUserModel");

function authorizeRole(role) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);  // Assuming req.user is set by authMiddleware

      if (!user) {
        return res.sendStatus(404); // User not found
      }

      if (user.role !== role) {
        return res.sendStatus(403); // Forbidden if user does not have the required role
      }

      next();  // Proceed if the user has the correct role
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  };
}

module.exports = authorizeRole;
