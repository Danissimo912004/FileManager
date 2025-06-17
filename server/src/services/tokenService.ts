import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../config/config';
import { TokenPayload } from '../types/auth';
import { AuthRequest } from '../types/auth';

export class TokenService {
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static setTokenCookie(res: Response, token: string): void {
    res.cookie('token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  static clearTokenCookie(res: Response): void {
    res.clearCookie('token', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  static getTokenFromRequest(req: AuthRequest): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const token = req.cookies?.token;
    if (token) {
      return token;
    }

    return null;
  }
} 
