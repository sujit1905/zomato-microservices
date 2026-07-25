import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from "axios";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getTransporter } from "../config/nodemailer.js";

export const loginUser = TryCatch(async (req, res) => {
// ... existing loginUser code
// (I will retain the full body below to avoid breaking anything)
   console.log("Request body:", req.body);
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      message: "Authorization code is required",
    });
  }

  const googleRes = await oauth2client.getToken(code);

  oauth2client.setCredentials(googleRes.tokens);

  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
  );
  const { email, name, picture } = userRes.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });

  res.status(200).json({
    message: "Logged Success",
    token,
    user,
  });
});

const allowedRoles = ["customer", "rider", "seller"] as const;
type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
  console.log("addUserRole req.user:", req.user);
  console.log("addUserRole req.body:", req.body);

  if (!req.user?._id) {
    console.log("addUserRole failed: req.user._id is missing!");
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { role } = req.body as { role: Role };

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ _id: req.user._id }, { email: req.user.email }],
  });

  if (!existingUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const user = await User.findByIdAndUpdate(
    existingUser._id,
    { role },
    { returnDocument: "after" }
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });

  res.json({ user, token });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  res.json(user);
});

// New Email & Password Handlers
export const registerUser = TryCatch(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please provide name, email and password",
    });
  }

  // Password validation: min 8 characters
  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long",
    });
  }

  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({
      message: "User already exists with this email",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashedPassword,
    image: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  });

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });

  res.status(201).json({
    message: "Registered Successfully",
    token,
    user,
  });
});

export const loginUserEmail = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide email and password",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  if (!user.password) {
    return res.status(400).json({
      message: "This account was created with Google login. Please sign in using Google.",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });

  res.status(200).json({
    message: "Logged Success",
    token,
    user,
  });
});

export const forgotPassword = TryCatch(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Please provide email",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "No user found with this email",
    });
  }

  // Generate random token
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

  await user.save();

  // Create reset link
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    to: user.email,
    subject: "Zomato - Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #E23744; font-weight: bold;">Zomato</h2>
        <p>You requested a password reset. Click the button below to choose a new password. This link is valid for 1 hour.</p>
        <div style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #E23744; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #6b7280; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  const transporter = getTransporter();
  await transporter.sendMail(mailOptions);

  res.status(200).json({
    message: "Password reset link sent to your email",
    resetToken, // Returned for dev fallback testing
  });
});

export const resetPassword = TryCatch(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      message: "Please provide a new password",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long",
    });
  }

  const user = await User.findOne({
    resetPasswordToken: String(token),
    resetPasswordExpires: { $gt: new Date() }
  } as any);

  if (!user) {
    return res.status(400).json({
      message: "Invalid or expired password reset token",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  res.status(200).json({
    message: "Password reset successful! You can now log in with your new password.",
  });
});

export const changePassword = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userReq = req.user;
  if (!userReq?._id) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { oldPassword, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({
      message: "Please provide a new password",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      message: "New password must be at least 8 characters long",
    });
  }

  const user = await User.findById(userReq._id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // If user has a password set, verify the old one
  if (user.password) {
    if (!oldPassword) {
      return res.status(400).json({
        message: "Old password is required",
      });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect old password",
      });
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    message: "Password changed successfully",
  });
});
