import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/dbConnect/dbConnect";
import Note from "../../../../../models/Notes.Model";
import { getDataFromToken } from "../../../../utils/GetDataFromToken";

connectDB();

// Get all notes for the logged-in user
export async function GET(req: NextRequest) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notes = await Note.find({ userId }).sort({ createdAt: -1 }).lean();
        return NextResponse.json(notes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message, message: "Failed to fetch notes" }, { status: 500 });
    }
}

// Create a new note
export async function POST(req: NextRequest) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, content } = await req.json();
        if (!title || !content) {
            return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
        }

        const newNote = new Note({ userId, title, content });
        await newNote.save();

        return NextResponse.json({ message: "Note created successfully", note: newNote });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, message: "Failed to create note" }, { status: 500 });
    }
}

// Delete a note
export async function PATCH(req: Request) {
    try {
        const { noteId, is_deleted } = await req.json();

        if (!noteId) {
            return new Response(JSON.stringify({ error: "Note ID is required" }), { status: 400 });
        }

        await Note.updateOne({ _id: noteId }, { is_deleted: true });
        return new Response(JSON.stringify({ message: "Note deleted successfully" }));


        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to update note" }), { status: 500 });
    }
}
