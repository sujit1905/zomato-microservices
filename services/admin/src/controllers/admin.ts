import { ObjectId } from "mongodb";
import TryCatch from "../middlewares/trycatch.js";
import {
  getRestaurantCollection,
  getRiderCollection,
  getUserCollection,
  getOrderCollection,
} from "../util/collection.js";

export const getPendingRestaurant = TryCatch(async (req, res) => {
  const restaurants = await (await getRestaurantCollection())
    .find({ isVerified: false })
    .toArray();

  res.json({
    count: restaurants.length,
    restaurants,
  });
});

export const getPendingRiders = TryCatch(async (req, res) => {
  const riders = await (await getRiderCollection())
    .find({ isVerified: false })
    .toArray();

  res.json({
    count: riders.length,
    riders,
  });
});

export const verifyRestaurant = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "invalid restaurant id",
    });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid object id",
    });
  }

  const result = await (
    await getRestaurantCollection()
  ).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      message: "Restaurant not found",
    });
  }

  res.json({
    message: "Restaurant verified successfully",
  });
});

export const verifyRider = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "invalid rider id",
    });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid object id",
    });
  }

  const result = await (
    await getRiderCollection()
  ).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      message: "rider not found",
    });
  }

  res.json({
    message: "rider verified successfully",
  });
});

// ─── Real Stats ───────────────────────────────────────────────────────────────
export const getStats = TryCatch(async (req, res) => {
  const [restaurantCount, riderCount, userCount, orderCount, revenueResult] =
    await Promise.all([
      (await getRestaurantCollection()).countDocuments(),
      (await getRiderCollection()).countDocuments(),
      (await getUserCollection()).countDocuments(),
      (await getOrderCollection()).countDocuments(),
      (await getOrderCollection())
        .aggregate([
          { $match: { status: { $nin: ["cancelled"] } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),
    ]);

  const totalRevenue = revenueResult[0]?.total ?? 0;

  res.json({
    restaurants: restaurantCount,
    riders: riderCount,
    users: userCount,
    orders: orderCount,
    revenue: totalRevenue,
  });
});

// ─── All Users ────────────────────────────────────────────────────────────────
export const getAllUsers = TryCatch(async (req, res) => {
  const page = Math.max(1, parseInt((req.query.page as string) || "1"));
  const limit = Math.min(50, parseInt((req.query.limit as string) || "10"));
  const search = (req.query.search as string) || "";
  const role = (req.query.role as string) || "";

  const filter: any = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role && role !== "all") filter.role = role;

  const col = await getUserCollection();
  const total = await col.countDocuments(filter);
  const users = await col
    .find(filter, { projection: { password: 0 } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  res.json({ total, page, limit, users });
});

// ─── All Orders ───────────────────────────────────────────────────────────────
export const getAllOrders = TryCatch(async (req, res) => {
  const page = Math.max(1, parseInt((req.query.page as string) || "1"));
  const limit = Math.min(50, parseInt((req.query.limit as string) || "10"));
  const search = (req.query.search as string) || "";
  const status = (req.query.status as string) || "";

  const filter: any = {};
  if (status && status !== "all") filter.status = status;

  const col = await getOrderCollection();
  const total = await col.countDocuments(filter);
  const orders = await col
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  res.json({ total, page, limit, orders });
});
