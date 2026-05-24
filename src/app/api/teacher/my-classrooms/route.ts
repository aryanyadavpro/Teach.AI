import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Classroom from '@/models/Classroom';
import mongoose from 'mongoose';

// Get all classrooms owned by the teacher
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email || session.user.role !== 'TEACHER') {
            return NextResponse.json(
                { error: 'Unauthorized. Teachers only.' },
                { status: 401 }
            );
        }

        await dbConnect();

        const teacherId = new mongoose.Types.ObjectId(session.user.id);
        const classrooms = await Classroom.find({ teacherId })
            .select('_id name code')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            classrooms: classrooms.map(c => ({
                _id: c._id.toString(),
                name: c.name,
                code: c.code
            }))
        });

    } catch (error) {
        console.error('Error fetching teacher classrooms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch classrooms' },
            { status: 500 }
        );
    }
}
