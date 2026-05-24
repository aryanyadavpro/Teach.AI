import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Material from '@/models/Material';
import mongoose from 'mongoose';

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

        // Debug: Log the query
        console.log('Fetching materials for classroom:', classroomId);

        // Fetch all published materials for this classroom
        const materials = await Material.find({
            classroomId: classroomObjId,
            isPublished: true
        })
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        console.log('Found materials count:', materials.length);

        // Transform materials to include full content
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
