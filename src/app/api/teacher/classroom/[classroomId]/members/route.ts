import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import User from "@/models/User";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ classroomId: string }> }
) {
    try {
        const session = await auth();

        if (!session || session.user?.role !== "TEACHER") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { classroomId } = await params;

        await connectDB();

        // Find all enrollments for this classroom and populate student details
        const enrollments = await Enrollment.find({ classroomId })
            .populate({
                path: 'studentId',
                select: 'name email'
            })
            .sort({ joinedAt: -1 });

        const members = enrollments.map(e => e.studentId);

        return NextResponse.json(members);
    } catch (error: any) {
        console.error("Get classroom members error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
