import connectDB from "@/dbConnect/dbConnect";
import User from "../../../../../models/User.Model";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { parseUserAgent } from "@/utils/parseUserAgent"; // Custom helper
import DetailsModel from "../../../../../models/Details.Model";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password, geo } = reqBody;

    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    if (user.isAccountDeleted)
      return NextResponse.json({ error: "Account deleted" }, { status: 400 });

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect)
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 400 }
      );

    const userAgent = request.headers.get("user-agent") || "";
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress =
      forwarded?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      request.ip ??
      "::1";

    const { browser, os, device } = parseUserAgent(userAgent);

    // Save login details
    await DetailsModel.create({
      userId: user._id,
      ipAddress: ipAddress,
      browser,
      os,
      device,
      location: geo?.location || "Unknown",
      latitude: geo?.latitude || 0,
      longitude: geo?.longitude || 0,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1y" }
    );

    const response = NextResponse.json(
      { message: "User logged in successfully", info: user },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 31536000,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
