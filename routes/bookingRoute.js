import express from "express";
import { checkAuthentication } from "../middlewares/checkAuth.js";
import bookingController from "../controllers/bookingController.js";

const router = express.Router();
router.post(
  "/booking/:customerID/:houseID",
  checkAuthentication,
  bookingController.bookingHouseStay
);

export default router;
