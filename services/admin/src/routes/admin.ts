import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  getPendingRestaurant,
  getPendingRiders,
  verifyRestaurant,
  verifyRider,
  getStats,
  getAllUsers,
  getAllOrders,
} from "../controllers/admin.js";

const router = express.Router();

router.get("/admin/restaurant/pending", isAuth, isAdmin, getPendingRestaurant);
router.get("/admin/rider/pending", isAuth, isAdmin, getPendingRiders);
router.patch("/verify/rider/:id", isAuth, isAdmin, verifyRider);
router.patch("/verify/restaurant/:id", isAuth, isAdmin, verifyRestaurant);
router.get("/admin/stats", isAuth, isAdmin, getStats);
router.get("/admin/users", isAuth, isAdmin, getAllUsers);
router.get("/admin/orders", isAuth, isAdmin, getAllOrders);

export default router;
