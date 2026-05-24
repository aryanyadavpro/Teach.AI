import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Classroom from "@/models/Classroom";
import Enrollment from "@/models/Enrollment";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || session.user?.role !== "STUDENT") {
            return NextResponse.json(
                { message: "Unauthorized. Students only." },
                { status: 401 }
            );
        }

        const { code } = await req.json();

        if (!code) {
            return NextResponse.json(
                { message: "Classroom code is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // 1. Find the classroom by code
        const classroom = await Classroom.findOne({ code: code.toUpperCase() });

        if (!classroom) {
            return NextResponse.json(
                { message: "Invalid classroom code" },
                { status: 404 }
            );
        }

        // 2. Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            studentId: new mongoose.Types.ObjectId(session.user.id),
            classroomId: classroom._id,
        });

        if (existingEnrollment) {
            return NextResponse.json(
                { message: "You are already enrolled in this classroom" },
                { status: 400 }
            );
        }

        // 3. Create enrollment
        const newEnrollment = new Enrollment({
            studentId: new mongoose.Types.ObjectId(session.user.id),
            classroomId: classroom._id,
        });

        await newEnrollment.save();

        return NextResponse.json(
            {
                message: "Successfully joined the classroom!",
                classroom: {
                    name: classroom.name,
                    id: classroom._id
                }
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Join classroom error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
