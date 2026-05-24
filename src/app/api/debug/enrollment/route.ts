import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Classroom from '@/models/Classroom';
import User from '@/models/User';

// Debug endpoint to check enrollment status
// Visit: /api/debug/enrollment
export async function GET() {
    try {
        const session = await auth();

        await dbConnect();

        // Get all users
        const users = await User.find({}).select('_id email name role').lean();

        // Get all classrooms
        const classrooms = await Classroom.find({}).select('_id name code').lean();

        // Get all enrollments
        const enrollments = await Enrollment.find({}).lean();

        return NextResponse.json({
            currentSession: session ? {
                id: session.user?.id,
                email: session.user?.email,
                role: session.user?.role,
                name: session.user?.name
            } : null,
            users: users.map(u => ({
                _id: u._id.toString(),
                email: u.email,
                role: u.role
            })),
            classrooms: classrooms.map(c => ({
                _id: c._id.toString(),
                name: c.name,
                code: c.code
            })),
            enrollments: enrollments.map(e => ({
                _id: e._id.toString(),
                studentId: e.studentId.toString(),
                classroomId: e.classroomId.toString()
            })),
            matchCheck: session?.user?.id ? {
                sessionUserId: session.user.id,
                enrollmentsForUser: enrollments
                    .filter(e => e.studentId.toString() === session.user?.id)
                    .map(e => e.classroomId.toString())
            } : null
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
