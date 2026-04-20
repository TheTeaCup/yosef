import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.body?.token;

  if (!token) {
    return res.status(401).json({ error: true, message: "Not Authorized" });
  }

  try {
    req.user = jwt.verify(token, config.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: true, message: "Not Authorized" });
  }
}
