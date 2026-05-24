import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClassroom extends Document {
    name: string;
    code: string;
    teacherId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ClassroomSchema: Schema<IClassroom> = new Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

const Classroom: Model<IClassroom> =
    mongoose.models.Classroom || mongoose.model<IClassroom>("Classroom", ClassroomSchema);

export default Classroom;
