import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpired: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
    image: {
      type: String,
      default:
        'https://i.ibb.co.com/gbVvwDHp/360-F-724597608-pmo5-Bs-Vum-Fc-Fy-HJKl-ASG2-Y2-Kpkkfi-YUU.jpg',
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("Users", userSchema)