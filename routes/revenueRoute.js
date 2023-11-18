import express from "express";
import { checkAuthenticationHost } from "../middlewares/checkAuth.js";
import revenueController from "../controllers/revenueController.js";

const router = express.Router();

router.get(
  "/revenue/get-by-month/:customerID/:year/:month",
  checkAuthenticationHost,
  revenueController.getByMonth
);

router.get(
  "/revenue/get-by-year/:customerID/:year",
  checkAuthenticationHost,
  revenueController.getByYear
);

router.get(
  "/revenue/from-the-start-date-to-end-date/:customerID",
  checkAuthenticationHost,
  revenueController.getAllRevenueFromTheStartDateToEndDate
);

export default router;
