import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addAddress,
  deleteAddress,
  getMyAddresses,
  editAddress,
  setDefaultAddress,
} from "../controllers/address.js";

const router = express.Router();

router.post("/new", isAuth, addAddress);
router.put("/:id", isAuth, editAddress);
router.put("/:id/default", isAuth, setDefaultAddress);
router.delete("/:id", isAuth, deleteAddress);
router.get("/all", isAuth, getMyAddresses);

export default router;
