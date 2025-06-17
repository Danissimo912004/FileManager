import { RequestHandler } from 'express';
import { AuthRequest } from '../types/auth';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.config';
import { JWTPayload } from '../controllers/auth.controller';
import { ACCESS_COOKIE_MAX_AGE } from '../config/constants';

export const adminMiddleware: RequestHandler = (req: AuthRequest, res, next) => {
  try {
    let accessToken = req.headers.authorization?.split(' ')[1];
    const refreshToken = req.cookies?.refresh_token;

    if (!accessToken) {
        if (!refreshToken) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const payload = jwt.verify(refreshToken, JWT_SECRET) as JwtPayload;
        delete payload.iat;
        delete payload.exp;

        accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('access_token', accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: ACCESS_COOKIE_MAX_AGE
        });
    }

    const decoded = jwt.verify(accessToken, JWT_SECRET);
    if (!(decoded as JWTPayload).isAdmin) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    res.locals.user = decoded as JWTPayload;
    next();
  } catch (error) {
    next(error);
  }
}; 
