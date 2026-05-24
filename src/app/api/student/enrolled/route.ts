import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Classroom from "@/models/Classroom";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
    try {
        const session = await auth();

        if (!session || session.user?.role !== "STUDENT") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // Try both string and ObjectId formats
        let enrollments = await Enrollment.find({ studentId: session.user.id })
            .populate({
                path: 'classroomId',
                populate: {
                    path: 'teacherId',
                    select: 'name email'
                }
            })
            .sort({ joinedAt: -1 });

        // If no results with string, try ObjectId
        if (enrollments.length === 0) {
            try {
                enrollments = await Enrollment.find({
                    studentId: new mongoose.Types.ObjectId(session.user.id)
                })
                    .populate({
                        path: 'classroomId',
                        populate: {
                            path: 'teacherId',
                            select: 'name email'
                        }
                    })
                    .sort({ joinedAt: -1 });
            } catch (err) {
                // Ignore invalid ObjectId
            }
        }

        const classrooms = enrollments.map(e => ({
            enrollmentId: e._id,
            joinedAt: e.joinedAt,
            classroom: e.classroomId
        }));

        return NextResponse.json(classrooms);
    } catch (error: any) {
        console.error("Get joined classrooms error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
