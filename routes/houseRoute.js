import express from "express";
import { checkAuthenticationHost } from "../middlewares/checkAuth.js";
import houseController from "../controllers/houseController.js";

const router = express.Router();

router.get("/house/get-all/:page/:limit", houseController.getAllHouseStay);

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

export default router;
