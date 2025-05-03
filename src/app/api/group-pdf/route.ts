import connectDB from "@/dbConnect/dbConnect";
import { getDataFromToken } from "@/utils/GetDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "../../../../models/User.Model";
import GroupNote from "../../../../models/NotesGroup";
import Note from "../../../../models/Notes.Model";

connectDB();

export async function GET(req: NextRequest) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const url = new URL(req.url);
        const groupId = url.searchParams.get('groupId');

        if (!groupId) {
            return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
        }

        const user = await User.findById(userId).lean() as { 
            firstName?: string; 
            avatar?: string; 
            email: string; 
            _id: string; 
        } | null;
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const groupNote = await GroupNote.findOne({ 
            _id: groupId,
            createdBy: userId,
            is_deleted: false
        }).lean() as { 
            _id: string; 
            notes: string[]; 
            [key: string]: any; 
        } | null;

        if (!groupNote) {
            return NextResponse.json({ error: "Group note not found" }, { status: 404 });
        }

        const notes = await Note.find({
            _id: { $in: groupNote.notes },
            userId: userId,
            is_deleted: false
        }).lean();

        const groupNoteWithNotes = {
            ...groupNote,
            noteObjects: notes
        };

        return NextResponse.json({
            groupNote: groupNoteWithNotes,
            user: {
                name: user.firstName || '',
                avatar: user.avatar || '',
                email: user.email,
                id: user._id
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Error in export-group-pdf API:", error);
        return NextResponse.json({ error: "Failed to fetch data for group PDF export" }, { status: 500 });
    }
}
