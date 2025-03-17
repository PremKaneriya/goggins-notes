import connectDB from "@/dbConnect/dbConnect";
import User from "../../../../../models/User.Model";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Connect to the database
connectDB();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email } = reqBody;

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User with this email does not exist" }, { status: 404 });
    }

    if (user.isAccountDeleted === true) {
      return NextResponse.json({ error: "Account deleted, Please create new account" }, { status: 400 });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash the token for security before storing in DB
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    // Set token expiry (30 minutes from now)
    const resetTokenExpiry = Date.now() + 30 * 60 * 1000;
    
    // Save to user document
    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save({ validateBeforeSave: false });
    
    // Fix URL formation with proper handling of trailing slashes
    let baseUrl = process.env.FRONTEND_URL || "https://goggins.vercel.app/";
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    const resetUrl = `${baseUrl}reset-password/${resetToken}`;
    
    console.log("Generated reset URL:", resetUrl); // For debugging
    
    // Gmail specific configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Please click on the following link to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>This link is valid for 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    
    return NextResponse.json({ 
      message: "Password reset email sent successfully" 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ 
      error: "Failed to send reset email. Please try again later." 
    }, { status: 500 });
  }
}