import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Classroom from '@/models/Classroom';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classroomId: string }> }
) {
    try {
        const { classroomId } = await params;
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Fetch classroom details with teacher info
        const classroom = await Classroom.findById(classroomId)
            .populate('teacherId', 'name email')
            .lean();

        if (!classroom) {
            return NextResponse.json(
                { error: 'Classroom not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            classroom: {
                _id: classroom._id,
                name: classroom.name,
                code: classroom.code,
                teacher: classroom.teacherId,
                joinedAt: new Date().toISOString() // Default to now for display
            }
        });

    } catch (error) {
        console.error('Error fetching classroom:', error);
        return NextResponse.json(
            { error: 'Failed to fetch classroom details' },
            { status: 500 }
        );
    }
}
