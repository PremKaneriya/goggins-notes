import connectDB from "@/dbConnect/dbConnect";
import User from "../../../../../models/User.Model";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Connect to the database once
connectDB();

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT Secret is not defined in environment variables");
    }

    // Parse request body
    const reqBody = await request.json();
    const { email, password } = reqBody;

    // Validate input
    if (!email || !password ) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email or phone
    console.time("Database Query");
    const user = await User.findOne({ $or: [{ email }] });
    console.timeEnd("Database Query");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Compare passwords
    console.time("Password Comparison");
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    console.timeEnd("Password Comparison");

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie and return response
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
    console.error("Error in POST /api/login:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}