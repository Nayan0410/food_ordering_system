import jwt from "jsonwebtoken";

export default function authCustomer(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded should contain { id, role } if we sign like below
    if (!decoded || decoded.role !== "customer") {
      return res.status(401).json({ message: "Unauthorized - invalid token" });
    }
    req.customerId = decoded.id;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized - token invalid or expired" });
  }
}
