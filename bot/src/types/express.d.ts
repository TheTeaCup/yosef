import "express";

declare global {
  namespace Express {
    interface Request {
      user?: any; // or a proper JWT payload type
    }
  }
}