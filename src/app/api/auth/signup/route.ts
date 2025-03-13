import connectDB from "@/dbConnect/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import User from "../../../../../models/User.Model";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";
import crypto from "crypto";

connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to generate OTP
function generateOTP() {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
async function sendOTPEmail(email: string, otp: string, firstName: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification OTP",
    html: `
    <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
      <!-- Header with app name -->
      <div style="background: linear-gradient(135deg, #0046ff, #003399); padding: 25px; text-align: center;">
        <h1 style="color: white; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 26px;">GOGGINS NOTEBOOK</h1>
      </div>
      
      <!-- Main content area -->
      <div style="background-color: white; padding: 30px;">
        <h2 style="color: #003399; margin-top: 0; font-weight: 600;">Verify Your Email</h2>
        <p style="color: #444; line-height: 1.5;">Hello ${firstName},</p>
        <p style="color: #444; line-height: 1.5;">Thank you for joining Goggins Notebook. Please use the following OTP code to verify your email address:</p>
        
        <!-- OTP display box -->
        <div style="background: linear-gradient(to right, #e6f0ff, #f0f5ff); border-left: 5px solid #0046ff; padding: 20px; text-align: center; margin: 25px 0; border-radius: 4px;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0046ff;">${otp}</div>
          <div style="font-size: 12px; color: #666; margin-top: 10px;">This code expires in 10 minutes</div>
        </div>
        
        <p style="color: #444; line-height: 1.5;">If you didn't request this verification, please ignore this email or contact support.</p>
        
        <!-- Motivational quote section -->
        <div style="margin: 30px 0; padding: 15px; background-color: #f5f8ff; border-radius: 4px; text-align: center;">
          <p style="color: #0046ff; font-style: italic; font-weight: 500; margin: 0;">"Stay hard! It's time to push beyond your limits."</p>
        </div>
      </div>
      
      <!-- Footer area -->
      <div style="background-color: #f0f5ff; padding: 20px; text-align: center; border-top: 1px solid #e0e8ff;">
        <p style="color: #666; margin: 0; font-size: 14px;">© 2025 Goggins Notebook | <a href="#" style="color: #0046ff; text-decoration: none;">Privacy Policy</a> | <a href="#" style="color: #0046ff; text-decoration: none;">Terms</a></p>
      </div>
    </div>
    `,
  };

  try {
    // Return a promise that resolves when email is sent successfully
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Process FormData instead of JSON
    const formData = await request.formData();

    // Extract fields from FormData
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;

    // Handle avatar file
    const avatarFile = formData.get("avatar") as File;
    let avatar = "";

    if (avatarFile && avatarFile.size > 0) {
      // Convert File object to Buffer
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create a temp file path for Cloudinary upload
      const dataURI = `data:${avatarFile.type};base64,${buffer.toString(
        "base64"
      )}`;

      // Upload to Cloudinary
      try {
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: "goggins-avatars",
          resource_type: "auto",
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

    // Validate inputs
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
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
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

    // Check if the email is already in use by a verified user who hasn't deleted their account
    const existingVerifiedUser = await User.findOne({
      email,
      isEmailVerified: true,
      isAccountDeleted: { $ne: true }, // Exclude deleted accounts
    });

    if (existingVerifiedUser) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      );
    }

    // Check if the phone number is already in use by a non-deleted account
    const existingUser = await User.findOne({
      isEmailVerified: true,
      isAccountDeleted: { $ne: true }, // Exclude deleted accounts
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Account with this email already exists" },
        { status: 400 }
      );
    }

    // Check for deleted account with this email
    const deletedAccount = await User.findOne({
      email,
      isAccountDeleted: true,
    });

    // Generate OTP
    const otp = generateOTP();
    console.log(`Generated OTP for ${email}: ${otp}`);

    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    let user;

    if (deletedAccount) {
      // Restore the deleted account with new information
      deletedAccount.password = hashedPassword;
      deletedAccount.firstName = firstName;
      deletedAccount.avatar = avatar;
      deletedAccount.isAccountDeleted = false; // Restore the account
      deletedAccount.isEmailVerified = false; // Require verification again
      deletedAccount.emailVerificationOTP = otp;
      deletedAccount.emailVerificationOTPExpiry = otpExpiry;

      // Save first to ensure database is updated
      user = await deletedAccount.save();
      console.log(`Restored deleted account with new data and OTP: ${otp}`);
    } else {
      // Check for existing unverified user with this email
      const existingUnverifiedUser = await User.findOne({
        email,
        isEmailVerified: false,
        isAccountDeleted: { $ne: true }, // Exclude deleted accounts
      });

      if (existingUnverifiedUser) {
        // Update the existing unverified user
        existingUnverifiedUser.password = hashedPassword;
        existingUnverifiedUser.firstName = firstName;
        existingUnverifiedUser.avatar = avatar;
        existingUnverifiedUser.emailVerificationOTP = otp;
        existingUnverifiedUser.emailVerificationOTPExpiry = otpExpiry;

        // Save first to ensure database is updated
        user = await existingUnverifiedUser.save();
        console.log(`Updated user in database with OTP: ${otp}`);
      } else {
        // Create a new user with verification fields
        const newUser = new User({
          email,
          password: hashedPassword,
          firstName,
          avatar,
          isEmailVerified: false,
          emailVerificationOTP: otp,
          emailVerificationOTPExpiry: otpExpiry,
          isAccountDeleted: false, // Explicitly set as not deleted
        });

        // Save first to ensure database is updated
        user = await newUser.save();
        console.log(`Created new user in database with OTP: ${otp}`);
      }
    }

    // Send OTP after database update is confirmed
    await sendOTPEmail(email, otp, firstName);

    return NextResponse.json(
      {
        message:
          "User created. Please verify your email with the OTP sent to your email address.",
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add this new endpoint for OTP verification
// Add this new endpoint for OTP verification
export async function PUT(request: NextRequest) {
  try {
    const { userId, otp } = await request.json();

    console.log(`Verifying OTP for user ID: ${userId}`); // Log for debugging
    console.log(`OTP: ${otp}`); // Log for debugging

    if (!userId || !otp) {
      return NextResponse.json(
        { error: "User ID and OTP are required" },
        { status: 400 }
      );
    }

    // Find the user by ID
    const userRecord = await User.findById(userId);

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if OTP is expired
    const now = new Date();
    if (now > userRecord.emailVerificationOTPExpiry) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Convert both to strings and trim whitespace for reliable comparison
    const submittedOTP = String(otp).trim();
    const storedOTP = String(userRecord.emailVerificationOTP).trim();
    // Validate OTP
    if (submittedOTP !== storedOTP) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Update user verification status
    userRecord.isEmailVerified = true;
    userRecord.emailVerificationOTP = undefined;
    userRecord.emailVerificationOTPExpiry = undefined;

    await userRecord.save();

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}

// Add this endpoint for resending OTP
export async function PATCH(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new OTP
    const otp = generateOTP();
    console.log(`Resending OTP for ${email}: ${otp}`); // Log for debugging

    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes

    // Update user with new OTP
    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpiry = otpExpiry;

    // Save first to ensure database is updated before sending email
    await user.save();
    console.log(`Updated user in database with new OTP: ${otp}`);

    // Send OTP only after database update is confirmed
    await sendOTPEmail(email, otp, user.firstName);

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resend OTP" },
      { status: 500 }
    );
  }
}
