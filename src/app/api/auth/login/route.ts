import connectDB from "@/dbConnect/dbConnect";
import User from "../../../../../models/User.Model";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

connectDB();

export async function POST(request: NextRequest) {
  try {
    
    connectDB();

    const reqBody = await request.json();
    const { email, phoneNumber, password } = reqBody;

    if (!password || (!email && !phoneNumber)) {
      return NextResponse.json(
        { error: "Email/Phone and password are required" },
        { status: 400 }
      );
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Compare passwords
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT Secret is not defined in environment variables");
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json(
      { message: "User logged in successfully", info: user },
      { status: 200 }
    );

    response.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax; ${
        process.env.NODE_ENV === "production" ? "Secure;" : ""
      }`
    );

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
