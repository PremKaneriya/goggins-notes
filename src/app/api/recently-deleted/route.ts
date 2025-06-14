import { getDataFromToken } from "@/utils/GetDataFromToken";
import Note from "../../../../models/Notes.Model";
import User from "../../../../models/User.Model";
import { NextRequest } from "next/server";

// api/recently-deleted/route.ts
export const GET = async (request: NextRequest) => {
    try {
        // Get the current user ID from token
        const userId = await getDataFromToken(request);
        
        if (!userId) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
        }
    
        // Find user data directly with userId
        const user = await User.findById(userId);
        
        if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }
        
        // Fetch recently deleted notes
        const recentlyDeletedNotes = await Note.find({ userId: user._id, is_deleted: true })
        .sort({ is_deleted: -1 }) // Sort by deletion date, most recent first
        .limit(10); // Limit to 10 notes
    
        return new Response(JSON.stringify({
        recentlyDeletedNotes,
        message: "Recently deleted notes fetched successfully"
        }), { status: 200 });
    } catch (error: any) {
        console.error("Recently Deleted API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}