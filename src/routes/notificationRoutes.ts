import { Router } from "express"
import { authMiddleware } from "../middlewares/authMiddleware"
import {createNotification, getNotifications, markAsRead} from "../controllers/notificationController"

const router = Router();

router.post('/', authMiddleware, createNotification);
router.get('/', authMiddleware, getNotifications);
router.put('/:id', authMiddleware, markAsRead);

export default router;