import connectDB from "@/dbConnect/dbConnect";
import { getDataFromToken } from "@/utils/GetDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "../../../../models/User.Model";
import Note from "../../../../models/Notes.Model";

connectDB();

export async function GET(
    req: NextRequest,
) {
    try {
        const userId = await getDataFromToken(req);

        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const notes = await Note.find({ userId }).sort({ createdAt: -1 }).lean();

        return NextResponse.json({
            name: user.firstName,
            avatar: user.avatar,
            email: user.email,
            id: user._id,
            phoneNumber: user.phoneNumber,
            totalNotesCreated: notes.length
        }, { status: 200 });


    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}