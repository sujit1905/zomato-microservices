import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Address from "../models/Address.js";

export const addAddress = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const {
    mobile,
    formattedAddress,
    latitude,
    longitude,
    title,
    houseNumber,
    apartment,
    landmark,
    pinCode,
    city,
    area,
    isDefault,
  } = req.body;

  if (
    !mobile ||
    !formattedAddress ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return res.status(400).json({
      message: "Please give all required fields",
    });
  }

  const userIdStr = user._id.toString();

  // If this address is set to default, or if it is the first address, update others.
  const addressCount = await Address.countDocuments({ userId: userIdStr });
  const shouldBeDefault = isDefault || addressCount === 0;

  if (shouldBeDefault) {
    await Address.updateMany({ userId: userIdStr }, { isDefault: false });
  }

  const newAddress = await Address.create({
    userId: userIdStr,
    mobile: Number(mobile),
    formattedAddress,
    location: {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    },
    title: title || "Home",
    houseNumber: houseNumber || "",
    apartment: apartment || "",
    landmark: landmark || "",
    pinCode: pinCode || "",
    city: city || "",
    area: area || "",
    isDefault: shouldBeDefault,
  });

  res.json({
    message: "Address Added successfully",
    address: newAddress,
  });
});

export const editAddress = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { id } = req.params;
  const {
    mobile,
    formattedAddress,
    latitude,
    longitude,
    title,
    houseNumber,
    apartment,
    landmark,
    pinCode,
    city,
    area,
    isDefault,
  } = req.body;

  const address = await Address.findOne({ _id: String(id), userId: user._id.toString() } as any);
  if (!address) {
    return res.status(404).json({
      message: "Address not found",
    });
  }

  if (mobile !== undefined) address.mobile = Number(mobile);
  if (formattedAddress !== undefined) address.formattedAddress = formattedAddress;
  if (latitude !== undefined && longitude !== undefined) {
    address.location = {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    };
  }
  if (title !== undefined) address.title = title;
  if (houseNumber !== undefined) address.houseNumber = houseNumber;
  if (apartment !== undefined) address.apartment = apartment;
  if (landmark !== undefined) address.landmark = landmark;
  if (pinCode !== undefined) address.pinCode = pinCode;
  if (city !== undefined) address.city = city;
  if (area !== undefined) address.area = area;

  if (isDefault) {
    await Address.updateMany({ userId: user._id.toString() }, { isDefault: false });
    address.isDefault = true;
  }

  await address.save();

  res.json({
    message: "Address updated successfully",
    address,
  });
});

export const setDefaultAddress = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { id } = req.params;

  const address = await Address.findOne({ _id: String(id), userId: user._id.toString() } as any);
  if (!address) {
    return res.status(404).json({
      message: "Address not found",
    });
  }

  await Address.updateMany({ userId: user._id.toString() }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  res.json({
    message: "Default address set successfully",
    address,
  });
});

export const deleteAddress = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "id is required",
      });
    }

    const address = await Address.findOne({
      _id: id,
      userId: user._id.toString(),
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    await address.deleteOne();

    res.json({
      message: "Address deleted Successfully",
    });
  }
);

export const getMyAddresses = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const addresses = await Address.find({
      userId: user._id.toString(),
    }).sort({ createdAt: -1 });

    res.json(addresses);
  }
);
