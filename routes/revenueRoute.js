import express from "express";
import {
  checkAuthentication,
  checkAuthenticationHost,
} from "../middlewares/checkAuth.js";
import revenueController from "../controllers/revenueController.js";

const router = express.Router();

router.get(
  "/revenue/get-by-month/:year/:month",
  checkAuthenticationHost,
  revenueController.getByMonth
);

router.get(
  "/revenue/get-by-year/:year",
  checkAuthenticationHost,
  revenueController.getByYear
);

export default router;
