import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Material from '@/models/Material';
import Classroom from '@/models/Classroom';

// Debug endpoint to check materials in database
export async function GET() {
    try {
        const session = await auth();

        await dbConnect();

        // Get all materials
        const materials = await Material.find({})
            .populate('classroomId', 'name code')
            .populate('teacherId', 'name email')
            .lean();

        // Get all classrooms
        const classrooms = await Classroom.find({})
            .select('_id name code')
            .lean();

        return NextResponse.json({
            currentUser: session?.user ? {
                id: session.user.id,
                email: session.user.email,
                role: session.user.role
            } : null,
            classrooms: classrooms.map(c => ({
                _id: c._id.toString(),
                name: c.name,
                code: c.code
            })),
            materials: materials.map(m => ({
                _id: m._id.toString(),
                title: m.title,
                type: m.type,
                classroomId: m.classroomId?._id?.toString() || m.classroomId?.toString(),
                classroomName: (m.classroomId as any)?.name,
                teacherId: m.teacherId?._id?.toString() || m.teacherId?.toString(),
                isPublished: m.isPublished,
                createdAt: m.createdAt
            })),
            totalMaterials: materials.length,
            totalClassrooms: classrooms.length
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
