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

router.patch(
  "/booking/update-completed-status/:bookingID/:hostID",
  checkAuthenticationHost,
  bookingController.updateCompletedStatusBooking
);

router.patch(
  "/booking/cancel/:bookingID/:paymentID",
  checkAuthentication,
  bookingController.cancelBookingByCustomer
);

router.get(
  "/booking/get-all/:customerID",
  checkAuthenticationHost,
  bookingController.getAllReservation
);

router.get(
  "/booking/get-all/completed/:customerID",
  checkAuthenticationHost,
  bookingController.getAllCompletedReservation
);

router.get(
  "/booking/get-all/canceled/:customerID",
  checkAuthenticationHost,
  bookingController.getAllCancelledReservation
);

router.get(
  "/booking/get-all/pendding/:customerID",
  checkAuthenticationHost,
  bookingController.getAllPenddingReservation
);

router.get(
  "/booking/customer/get-all/:customerID",
  checkAuthentication,
  bookingController.getAllBookingByCustomer
);

export default router;
