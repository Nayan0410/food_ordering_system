import jwt from "jsonwebtoken";

export const verifyVendorJWT = (req, res, next) => {
  const authHeader = req.headers.authorization; // ✅ always lowercase in Node

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Security fix: check role
    if (!decoded || decoded.role !== "vendor") {
      return res.status(401).json({ message: "Unauthorized: Invalid role" });
    }

    req.vendor = decoded; // { id, role }
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};
