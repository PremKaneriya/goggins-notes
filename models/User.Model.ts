import mongoose, { model, models } from "mongoose";

export interface MyUser {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  avatar: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  emailVerificationOTP?: string;
  emailVerificationOTPExpiry?: Date;
  isAccountDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema({
  avatar: {
    type: String,
    required: true,
    // Removed unique: true from avatar since multiple users might have the same avatar URL
  },
  email: {
      type: String,
      required: true,
      unique: true
  },
  password: {
      type: String,
      required: true,
  },
  firstName: {
      type: String,
      required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: {
    type: String
  },
  emailVerificationOTPExpiry: {
    type: Date
  },
  isAccountDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});

const User = models.User || model<MyUser>("User", userSchema);

export default User;