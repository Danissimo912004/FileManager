import { Router } from 'express';
import { adminMiddleware } from '../middleware/admin.middleware';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const adminController = new AdminController();

router.use(adminMiddleware);

// User management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Statistics
router.get('/stats', adminController.getStats);
router.get('/logs', adminController.getLogs);

export { router as adminRouter }; 