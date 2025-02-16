import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest) => {
  try {
    // Check for both 'token' and '_vercel_jwt'
    const token = request.cookies.get("token")?.value || request.cookies.get("_vercel_jwt")?.value;
    
    if (!token) throw new Error("Please login or sign up");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decodedToken === "string") {
      throw new Error("Invalid token format");
    }

    return (decodedToken as JwtPayload).id;
  } catch (error: any) {
    console.error("JWT Error:", error.message);
    return null;
  }
};
