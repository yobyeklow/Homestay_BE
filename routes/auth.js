import express from 'express';
import authController from '../controllers/authController.js';
import middlewareController from '../controllers/middlewareController.js';

const router = express.Router();


router.post("/auth/customer/register", authController.registerCustomer);
router.post("/auth/customer/login", authController.loginCustomer);
router.post("/auth/refreshToken", authController.refreshToken);
router.post("/auth/logout", middlewareController.verifyToken, authController.logout);

export default router