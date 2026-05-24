import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import mongoose from "mongoose";

// Fix enrollment IDs - converts string-based IDs to ObjectIds
export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await connectDB();

        console.log('=== FIXING ENROLLMENTS ===');
        console.log('Session user ID:', session.user.id);
        console.log('Session user ID type:', typeof session.user.id);

        // Step 1: Find enrollments where studentId is stored as string
        const allEnrollments = await Enrollment.find({}).lean();
        console.log('Total enrollments in DB:', allEnrollments.length);

        let fixed = 0;
        let alreadyCorrect = 0;

        for (const enrollment of allEnrollments) {
            const studentIdType = typeof enrollment.studentId;
            console.log(`Enrollment ${enrollment._id}: studentId type = ${studentIdType}`);

            // If it's stored as string, we need to check if it matches our user
            if (studentIdType === 'string' && (enrollment.studentId as any) === session.user.id) {
                // Delete this enrollment and recreate with ObjectId
                await Enrollment.findByIdAndDelete(enrollment._id);
                const newEnrollment = new Enrollment({
                    studentId: new mongoose.Types.ObjectId(session.user.id),
                    classroomId: enrollment.classroomId,
                    joinedAt: enrollment.joinedAt
                });
                await newEnrollment.save();
                fixed++;
                console.log(`Fixed enrollment ${enrollment._id}`);
            } else {
                alreadyCorrect++;
            }
        }

        console.log('==================');

        return NextResponse.json({
            success: true,
            message: 'Enrollment fix completed',
            totalEnrollments: allEnrollments.length,
            fixed,
            alreadyCorrect,
            userId: session.user.id
        });

    } catch (error) {
        console.error('Fix error:', error);
        return NextResponse.json(
            { error: 'Fix failed', details: (error as Error).message },
            { status: 500 }
        );
    }
}
