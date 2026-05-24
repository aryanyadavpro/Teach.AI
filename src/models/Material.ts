import mongoose, { Schema, Document, Model } from "mongoose";

export type MaterialType = "quiz" | "assignment" | "video" | "article" | "resource" | "announcement";

export interface IMaterial extends Document {
    classroomId: mongoose.Types.ObjectId;
    teacherId: mongoose.Types.ObjectId;
    type: MaterialType;
    title: string;
    description: string;
    content?: string | object; // Can be string or JSON object
    jsonData?: object; // For storing structured JSON data
    fileUrl?: string; // For uploaded files
    videoUrl?: string; // For videos
    dueDate?: Date; // For assignments/quizzes
    points?: number; // For gradeable items
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MaterialSchema: Schema<IMaterial> = new Schema(
    {
        classroomId: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
        teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["quiz", "assignment", "video", "article", "resource", "announcement"],
            required: true
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        content: { type: Schema.Types.Mixed }, // Changed to Mixed for JSON support
        jsonData: { type: Schema.Types.Mixed }, // Additional JSON storage field
        fileUrl: { type: String },
        videoUrl: { type: String },
        dueDate: { type: Date },
        points: { type: Number },
        isPublished: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Index for efficient querying
MaterialSchema.index({ classroomId: 1, createdAt: -1 });
MaterialSchema.index({ teacherId: 1 });

const Material: Model<IMaterial> =
    mongoose.models.Material || mongoose.model<IMaterial>("Material", MaterialSchema);

export default Material;
