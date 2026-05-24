import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Material from '@/models/Material';
import Classroom from '@/models/Classroom';
import mongoose from 'mongoose';

// Helper function to extract JSON from markdown code blocks
function extractJSON(content: string): { jsonData: any; cleanContent: string } {
    if (!content || typeof content !== 'string') {
        return { jsonData: null, cleanContent: content || '' };
    }

    // Try to extract JSON from markdown code block
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        const innerContent = codeBlockMatch[1].trim();
        try {
            const jsonData = JSON.parse(innerContent);
            return { jsonData, cleanContent: innerContent };
        } catch (e) {
            // Not valid JSON inside code block
        }
    }

    // Try direct JSON parsing
    try {
        const jsonData = JSON.parse(content);
        return { jsonData, cleanContent: content };
    } catch (e) {
        // Not JSON, return as-is
        return { jsonData: null, cleanContent: content };
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email || session.user.role !== 'TEACHER') {
            return NextResponse.json(
                { error: 'Unauthorized. Teachers only.' },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await request.json();
        const {
            classroomIds,
            type,
            title,
            description,
            content,
            dueDate,
            points,
            saveToLibrary
        } = body;

        // Debug: Log incoming data
        console.log('=== PUBLISH MATERIAL DEBUG ===');
        console.log('Content received (first 500 chars):',
            typeof content === 'string' ? content.substring(0, 500) : 'Not a string'
        );

        // Validate required fields
        if (!classroomIds || !Array.isArray(classroomIds) || classroomIds.length === 0) {
            return NextResponse.json(
                { error: 'At least one classroom must be selected' },
                { status: 400 }
            );
        }

        if (!type || !title) {
            return NextResponse.json(
                { error: 'Type and title are required' },
                { status: 400 }
            );
        }

        // Verify teacher owns these classrooms
        const teacherId = new mongoose.Types.ObjectId(session.user.id);
        const classrooms = await Classroom.find({
            _id: { $in: classroomIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
            teacherId: teacherId
        });

        if (classrooms.length !== classroomIds.length) {
            return NextResponse.json(
                { error: 'You can only publish to your own classrooms' },
                { status: 403 }
            );
        }

        // Extract and parse JSON content
        const { jsonData, cleanContent } = extractJSON(content);

        console.log('Extracted JSON:', jsonData ? 'YES' : 'NO');
        console.log('Clean content length:', cleanContent?.length || 0);
        if (jsonData) {
            console.log('JSON keys:', Object.keys(jsonData));
        }

        // Create materials for each classroom
        const materials = await Promise.all(
            classroomIds.map(async (classroomId: string) => {
                const materialData = {
                    classroomId: new mongoose.Types.ObjectId(classroomId),
                    teacherId: teacherId,
                    type,
                    title,
                    description: description || 'Generated via AI Studio',
                    content: cleanContent, // Store clean JSON string
                    jsonData: jsonData, // Store parsed JSON object
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    points: points || undefined,
                    isPublished: true
                };

                console.log('Creating material:', {
                    classroomId: materialData.classroomId.toString(),
                    title: materialData.title,
                    type: materialData.type,
                    hasJsonData: !!materialData.jsonData,
                    jsonKeys: materialData.jsonData ? Object.keys(materialData.jsonData) : []
                });

                const material = new Material(materialData);
                await material.save();

                console.log('Saved material ID:', material._id.toString());
                return material;
            })
        );

        // Optionally save to library
        let libraryItemId = null;
        if (saveToLibrary) {
            const LibraryItem = (await import('@/models/LibraryItem')).default;
            const libraryItem = new LibraryItem({
                teacherId: teacherId,
                type: type,
                title: title,
                description: description || 'Generated via AI Studio',
                content: cleanContent,
                jsonData: jsonData,
                tags: [type],
                isPublic: false
            });
            await libraryItem.save();
            libraryItemId = libraryItem._id.toString();
            console.log('Saved to library:', libraryItemId);
        }

        console.log('=== PUBLISH COMPLETE ===');

        return NextResponse.json({
            success: true,
            message: `Published to ${materials.length} classroom(s)`,
            materials: materials.map(m => ({
                _id: m._id.toString(),
                classroomId: m.classroomId.toString(),
                title: m.title,
                type: m.type,
                hasJsonData: !!m.jsonData
            })),
            savedToLibrary: saveToLibrary
        });

    } catch (error: any) {
        console.error('Error publishing materials:', error);
        return NextResponse.json(
            { error: 'Failed to publish materials: ' + error.message },
            { status: 500 }
        );
    }
}
