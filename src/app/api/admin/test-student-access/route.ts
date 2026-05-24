import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Enrollment from "@/models/Enrollment";
import Material from "@/models/Material";
import Classroom from "@/models/Classroom";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password required' },
                { status: 400 }
            );
        }

        await connectDB();

        console.log('\n=== TESTING STUDENT ACCESS ===');
        console.log('Testing with:', email);

        // Step 1: Find the student
        const student = await User.findOne({ email, role: 'STUDENT' });
        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }
        console.log('✅ Student found:', student.name, 'ID:', student._id.toString());

        // Step 2: Find enrollments
        const enrollments = await Enrollment.find({ studentId: student._id })
            .populate('classroomId')
            .lean();
        console.log(`✅ Enrollments found: ${enrollments.length}`);

        const classroomData = [];

        // Step 3: For each enrollment, check classroom access
        for (const enrollment of enrollments) {
            const classroom = enrollment.classroomId as any;
            console.log(`\n--- Testing Classroom: ${classroom.name} ---`);
            console.log('Classroom ID:', classroom._id.toString());
            console.log('Code:', classroom.code);

            // Test materials access
            const materials = await Material.find({
                classroomId: classroom._id,
                isPublished: true
            }).lean();

            console.log(`✅ Materials accessible: ${materials.length}`);

            // Group materials by type
            const grouped = {
                assignments: materials.filter(m => m.type === 'assignment').length,
                quizzes: materials.filter(m => m.type === 'quiz').length,
                videos: materials.filter(m => m.type === 'video').length,
                articles: materials.filter(m => m.type === 'article').length,
                resources: materials.filter(m => m.type === 'resource').length,
                announcements: materials.filter(m => m.type === 'announcement').length
            };

            console.log('Materials by type:', grouped);

            classroomData.push({
                classroomId: classroom._id.toString(),
                classroomName: classroom.name,
                classroomCode: classroom.code,
                enrollmentId: enrollment._id.toString(),
                materialsCount: materials.length,
                materialsByType: grouped,
                materials: materials.map(m => ({
                    id: m._id.toString(),
                    type: m.type,
                    title: m.title,
                    description: m.description
                }))
            });
        }

        console.log('\n=== TEST COMPLETE ===');

        return NextResponse.json({
            success: true,
            message: 'Student access test completed',
            studentInfo: {
                id: student._id.toString(),
                name: student.name,
                email: student.email,
                role: student.role
            },
            totalEnrollments: enrollments.length,
            classrooms: classroomData,
            testResults: {
                canFindStudent: true,
                canFindEnrollments: enrollments.length > 0,
                canAccessClassrooms: classroomData.length > 0,
                canAccessMaterials: classroomData.some(c => c.materialsCount > 0)
            }
        });

    } catch (error) {
        console.error('Test error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Test failed',
                details: (error as Error).message
            },
            { status: 500 }
        );
    }
}
