import { getDataFromToken } from "@/utils/GetDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "../../../../../../models/User.Model";
import Note from "../../../../../../models/Notes.Model";

export async function PATCH(request: NextRequest) {
    try {
        const userId = getDataFromToken(request);

        const user = await User.findByIdAndUpdate(userId, {
            isAccountDeleted: true
        });

        await Note.updateMany(
            { userId: userId },
            { is_deleted: true }
        )

        const response = NextResponse.json({ 
            success: true,
            message: "Account deleted successfully"
        });

        response.cookies.delete("token");

        return response;
    } catch (error) {
        return NextResponse.json({ error });
    }
}