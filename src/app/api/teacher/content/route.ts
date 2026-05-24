import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Classroom from '@/models/Classroom';
import cloudinary, { uploadToCloudinary } from '@/lib/cloudinary';

// POST - Upload new resource to Cloudinary
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user || user.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Only teachers can upload resources' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const classroomId = formData.get('classroomId') as string;
        const subject = formData.get('subject') as string || '';

        if (!file || !title || !classroomId) {
            return NextResponse.json({ error: 'File, title, and classroom are required' }, { status: 400 });
        }

        // Verify classroom belongs to this teacher
        const classroom = await Classroom.findOne({ _id: classroomId, teacherId: user._id });
        if (!classroom) {
            return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary with metadata in context
        const uploadResult = await uploadToCloudinary(buffer, {
            folder: `learnify/classrooms/${classroomId}`,
            resourceType: 'auto',
            context: {
                title: title,
                subject: subject,
                classroomName: classroom.name,
                teacherName: user.name,
                originalFileName: file.name
            }
        });

        return NextResponse.json({
            success: true,
            resource: {
                publicId: uploadResult.publicId,
                title: title,
                fileUrl: uploadResult.url,
                format: uploadResult.format
            }
        });

    } catch (error) {
        console.error('Error uploading resource:', error);
        return NextResponse.json({ error: 'Failed to upload resource' }, { status: 500 });
    }
}

// GET - Fetch resources from Cloudinary by classroom folder
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const classroomId = searchParams.get('classroomId');

        // Get teacher's classrooms
        const classrooms = await Classroom.find({ teacherId: user._id }).lean();

        if (classrooms.length === 0) {
            return NextResponse.json({ resources: [] });
        }

        // Get resources from Cloudinary for specific classroom or all
        let resources: any[] = [];
        const targetClassrooms = classroomId
            ? classrooms.filter(c => c._id.toString() === classroomId)
            : classrooms;

        for (const cls of targetClassrooms) {
            try {
                const result = await cloudinary.api.resources({
                    type: 'upload',
                    prefix: `learnify/classrooms/${cls._id}`,
                    max_results: 100,
                    context: true
                });

                const classResources = result.resources.map((r: any) => ({
                    _id: r.public_id,
                    publicId: r.public_id,
                    fileUrl: r.secure_url,
                    format: r.format,
                    type: getTypeFromFormat(r.format),
                    fileSize: r.bytes,
                    title: r.context?.custom?.title || r.public_id.split('/').pop(),
                    subject: r.context?.custom?.subject || '',
                    classroomId: { _id: cls._id, name: cls.name },
                    createdAt: r.created_at
                }));

                resources = [...resources, ...classResources];
            } catch (err) {
                console.log(`No resources found for classroom ${cls._id}`);
            }
        }

        // Sort by creation date
        resources.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ resources });

    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
    }
}

// DELETE - Remove resource from Cloudinary
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user || user.role !== 'TEACHER') {
            return NextResponse.json({ error: 'Only teachers can delete resources' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const publicId = searchParams.get('id');

        if (!publicId) {
            return NextResponse.json({ error: 'Resource ID required' }, { status: 400 });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        // Try image type as well
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch(() => { });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting resource:', error);
        return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
    }
}

function getTypeFromFormat(format: string): string {
    if (format === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(format)) return 'doc';
    if (['ppt', 'pptx'].includes(format)) return 'ppt';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(format)) return 'image';
    return 'other';
}
