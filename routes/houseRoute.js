import express from "express";
import {
  checkAuthentication,
  checkAuthenticationHost,
} from "../middlewares/checkAuth.js";
import houseController from "../controllers/houseController.js";

const router = express.Router();

router.get("/house/get-all", houseController.getAllHouseStay);
router.get("/house/favorites", houseController.getAllHouseStayFavorite);
router.get(
  "/house/get-all/:customerID",
  checkAuthenticationHost,
  houseController.getHouseCreatedByHost
);

router.delete(
  "/house/delete/:customerID/:houseID",
  checkAuthenticationHost,
  houseController.deleteHouseByHost
);

router.get(
  "/house/get-all-near-location",
  houseController.getAllHouseStayNearLocation
);

router.get("/house/filter/:page/:limit", houseController.filterHouseStay);
router.get("/house/:id", houseController.getHouseById);

router.post(
  "/house/post-house-stays/:customerID",
  checkAuthenticationHost,
  houseController.postHouseStay
);

router.patch(
  "/house/update-house-stay/:houseID",
  checkAuthenticationHost,
  houseController.updateHouseStay
);

router.post(
  "/house/:houseID/:customerID/:bookingID/rating",
  checkAuthentication,
  houseController.ratingHouse
);

export default router;
