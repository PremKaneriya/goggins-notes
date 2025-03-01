// In /app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/utils/GetDataFromToken";
import User from "../../../../../models/User.Model";
import Note from "../../../../../models/Notes.Model";

export async function GET(request: NextRequest) {
    try {
      // Get the current user ID from token
      const userId = await getDataFromToken(request);
      
      if (!userId) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        );
      }
  
      // Find user data directly with userId
      const user = await User.findById(userId);
      
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      
      // Count user's notes
      const totalNotes = await Note.countDocuments({ userId: user._id });
      
      // Return user data with note count
      return NextResponse.json({
        user: {
          firstName: user.firstName,
          email: user.email,
          avatar: user.avatar,
          phoneNumber: user.phoneNumber,
          totalNotes
        }
      }, { status: 200 });
      
    } catch (error: any) {
      console.error("Profile API Error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }