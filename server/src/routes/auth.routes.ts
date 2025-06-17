import { Router, RequestHandler } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post('/login', authController.login as RequestHandler);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post('/register', authController.register as RequestHandler);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 */
router.post('/logout', authMiddleware as RequestHandler, authController.logout as RequestHandler);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 */
router.get('/me', authMiddleware as RequestHandler, authController.me as RequestHandler);

export const authRouter = router; 
