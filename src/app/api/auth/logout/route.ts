import { getDataFromToken } from "@/utils/GetDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "../../../../../models/User.Model";

export async function POST(request: NextRequest) {
    try {
        const userId = getDataFromToken(request);

        const user = await User.findById(userId);

        console.log("user", user);
        console.log("userId", userId);

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Create a response with JSON data
        const response = NextResponse.json({ 
            success: true, 
            message: "Logged out successfully" 
        });
        
        // Clear the token cookie
        response.cookies.delete("token");
        
        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Error logging out" 
        }, { status: 500 });
    }
}