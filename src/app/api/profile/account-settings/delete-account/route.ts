import { getDataFromToken } from "@/utils/GetDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "../../../../../../models/User.Model";
import Note from "../../../../../../models/Notes.Model";

export async function PATCH(request: NextRequest) {
    try {
        const userId = getDataFromToken(request);
        
        // Check if user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return NextResponse.json({ 
                success: false, 
                message: "User not found" 
            }, { status: 404 });
        }

        // Mark user as deleted
        const user = await User.findByIdAndUpdate(userId, {
            isAccountDeleted: true
        });

        // Mark all user's notes as deleted
        await Note.updateMany(
            { userId: userId },
            { is_deleted: true }
        );

        // Create response and clear token cookie
        const response = NextResponse.json({ 
            success: true,
            message: "Account deleted successfully"
        });

        response.cookies.delete("token");
        return response;
    } catch (error: any) {
        console.error("Delete account error:", error);
        return NextResponse.json({ 
            success: false,
            message: error.message || "An error occurred while deleting the account"
        }, { status: 500 });
    }
}