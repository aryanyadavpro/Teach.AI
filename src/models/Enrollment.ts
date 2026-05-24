import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnrollment extends Document {
    studentId: mongoose.Types.ObjectId;
    classroomId: mongoose.Types.ObjectId;
    joinedAt: Date;
}

const EnrollmentSchema: Schema<IEnrollment> = new Schema(
    {
        studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        classroomId: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
        joinedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Ensure a student can only join a class once
EnrollmentSchema.index({ studentId: 1, classroomId: 1 }, { unique: true });

const Enrollment: Model<IEnrollment> =
    mongoose.models.Enrollment || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);

export async function findStudentEnrollment(
    studentId: string,
    classroomId: string | mongoose.Types.ObjectId
) {
    let classroomObjId: mongoose.Types.ObjectId;
    try {
        classroomObjId =
            typeof classroomId === "string"
                ? new mongoose.Types.ObjectId(classroomId)
                : classroomId;
    } catch {
        return null;
    }

    let studentObjId: mongoose.Types.ObjectId;
    try {
        studentObjId = new mongoose.Types.ObjectId(studentId);
    } catch {
        return null;
    }

    return Enrollment.findOne({
        classroomId: classroomObjId,
        $or: [{ studentId: studentObjId }, { studentId }],
    });
}

export async function isStudentEnrolled(
    studentId: string,
    classroomId: string | mongoose.Types.ObjectId
) {
    const enrollment = await findStudentEnrollment(studentId, classroomId);
    return enrollment !== null;
}

export default Enrollment;
