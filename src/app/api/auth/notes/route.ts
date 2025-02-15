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
export async function DELETE(req: NextRequest) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { noteId } = await req.json();
        if (!noteId) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
        }

        const note = await Note.findOneAndDelete({ _id: noteId, userId });
        if (!note) {
            return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Note deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, message: "Failed to delete note" }, { status: 500 });
    }
}
