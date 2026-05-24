import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Material from '@/models/Material';
import { isStudentEnrolled } from '@/models/Enrollment';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ classroomId: string }> }
) {
    try {
        const { classroomId } = await params;
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { error: 'Unauthorized. Students only.' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Convert classroomId to ObjectId for proper matching
        let classroomObjId;
        try {
            classroomObjId = new mongoose.Types.ObjectId(classroomId);
        } catch (e) {
            return NextResponse.json(
                { error: 'Invalid classroom ID' },
                { status: 400 }
            );
        }

        const enrolled = await isStudentEnrolled(session.user.id, classroomObjId);
        if (!enrolled) {
            return NextResponse.json(
                { error: 'You are not enrolled in this classroom' },
                { status: 403 }
            );
        }

        // Fetch all published materials for this classroom
        const materials = await Material.find({
            classroomId: classroomObjId,
            isPublished: true
        })
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const transformedMaterials = materials.map((m: any) => ({
            _id: m._id.toString(),
            type: m.type,
            title: m.title,
            description: m.description,
            content: m.content, // Full content
            jsonData: m.jsonData, // Structured JSON data
            fileUrl: m.fileUrl,
            videoUrl: m.videoUrl,
            dueDate: m.dueDate,
            points: m.points,
            teacher: m.teacherId ? {
                name: m.teacherId.name,
                email: m.teacherId.email
            } : null,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt
        }));

        // Group materials by type
        const groupedMaterials = {
            all: transformedMaterials,
            assignments: transformedMaterials.filter((m: any) => m.type === 'assignment'),
            quizzes: transformedMaterials.filter((m: any) => m.type === 'quiz'),
            videos: transformedMaterials.filter((m: any) => m.type === 'video'),
            articles: transformedMaterials.filter((m: any) => m.type === 'article'),
            resources: transformedMaterials.filter((m: any) => m.type === 'resource'),
            announcements: transformedMaterials.filter((m: any) => m.type === 'announcement')
        };

        return NextResponse.json({
            materials: groupedMaterials,
            total: materials.length
        });

    } catch (error) {
        console.error('Error fetching materials:', error);
        return NextResponse.json(
            { error: 'Failed to fetch materials' },
            { status: 500 }
        );
    }
}
