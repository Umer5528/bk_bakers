import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";

// Verifies the JWT (from the Authorization header or the httpOnly cookie)
// and attaches the authenticated user to req.user. Every protected route,
// customer or admin, must run through this first — the frontend route
// guard is a UX convenience only, never the real security boundary.
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, please log in");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "Not authorized, user no longer exists");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated");
  }

  req.user = user;
  next();
});

// For routes that must stay public (the storefront's own browsing) but
// that show more to a logged-in admin (e.g. including hidden/inactive
// items in the admin panel's own list). Unlike protect(), this never
// blocks the request — no token, an expired token, or a deleted user
// all just fall through as an anonymous visitor. Only use this on read
// routes; anything that changes data must still use protect()+authorize().
export const identify = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    } catch {
      // Invalid/expired token on an otherwise-public route — proceed
      // as an anonymous visitor rather than failing the request.
    }
  }

  next();
});

// Role gate. Usage: authorize("admin") or authorize("admin", "customer").
// Must run after protect(). Every admin-only operation in this system
// must be enforced here on the backend, never only hidden in the UI.
//
// "superadmin" (the developer/owner account) always satisfies an
// authorize("admin") check — it's a superset role, not a sibling one —
// so every admin route in this app is automatically superadmin-accessible
// too. Use authorize("superadmin") on its own for anything that should be
// off-limits even to regular admins (e.g. managing admin accounts).
export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    const permitted =
      !!userRole &&
      (roles.includes(userRole) ||
        (roles.includes("admin") && userRole === "superadmin"));

    if (!permitted) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action"
      );
    }
    next();
  };
};
