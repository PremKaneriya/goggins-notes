import connectDB from "@/dbConnect/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import User from "../../../../../models/User.Model";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { phoneNumber, email, password } = reqBody;

    if (!phoneNumber || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists by phoneNumber or email
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email or phone number" },
        { status: 400 }
      );
    }

    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create user
    const newUser = new User({
      phoneNumber,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
