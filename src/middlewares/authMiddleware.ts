import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: "Token inválido" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch (error) {
     return res.status(401).json({ error: "Token inválido" });
  }
}
