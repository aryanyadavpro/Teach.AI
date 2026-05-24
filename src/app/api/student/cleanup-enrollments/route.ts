import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import mongoose from "mongoose";

// DEV ONLY: Cleanup endpoint to fix enrollment data types
export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        console.log('=== CLEANUP DEBUG ===');
        console.log('User ID from session:', session.user.id);
        console.log('User ID type:', typeof session.user.id);

        // Find all enrollments for this user (as string)
        const stringEnrollments = await Enrollment.find({ studentId: session.user.id }).lean();
        console.log('Enrollments with string ID:', stringEnrollments.length);

        // Delete old string-based enrollments
        const deleteResult = await Enrollment.deleteMany({ studentId: session.user.id });
        console.log('Deleted enrollments:', deleteResult.deletedCount);

        // Find enrollments with ObjectId
        const objectIdEnrollments = await Enrollment.find({
            studentId: new mongoose.Types.ObjectId(session.user.id)
        }).lean();
        console.log('Enrollments with ObjectId:', objectIdEnrollments.length);

        console.log('====================');

        return NextResponse.json({
            message: 'Cleanup completed',
            deletedStringEnrollments: deleteResult.deletedCount,
            remainingObjectIdEnrollments: objectIdEnrollments.length
        });

    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json(
            { error: 'Cleanup failed', details: (error as Error).message },
            { status: 500 }
        );
    }
}
