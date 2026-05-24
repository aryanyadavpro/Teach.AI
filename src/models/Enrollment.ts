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

export default Enrollment;
