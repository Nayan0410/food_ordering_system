import jwt from "jsonwebtoken";

export const verifyVendorJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.vendor = decoded; // stores vendor id and role for later
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
