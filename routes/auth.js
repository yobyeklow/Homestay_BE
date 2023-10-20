import express from "express";
import authController from "../controllers/authController.js";
import { checkAuthentication } from "../middlewares/checkAuth.js";

const router = express.Router();

router.post("/auth/customer/register", authController.registerCustomer);
router.post("/auth/customer/login", authController.loginCustomer);
router.post("/auth/customer/refreshToken", authController.refreshToken);
router.post(
  "/auth/customer/logout",
  checkAuthentication,
  authController.logout
);

router.patch(
  "/auth/customer/:customerID/update",
  checkAuthentication,
  authController.updateInfoCustomer
);

router.patch(
  "/auth/customer/:customerID/update-payment",
  checkAuthentication,
  authController.updatePaymentForCustomer
);

router.get(
  "/auth/customer/:customerID",
  checkAuthentication,
  authController.getInfoCustomer
);

router.post(
  "/auth/customer/create-payment-intent",
  checkAuthentication,
  authController.createPaymentIntent
);

export default router;
