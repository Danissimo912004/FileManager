import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserAttributes } from '../models/User';
import { JWT_SECRET, JWT_EXPIRES_IN, ACCESS_COOKIE_MAX_AGE, REFRESH_COOKIE_MAX_AGE } from '../config/constants';
import { TokenService } from '../services/tokenService';
import { AppError } from '../middleware/error.middleware';
import { LoginCredentials, RegisterData } from '../types/auth';

export interface JWTPayload {
  id: string;
  username: string;
  isAdmin: boolean;
}

export const authController = {
  async login(req: Request<{}, {}, LoginCredentials>, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const user = await User.findOne({ where: { username } });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await user.comparePassword(password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const tokenPayload: JWTPayload = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      };

      const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.cookie('access_token', accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: ACCESS_COOKIE_MAX_AGE
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFRESH_COOKIE_MAX_AGE
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        },
        token: accessToken
      });
    } catch (error) {
      res.status(500).json({ message: 'Error during login' });
    }
  },

  async register(req: Request<{}, {}, RegisterData>, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const existingUser = await User.findOne({ where: { username } });

      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const user = await User.create({
        username,
        password,
        isAdmin: false,
      } as UserAttributes);

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error during registration' });
    }
  },

  async logout(req: Request, res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.json({ message: 'Logged out successfully' });
  },

  async me(req: Request, res: Response) {
    try {
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  }
}; 
