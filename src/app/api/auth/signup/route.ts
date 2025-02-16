import connectDB from "@/dbConnect/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import User from "../../../../../models/User.Model";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();

    const { email, password, phoneNumber } = reqBody;

    const user = await User.findOne({ email }).select("+password");

    if (user) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      phoneNumber,
    });

    const savedUser = await newUser.save();

    return NextResponse.json(
      { message: "User created successfully", info: savedUser },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}