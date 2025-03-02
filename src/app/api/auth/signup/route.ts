import connectDB from "@/dbConnect/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import User from "../../../../../models/User.Model";
import { v2 as cloudinary } from 'cloudinary';


connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: NextRequest) {
  try {
    // Process FormData instead of JSON
    const formData = await request.formData();
    
    // Extract fields from FormData
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const firstName = formData.get('firstName') as string;
    
    // Handle avatar file
    const avatarFile = formData.get('avatar') as File;
    let avatar = "";
    
    if (avatarFile && avatarFile.size > 0) {
      // Convert File object to Buffer
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create a temp file path for Cloudinary upload
      const dataURI = `data:${avatarFile.type};base64,${buffer.toString('base64')}`;
      
      // Upload to Cloudinary
      try {
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'goggins-avatars',
          resource_type: 'auto'
        });
        
        // Store the secure URL from Cloudinary
        avatar = uploadResult.secure_url;
        console.log("Avatar uploaded to Cloudinary:", avatar);
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        throw new Error("Failed to upload avatar");
      }
    } else {
      console.log("No avatar file provided or empty file");
    }

    const user = await User.findOne({ email }).select("+password");

    if (user) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    if (!avatar) {
      return NextResponse.json(
        { error: "Avatar is required" },
        { status: 400 }
      );
    }

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      );
    }

    // Check if the phone number is already in use
    const existingPhoneNumber = await User.findOne({ phoneNumber });
    if (existingPhoneNumber) {
      return NextResponse.json(
        { error: "Phone number is already in use" },
        { status: 400 }
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      phoneNumber,
      firstName,
      avatar
    });

    console.log("User to be saved:", {
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      firstName: newUser.firstName,
      avatar: newUser.avatar
    });

    const savedUser = await newUser.save();

    return NextResponse.json(
      { message: "User created successfully", info: savedUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
