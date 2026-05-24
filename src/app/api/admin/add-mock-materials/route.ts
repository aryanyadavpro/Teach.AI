import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Material from "@/models/Material";
import Classroom from "@/models/Classroom";
import User from "@/models/User";

// DEV ONLY: Add mock materials to a classroom
export async function POST(req: Request) {
    try {
        const { classroomId } = await req.json();

        if (!classroomId) {
            return NextResponse.json({ error: 'Classroom ID required' }, { status: 400 });
        }

        await connectDB();

        // Find the classroom
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
        }

        // Get teacher ID from classroom
        const teacherId = classroom.teacherId;

        // Create mock materials
        const mockMaterials = [
            {
                classroomId,
                teacherId,
                type: 'assignment',
                title: 'Introduction to Variables',
                description: 'Learn about variables, data types, and basic operations. Submit your answers by the end of the week.',
                content: 'Complete exercises 1-10 from Chapter 2',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                points: 100,
                isPublished: true
            },
            {
                classroomId,
                teacherId,
                type: 'quiz',
                title: 'Functions Quiz',
                description: 'Test your knowledge on functions, parameters, and return values',
                content: '10 multiple choice questions',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                points: 50,
                isPublished: true
            },
            {
                classroomId,
                teacherId,
                type: 'video',
                title: 'Object-Oriented Programming Basics',
                description: 'Watch this tutorial on classes, objects, and inheritance',
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                isPublished: true
            },
            {
                classroomId,
                teacherId,
                type: 'article',
                title: 'Best Practices in Code Organization',
                description: 'Read about clean code principles and project structure',
                url: 'https://example.com/clean-code',
                isPublished: true
            },
            {
                classroomId,
                teacherId,
                type: 'resource',
                title: 'Python Cheat Sheet',
                description: 'Quick reference guide for Python syntax and common functions',
                url: 'https://example.com/python-cheatsheet.pdf',
                isPublished: true
            },
            {
                classroomId,
                teacherId,
                type: 'announcement',
                title: 'Welcome to the Course!',
                description: 'Important information about course schedule and expectations',
                content: 'Classes will be held every Monday and Wednesday at 10 AM. Please complete all assignments on time.',
                isPublished: true
            }
        ];

        // Insert all materials
        const result = await Material.insertMany(mockMaterials);

        return NextResponse.json({
            success: true,
            message: `Created ${result.length} mock materials`,
            materialsCreated: result.length,
            classroomId
        });

    } catch (error) {
        console.error('Mock data error:', error);
        return NextResponse.json(
            { error: 'Failed to create mock materials', details: (error as Error).message },
            { status: 500 }
        );
    }
}
