import express from "express";
import {
  checkAuthentication,
  checkAuthenticationHost,
} from "../middlewares/checkAuth.js";
import houseController from "../controllers/houseController.js";

const router = express.Router();

router.get("/house/get-all", houseController.getAllHouseStay);
router.get(
  "/house/get-all/:hostID",
  checkAuthenticationHost,
  houseController.getHouseCreatedByHost
);

router.delete(
  "/house/delete/:hostID/:houseID",
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
  "/house/:houseID/:customerID/rating",
  checkAuthentication,
  houseController.ratingHouse
);

export default router;
