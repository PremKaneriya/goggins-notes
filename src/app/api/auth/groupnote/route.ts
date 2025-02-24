import connectDB from "@/dbConnect/dbConnect";
import { getDataFromToken } from "@/utils/GetDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import GroupNote from "../../../../../models/NotesGroup";

connectDB();


export async function POST(req: NextRequest) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description, notes } = await req.json();
        
        const newGroupNote = await GroupNote.create({
            name,
            description,
            notes,
            createdBy: userId,
        });        

        return NextResponse.json(
            { message: "Group note created successfully", groupNote: newGroupNote },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json({ message: "Error creating group note", error }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const groupNotes = await GroupNote.find({ createdBy: userId }).sort({ createdAt: -1 }).lean();
        return NextResponse.json(groupNotes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message, message: "Failed to fetch group notes" }, { status: 500 });
    }
}