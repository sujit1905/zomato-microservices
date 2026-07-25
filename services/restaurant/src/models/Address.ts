import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  userId: string;
  mobile: number;
  formattedAddress: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  title?: string;
  houseNumber?: string;
  apartment?: string;
  landmark?: string;
  pinCode?: string;
  city?: string;
  area?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IAddress>(
  {
    userId: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    formattedAddress: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    title: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    houseNumber: {
      type: String,
      default: "",
    },
    apartment: {
      type: String,
      default: "",
    },
    landmark: {
      type: String,
      default: "",
    },
    pinCode: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    area: {
      type: String,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ location: "2dsphere" });

export default mongoose.model<IAddress>("Address", schema);
