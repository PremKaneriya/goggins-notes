export const dynamic = 'force-dynamic';
import connectDB from "@/dbConnect/dbConnect";
import { getDataFromToken } from "@/utils/GetDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "../../../../../models/User.Model";

connectDB();

export async function PUT(
    req: NextRequest,
) {
    try {
        const userId = await getDataFromToken(req);
        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get the data from request body
        const body = await req.json();
        const { firstName, avatar, email } = body;

        // Update user fields if provided
        if (firstName) user.firstName = firstName;
        if (avatar) user.avatar = avatar;
        if (email) user.email = email;

        // Save the updated user
        await user.save();

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                name: user.firstName,
                avatar: user.avatar,
                email: user.email,
                id: user._id,
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error("Profile update error:", error.message);
        return NextResponse.json({ 
            error: "Failed to update profile",
            details: error.message
        }, { status: 500 });
    }
}