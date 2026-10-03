import jwt from "jsonwebtoken";

// Creates a signed JWT for the given user id + role.
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Sends the JWT both as an httpOnly cookie and in the JSON body,
// and returns a safe (no password) copy of the user.
export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  const cookieExpireDays = Number(process.env.JWT_COOKIE_EXPIRE) || 30;
  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const safeUser = user.toObject();
  delete safeUser.password;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user: safeUser,
  });
};

export default generateToken;
