import express from "express";
import { checkAuthenticationHost } from "../middlewares/checkAuth.js";
import houseController from "../controllers/houseController.js";

const router = express.Router();
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
