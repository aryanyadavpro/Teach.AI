/**
 * Seed Script for Classroom Testing
 * Run: node scripts/seed-classroom.js
 */

const mongoose = require('mongoose');

// MongoDB URI (from .env.local)
const MONGODB_URI = 'mongodb+srv://aryanyad74_db_user:RRhpxyF0ikY3AsbC@cluster0.gyuut8t.mongodb.net/?retryWrites=true&w=majority';

// Define schemas
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
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: String,
    dueDate: Date,
    points: Number,
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
});

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        const Classroom = mongoose.models.Classroom || mongoose.model('Classroom', ClassroomSchema);
        const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);
        const Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);

        // Find students
        const students = await User.find({ role: 'STUDENT' });
        console.log('Students found:', students.length);
        students.forEach(s => console.log('  -', s._id.toString(), s.email));

        // Find teachers
        const teachers = await User.find({ role: 'TEACHER' });
        console.log('Teachers found:', teachers.length);

        // Find classrooms
        const classrooms = await Classroom.find({});
        console.log('Classrooms:', classrooms.map(c => ({ id: c._id.toString(), name: c.name })));

        // Find all enrollments
        const enrollments = await Enrollment.find({});
        console.log('\n=== ENROLLMENTS ===');
        enrollments.forEach(e => {
            console.log({
                enrollmentId: e._id.toString(),
                studentId: e.studentId.toString(),
                classroomId: e.classroomId.toString()
            });
        });

        // If we have students and classrooms but no matching enrollments, create them
        if (students.length > 0 && classrooms.length > 0) {
            const classroom = classrooms[0];
            const student = students[0];

            const existing = await Enrollment.findOne({
                studentId: student._id,
                classroomId: classroom._id
            });

            if (!existing) {
                console.log('\nCreating enrollment for student', student.email, 'in classroom', classroom.name);
                const newEnrollment = await Enrollment.create({
                    studentId: student._id,
                    classroomId: classroom._id,
                    joinedAt: new Date()
                });
                console.log('Created:', newEnrollment._id.toString());
            } else {
                console.log('\nEnrollment already exists');
            }

            // Check materials
            const mats = await Material.find({ classroomId: classroom._id });
            console.log('\nMaterials in classroom:', mats.length);

            if (mats.length === 0 && teachers.length > 0) {
                console.log('Adding sample materials...');
                await Material.create({
                    classroomId: classroom._id,
                    teacherId: teachers[0]._id,
                    type: 'announcement',
                    title: 'Welcome to Class!',
                    description: 'Welcome everyone to this class.'
                });
                await Material.create({
                    classroomId: classroom._id,
                    teacherId: teachers[0]._id,
                    type: 'quiz',
                    title: 'Sample Quiz',
                    description: 'Test your knowledge',
                    points: 50
                });
                console.log('Added 2 sample materials');
            }
        }

        console.log('\n✅ Done!');
        console.log('Test URL: http://localhost:3000/student/classroom/' + (classrooms[0]?._id || 'NO_CLASSROOM'));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
