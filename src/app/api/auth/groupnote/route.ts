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

export async function PATCH(req: NextRequest) {
    try {
        const { groupId, is_deleted } = await req.json();

        console.log(groupId, is_deleted);

        const userId = await getDataFromToken(req);
        
        const result = await GroupNote.updateOne({ _id: groupId }, { is_deleted: is_deleted });
        if (result.matchedCount === 0) {
            return new Response(JSON.stringify({ error: "Group note not found" }), { status: 404 });
        }
        return NextResponse.json({ message: "Group note deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating group note:", error);
        return new Response(JSON.stringify({ error: "Failed to delete groupnote" }), { status: 500 });
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

export async function PUT(req: NextRequest) {
    try {
        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { groupId, name, description, notes } = await req.json();
        
        // Verify that the group note exists and belongs to the user
        const existingGroupNote = await GroupNote.findOne({ 
            _id: groupId, 
            createdBy: userId 
        });
        
        if (!existingGroupNote) {
            return NextResponse.json({ error: "Group note not found or unauthorized" }, { status: 404 });
        }
        
        // Update the group note with new data
        const updatedGroupNote = await GroupNote.findByIdAndUpdate(
            groupId,
            { 
                name, 
                description, 
                notes 
            },
            { new: true } // Return the updated document
        );
        
        return NextResponse.json(
            { 
                message: "Group note updated successfully", 
                groupNote: updatedGroupNote 
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating group note:", error);
        return NextResponse.json(
            { message: "Error updating group note", error }, 
            { status: 500 }
        );
    }
}
