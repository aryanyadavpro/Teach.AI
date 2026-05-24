import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import mongoose from "mongoose";

// Debug endpoint to check enrollment data
export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await connectDB();

        console.log('=== DEBUG INFO ===');
        console.log('Session user ID:', session.user.id);
        console.log('Session user ID type:', typeof session.user.id);

        // Find enrollments with string ID (as-is)
        const stringEnrollments = await Enrollment.find({ studentId: session.user.id }).lean();
        console.log('Enrollments with string ID:', stringEnrollments.length);

        // Find enrollments with ObjectId conversion
        const objectIdEnrollments = await Enrollment.find({
            studentId: new mongoose.Types.ObjectId(session.user.id)
        }).lean();
        console.log('Enrollments with ObjectId:', objectIdEnrollments.length);

        // Find ALL enrollments and check their types
        const allEnrollments = await Enrollment.find({}).lean();
        console.log('Total enrollments in DB:', allEnrollments.length);

        allEnrollments.forEach((e, i) => {
            console.log(`Enrollment ${i}:`, {
                _id: e._id,
                studentId: e.studentId,
                studentIdType: typeof e.studentId,
                classroomId: e.classroomId
            });
        });

        return NextResponse.json({
            sessionUserId: session.user.id,
            sessionUserIdType: typeof session.user.id,
            stringMatches: stringEnrollments.length,
            objectIdMatches: objectIdEnrollments.length,
            totalEnrollments: allEnrollments.length,
            enrollments: allEnrollments.map(e => ({
                _id: e._id.toString(),
                studentId: e.studentId.toString(),
                classroomId: e.classroomId.toString()
            }))
        });

    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json(
            { error: 'Debug failed', details: (error as Error).message },
            { status: 500 }
        );
    }
}
