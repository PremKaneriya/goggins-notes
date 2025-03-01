import { getDataFromToken } from "@/utils/GetDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "../../../../../models/User.Model";

export async function POST(request: NextRequest) {
    try {
        const userId = getDataFromToken(request);

        const user = await User.findById(userId);

        console.log("user", user);
        console.log("userId", userId);

        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        const response = NextResponse.redirect(new URL("/login", request.url));
        console.log("response", response);
        response.cookies.delete("token");

        return response;
    } catch (error) {
        return new Response("Error logging out", { status: 500 });
    }
}