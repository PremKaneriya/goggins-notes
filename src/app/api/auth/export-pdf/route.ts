export const dynamic = 'force-dynamic';
import connectDB from "@/dbConnect/dbConnect";
import { getDataFromToken } from "@/utils/GetDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import Note from "../../../../../models/Notes.Model";
import User from "../../../../../models/User.Model";

connectDB();

export async function GET(
    req: NextRequest,
) {
    try {
        const userId = await getDataFromToken(req);
        
        // Check if a specific note ID was requested
        const url = new URL(req.url);
        const noteId = url.searchParams.get('noteId');

        const user = await User.findById(userId).lean() as { 
            firstName?: string; 
            avatar?: string; 
            email: string; 
            _id: string; 
        } | null;
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Query notes based on whether a specific note was requested
        let notes;
        if (noteId) {
            notes = await Note.find({ userId, _id: noteId }).lean();
        } else {
            notes = await Note.find({ userId, is_deleted: false }).sort({ updatedAt: -1 }).lean();
        }

        return NextResponse.json({
            notes,
            user: {
                name: user.firstName || '',
                avatar: user.avatar || '',
                email: user.email,
                id: user._id,
                totalNotesCreated: notes.length
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error in export-pdf API:", error);
        return NextResponse.json({ error: "Failed to fetch data for PDF export" }, { status: 500 });
    }
}