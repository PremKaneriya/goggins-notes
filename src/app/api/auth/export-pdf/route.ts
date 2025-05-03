// api/auth/export-pdf/route.ts

import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/dbConnect/dbConnect";
import Note from "../../../../../models/Notes.Model";
import { getDataFromToken } from "../../../../utils/GetDataFromToken";

connectDB();

export async function GET(req: NextRequest) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the noteId from the query parameters (for single note export)
        const url = new URL(req.url);
        const noteId = url.searchParams.get("noteId");

        let notes;
        if (noteId) {
            // Export single note
            notes = await Note.findOne({ _id: noteId, userId }).lean();
            if (!notes) {
                return NextResponse.json({ error: "Note not found" }, { status: 404 });
            }
            notes = [notes]; // Convert to array for consistent processing
        } else {
            // Export all notes
            notes = await Note.find({ userId, is_deleted: false }).sort({ createdAt: -1 }).lean();
        }

        return NextResponse.json({ notes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, message: "Failed to fetch notes for export" }, { status: 500 });
    }
}