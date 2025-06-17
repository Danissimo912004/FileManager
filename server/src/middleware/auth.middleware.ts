import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';
import { RequestHandler } from 'express';
import { TokenService } from '../services/tokenService';
import { User, UserModel } from '../models/User';
import { AppError } from './error.middleware';
import { AuthRequest, TokenPayload } from '../types/auth';

export const authMiddleware: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const token = TokenService.getTokenFromRequest(req);
    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    const payload = TokenService.verifyToken(token) as TokenPayload;
    const user = await User.findByPk(payload.id);

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    req.user = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    };
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'Invalid token'));
    }
  }
};

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Admin access required' });
  }
}; 
