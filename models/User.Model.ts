import mongoose, { model, models, Schema, Document } from "mongoose";
import validator from "validator";

// Interface for the document as stored in MongoDB
export interface MyUser extends Document {
  firstName: string;
  avatar: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  emailVerificationOTP?: string;
  emailVerificationOTPExpiry?: Date;
  isAccountDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

// Create schema with type assertion to bypass strict TypeScript checking
const userSchema = new Schema({
  avatar: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
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
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
} as any, {
  timestamps: true,
});

// Create model
const User = models.User || model<MyUser>("User", userSchema);

export default User;