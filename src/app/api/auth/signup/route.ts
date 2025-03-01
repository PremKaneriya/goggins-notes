import connectDB from "@/dbConnect/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import User from "../../../../../models/User.Model";
import path from "path";
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from "fs";


connectDB();

// export async function POST(request: NextRequest) {
//   try {
//     const reqBody = await request.json();

//     const { email, password, phoneNumber, firstName, avatar } = reqBody;

//     const user = await User.findOne({ email }).select("+password");

//     if (user) {
//       return NextResponse.json(
//         { error: "User already exists" },
//         { status: 400 }
//       );
//     }

//     const salt = await bcryptjs.genSalt(10);
//     const hashedPassword = await bcryptjs.hash(password, salt);

//     const newUser = new User({
//       email,
//       password: hashedPassword,
//       phoneNumber,
//       firstName,
//       avatar
//     });

//     console.log(newUser);

//     const savedUser = await newUser.save();

//     return NextResponse.json(
//       { message: "User created successfully", info: savedUser },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export async function POST(request: NextRequest) {
  try {
    // Process FormData instead of JSON
    const formData = await request.formData();
    
    // Extract fields from FormData
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const firstName = formData.get('firstName') as string;
    
    // Handle avatar file
    const avatarFile = formData.get('avatar') as File;
    let avatar = "";
    
    if (avatarFile && avatarFile.size > 0) {
      // Create directory for uploads if it doesn't exist
      const uploadsDir = path.join("/tmp/uploads");  // Works on many cloud platforms
      
      console.log("Upload directory:", uploadsDir);
      console.log("Directory exists:", existsSync(uploadsDir));
      
      try {
        await mkdir(uploadsDir, { recursive: true });
        console.log("Directory created/verified");
      } catch (dirError) {
        console.error("Error creating directory:", dirError);
      }
      
      // Generate unique filename
      const filename = `${Date.now()}_${avatarFile.name.replace(/\s/g, '_')}`;
      const filepath = path.join(uploadsDir, filename);
      
      console.log("File will be saved to:", filepath);
      
      // Convert File object to Buffer and save
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      try {
        await writeFile(filepath, buffer);
        console.log("File written successfully");
        
        // Store path relative to public directory
        avatar = `/avatars/${filename}`;
        console.log("Avatar path stored as:", avatar);
      } catch (fileError) {
        console.error("Error writing file:", fileError);
      }
    } else {
      console.log("No avatar file provided or empty file");
    }

    const user = await User.findOne({ email }).select("+password");

    if (user) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      phoneNumber,
      firstName,
      avatar
    });

    console.log("User to be saved:", {
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      firstName: newUser.firstName,
      avatar: newUser.avatar
    });

    const savedUser = await newUser.save();

    return NextResponse.json(
      { message: "User created successfully", info: savedUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
