import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export const getDataFromToken = (request: NextRequest) => {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) throw new Error("Please login or sign up");

    // Verify and decode the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

    // Ensure the token is of type JwtPayload
    if (typeof decodedToken === "string") {
      throw new Error("Invalid token format");
    }

    return (decodedToken as JwtPayload).id;
  } catch (error: any) {
    console.error("JWT Error:", error.message);
    return null; // Return null to handle errors gracefully
  }
};
