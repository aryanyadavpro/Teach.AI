import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";
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

        const studentObjId = new mongoose.Types.ObjectId(session.user.id);
        const enrollments = await Enrollment.find({
            $or: [{ studentId: studentObjId }, { studentId: session.user.id }],
        })
            .populate({
                path: 'classroomId',
                populate: {
                    path: 'teacherId',
                    select: 'name email'
                }
            })
            .sort({ joinedAt: -1 });

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
