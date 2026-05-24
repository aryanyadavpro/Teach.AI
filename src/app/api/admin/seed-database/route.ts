import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Classroom from "@/models/Classroom";
import Enrollment from "@/models/Enrollment";
import Material from "@/models/Material";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        await connectDB();

        console.log('=== STARTING DATABASE SEED ===');

        // Step 1: Create Teacher
        const hashedPassword = await bcrypt.hash("teacher123", 10);
        const teacher = new User({
            name: "John Smith",
            email: "teacher@test.com",
            password: hashedPassword,
            role: "TEACHER"
        });
        await teacher.save();
        console.log('✅ Created teacher:', teacher.email, 'ID:', teacher._id.toString());

        // Step 2: Create Student
        const studentPassword = await bcrypt.hash("student123", 10);
        const student = new User({
            name: "Alice Johnson",
            email: "student@test.com",
            password: studentPassword,
            role: "STUDENT"
        });
        await student.save();
        console.log('✅ Created student:', student.email, 'ID:', student._id.toString());

        // Step 3: Create Classroom
        const classCode = 'ABC123';
        const classroom = new Classroom({
            name: "Introduction to Programming",
            code: classCode,
            teacherId: teacher._id,
            description: "Learn the basics of programming with Python"
        });
        await classroom.save();
        console.log('✅ Created classroom:', classroom.name, 'Code:', classCode, 'ID:', classroom._id.toString());

        // Step 4: Enroll Student (using ObjectId - the correct format)
        const enrollment = new Enrollment({
            studentId: student._id,
            classroomId: classroom._id,
            joinedAt: new Date()
        });
        await enrollment.save();
        console.log('✅ Created enrollment:', enrollment._id.toString());

        // Step 5: Create Materials
        const materials = [
            {
                classroomId: classroom._id,
                teacherId: teacher._id,
                type: 'assignment',
                title: 'Variables and Data Types Assignment',
                description: 'Complete exercises on variables, integers, strings, and booleans',
                content: 'Solve problems 1-15 from the textbook',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                points: 100,
                isPublished: true
            },
            {
                classroomId: classroom._id,
                teacherId: teacher._id,
                type: 'quiz',
                title: 'Functions and Loops Quiz',
                description: 'Test your understanding of functions, loops, and conditionals',
                content: '15 questions - 30 minutes',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                points: 50,
                isPublished: true
            },
            {
                classroomId: classroom._id,
                teacherId: teacher._id,
                type: 'video',
                title: 'Introduction to Python Tutorial',
                description: 'Watch this comprehensive video on Python basics',
                url: 'https://www.youtube.com/watch?v=example',
                isPublished: true
            },
            {
                classroomId: classroom._id,
                teacherId: teacher._id,
                type: 'article',
                title: 'Clean Code Principles',
                description: 'Essential reading on writing maintainable code',
                url: 'https://example.com/clean-code',
                isPublished: true
            },
            {
                classroomId: classroom._id,
                teacherId: teacher._id,
                type: 'announcement',
                title: 'Week 1 Schedule',
                description: 'Important dates and deadlines for this week',
                content: 'Monday: Introduction\nWednesday: Variables\nFriday: Quiz',
                isPublished: true
            }
        ];

        const createdMaterials = await Material.insertMany(materials);
        console.log(`✅ Created ${createdMaterials.length} materials`);

        // Step 6: Verify Enrollment Works
        console.log('\n=== VERIFICATION ===');

        // Test 1: Check enrollment exists
        const enrollmentCheck = await Enrollment.findOne({
            studentId: student._id,
            classroomId: classroom._id
        });
        console.log('✅ Enrollment verified:', enrollmentCheck ? 'FOUND' : 'NOT FOUND');

        // Test 2: Check materials can be fetched
        const materialsCheck = await Material.find({
            classroomId: classroom._id,
            isPublished: true
        });
        console.log(`✅ Materials count: ${materialsCheck.length}`);

        // Test 3: Verify with populated data
        const enrollmentWithClassroom = await Enrollment.findOne({
            studentId: student._id
        }).populate('classroomId');
        console.log('✅ Populated classroom:', enrollmentWithClassroom?.classroomId ? 'SUCCESS' : 'FAILED');

        console.log('\n=== SEED COMPLETE ===');

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully',
            credentials: {
                teacher: {
                    email: 'teacher@test.com',
                    password: 'teacher123'
                },
                student: {
                    email: 'student@test.com',
                    password: 'student123'
                }
            },
            data: {
                teacherId: teacher._id.toString(),
                studentId: student._id.toString(),
                classroomId: classroom._id.toString(),
                classroomCode: classCode,
                enrollmentId: enrollment._id.toString(),
                materialsCount: createdMaterials.length
            },
            verification: {
                enrollmentExists: !!enrollmentCheck,
                materialsFound: materialsCheck.length,
                populatedData: !!enrollmentWithClassroom?.classroomId
            }
        });

    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Seed failed',
                details: (error as Error).message
            },
            { status: 500 }
        );
    }
}
