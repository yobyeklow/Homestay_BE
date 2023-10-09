import express from "express";
import {
  checkAuthentication,
  checkAuthenticationHost,
} from "../middlewares/checkAuth.js";
import bookingController from "../controllers/bookingController.js";

const router = express.Router();
router.post(
  "/booking/:customerID/:houseID",
  checkAuthentication,
  bookingController.bookingHouseStay
);

router.post(
  "/booking/:bookingID",
  checkAuthenticationHost,
  bookingController.bookingHouseStay
);

export default router;
