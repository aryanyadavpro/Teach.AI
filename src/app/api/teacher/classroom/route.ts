import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Classroom from "@/models/Classroom";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || session.user?.role !== "TEACHER") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { name } = await req.json();

        if (!name) {
            return NextResponse.json(
                { message: "Classroom name is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Generate a unique 6-character code
        let code = "";
        let isUnique = false;
        while (!isUnique) {
            code = crypto.randomBytes(3).toString("hex").toUpperCase();
            const existingClassroom = await Classroom.findOne({ code });
            if (!existingClassroom) {
                isUnique = true;
            }
        }

        const newClassroom = new Classroom({
            name,
            code,
            teacherId: session.user.id,
        });

        await newClassroom.save();

        return NextResponse.json(newClassroom, { status: 201 });
    } catch (error: any) {
        console.error("Create classroom error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session || session.user?.role !== "TEACHER") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        const classrooms = await Classroom.find({ teacherId: session.user.id });

        return NextResponse.json(classrooms);
    } catch (error: any) {
        console.error("Get classrooms error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
