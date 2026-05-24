/**
 * Seed Script for Classroom Testing
 * 
 * Usage: node scripts/seed-classroom.mjs
 * 
 * This script will:
 * 1. Find or create a test classroom
 * 2. Create an enrollment for the current student user
 * 3. Add sample materials to the classroom
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

// Define schemas inline to avoid import issues
const ClassroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const EnrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const MaterialSchema = new mongoose.Schema({
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['quiz', 'assignment', 'video', 'article', 'resource', 'announcement'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String },
    fileUrl: { type: String },
    videoUrl: { type: String },
    dueDate: { type: Date },
    points: { type: Number },
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    role: String,
});

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB!');

        // Get or create models
        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        const Classroom = mongoose.models.Classroom || mongoose.model('Classroom', ClassroomSchema);
        const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);
        const Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);

        // Find all students
        const students = await User.find({ role: 'STUDENT' });
        console.log(`Found ${students.length} students:`, students.map(s => ({ id: s._id, email: s.email })));

        if (students.length === 0) {
            console.log('No students found. Creating a test student...');
            const testStudent = await User.create({
                name: 'Test Student',
                email: 'teststudent@example.com',
                role: 'STUDENT'
            });
            students.push(testStudent);
        }

        // Find all teachers
        const teachers = await User.find({ role: 'TEACHER' });
        console.log(`Found ${teachers.length} teachers:`, teachers.map(t => ({ id: t._id, email: t.email })));

        let teacherId;
        if (teachers.length === 0) {
            console.log('No teachers found. Creating a test teacher...');
            const testTeacher = await User.create({
                name: 'Test Teacher',
                email: 'testteacher@example.com',
                role: 'TEACHER'
            });
            teacherId = testTeacher._id;
        } else {
            teacherId = teachers[0]._id;
        }

        // Check existing classrooms
        const existingClassrooms = await Classroom.find({});
        console.log(`Found ${existingClassrooms.length} classrooms:`, existingClassrooms.map(c => ({ id: c._id, name: c.name, code: c.code })));

        // Create a test classroom if none exist
        let classroom;
        if (existingClassrooms.length === 0) {
            console.log('Creating a test classroom...');
            classroom = await Classroom.create({
                name: 'JEE Physics - Test Class',
                code: 'PHYS01',
                teacherId: teacherId
            });
            console.log('Created classroom:', { id: classroom._id, name: classroom.name });
        } else {
            classroom = existingClassrooms[0];
            console.log('Using existing classroom:', { id: classroom._id, name: classroom.name });
        }

        // Create enrollments for all students in this classroom
        for (const student of students) {
            const existingEnrollment = await Enrollment.findOne({
                studentId: student._id,
                classroomId: classroom._id
            });

            if (existingEnrollment) {
                console.log(`Student ${student.email} already enrolled in ${classroom.name}`);
            } else {
                const enrollment = await Enrollment.create({
                    studentId: student._id,
                    classroomId: classroom._id,
                    joinedAt: new Date()
                });
                console.log(`Created enrollment for ${student.email} in ${classroom.name}:`, {
                    enrollmentId: enrollment._id,
                    studentId: enrollment.studentId,
                    classroomId: enrollment.classroomId
                });
            }
        }

        // Check existing materials
        const existingMaterials = await Material.find({ classroomId: classroom._id });
        console.log(`Found ${existingMaterials.length} materials in classroom`);

        // Add sample materials if none exist
        if (existingMaterials.length === 0) {
            console.log('Adding sample materials...');

            const sampleMaterials = [
                {
                    type: 'announcement',
                    title: 'Welcome to JEE Physics!',
                    description: 'Welcome to the class. We will cover all important topics for JEE preparation.',
                    content: 'Hello students! This is your first step towards JEE success. We will cover Mechanics, Thermodynamics, Electromagnetism, and Modern Physics.'
                },
                {
                    type: 'video',
                    title: 'Newton\'s Laws of Motion - Introduction',
                    description: 'Learn the fundamental laws of motion that govern our universe.',
                    videoUrl: 'https://www.youtube.com/watch?v=example1'
                },
                {
                    type: 'assignment',
                    title: 'Practice Problems: Kinematics',
                    description: 'Solve these 10 problems on kinematics to test your understanding.',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                    points: 100
                },
                {
                    type: 'quiz',
                    title: 'Quick Quiz: Motion in One Dimension',
                    description: 'A short quiz to test your understanding of 1D motion concepts.',
                    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                    points: 50
                },
                {
                    type: 'article',
                    title: 'Understanding Vectors',
                    description: 'A comprehensive guide to vector operations for physics.',
                    content: 'Vectors are quantities that have both magnitude and direction. In physics, we use vectors to represent displacement, velocity, acceleration, force, and many other quantities...'
                },
                {
                    type: 'resource',
                    title: 'JEE Physics Formula Sheet',
                    description: 'Download this formula sheet for quick revision.',
                    fileUrl: '/resources/jee-physics-formulas.pdf'
                }
            ];

            for (const mat of sampleMaterials) {
                await Material.create({
                    ...mat,
                    classroomId: classroom._id,
                    teacherId: teacherId,
                    isPublished: true
                });
            }

            console.log('Added', sampleMaterials.length, 'sample materials');
        }

        // List all enrollments for verification
        const allEnrollments = await Enrollment.find({}).populate('studentId').populate('classroomId');
        console.log('\n=== ALL ENROLLMENTS ===');
        for (const e of allEnrollments) {
            console.log({
                enrollmentId: e._id.toString(),
                studentId: e.studentId?._id?.toString() || e.studentId,
                studentEmail: e.studentId?.email,
                classroomId: e.classroomId?._id?.toString() || e.classroomId,
                classroomName: e.classroomId?.name
            });
        }

        console.log('\n✅ Seed complete!');
        console.log('\nTo test, visit: http://localhost:3000/student/classroom/' + classroom._id);

    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seed();
