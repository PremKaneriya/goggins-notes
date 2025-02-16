import mongoose, { model, models } from "mongoose";

export interface MyUser {
  _id: mongoose.Types.ObjectId;
  phoneNumber: number;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema({
  phoneNumber: {
      type: Number,
      required: true,
      unique: true
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
}, {
  timestamps: true,
});

const User = models.User || model<MyUser>("User", userSchema);

export default User;
