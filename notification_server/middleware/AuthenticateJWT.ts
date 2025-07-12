import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";

interface AuthenticatedRequest extends Request {
  user?: { id: string }; // Extend Request with user field
}

dotenv.config();

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET not found");
}

const JWT_SECRET = process.env.JWT_SECRET;

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}