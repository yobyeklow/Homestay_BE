import express from "express";
import {
  checkAuthentication,
  checkAuthenticationHost,
} from "../middlewares/checkAuth.js";
import hostController from "../controllers/hostController.js";

const router = express.Router();

router.patch(
  "/host/:customerID/host-become",
  checkAuthentication,
  hostController.registerBecomeHost
);

router.patch(
  "/host/:hostID/update-payment",
  checkAuthenticationHost,
  hostController.updatePaymentInfoForHost
);

export default router;
