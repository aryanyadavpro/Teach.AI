import mongoose, { Schema, Document, Model } from "mongoose";

export type LibraryItemType = "quiz" | "assignment" | "video" | "article" | "resource" | "notes" | "other";

export interface ILibraryItem extends Document {
    teacherId: mongoose.Types.ObjectId;
    type: LibraryItemType;
    title: string;
    description: string;
    content?: string; // Text/JSON content as string
    jsonData?: object; // Structured JSON data
    tags?: string[]; // Tags for categorization
    category?: string; // Optional category
    fileUrl?: string;
    videoUrl?: string;
    isPublic: boolean; // Can other teachers see this?
    createdAt: Date;
    updatedAt: Date;
}

const LibraryItemSchema: Schema<ILibraryItem> = new Schema(
    {
        teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["quiz", "assignment", "video", "article", "resource", "notes", "other"],
            required: true
        },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        content: { type: Schema.Types.Mixed },
        jsonData: { type: Schema.Types.Mixed },
        tags: [{ type: String }],
        category: { type: String },
        fileUrl: { type: String },
        videoUrl: { type: String },
        isPublic: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Indexes for efficient querying
LibraryItemSchema.index({ teacherId: 1, createdAt: -1 });
LibraryItemSchema.index({ type: 1 });
LibraryItemSchema.index({ tags: 1 });

const LibraryItem: Model<ILibraryItem> =
    mongoose.models.LibraryItem || mongoose.model<ILibraryItem>("LibraryItem", LibraryItemSchema);

export default LibraryItem;
