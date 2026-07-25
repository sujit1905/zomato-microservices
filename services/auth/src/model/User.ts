import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  role: string;
  password?: string;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}

const schema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", schema);
export default User;
