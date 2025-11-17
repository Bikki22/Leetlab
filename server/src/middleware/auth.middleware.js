import { db } from "../libs/db.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.Authorization.Headers;

    if (!token) {
      res.status(401).json({
        message: "Unauthorized - No token Provided",
      });
    }

    let decoded;

    try {
      decoded = await jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "UnAuthorized ",
      });
    }

    const user = await db.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        image: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authenticating user", error);
    res.status(500).json({ message: "Error in authenticating user" });
  }
};
