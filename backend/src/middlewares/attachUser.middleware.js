const { getProfileByUserId } = require("../services/auth.service");

const attachUser = async (req, res, next) => {
  try {
    const userId = req.auth?.id || req.auth?.userId || req.auth?.sub;
    if (!userId) return res.status(401).json({ error: "Missing sub in token" });

    const found = await getProfileByUserId(userId);
    if (!found) {
      return res
        .status(403)
        .json({ error: "User has no profile (driver/mechanic/admin)" });
    }

    req.user = {
      id: userId,
      email: req.auth.email,
      role: found.role,
      profile: found.profile,
    };

    return next();
  } catch (e) {
    return res.status(500).json({ error: "Failed to load profile" });
  }
}

module.exports = {
  attachUser
}