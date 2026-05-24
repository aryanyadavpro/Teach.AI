import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILibraryResource extends Document {
    teacherId: mongoose.Types.ObjectId;
    classroomId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    type: 'pdf' | 'doc' | 'ppt' | 'image' | 'other';
    fileName: string;
    fileUrl: string;
    cloudinaryPublicId: string;
    fileSize?: number;
    subject?: string;
    tags?: string[];
    downloadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const LibraryResourceSchema = new Schema<ILibraryResource>({
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['pdf', 'doc', 'ppt', 'image', 'other'],
        required: true
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    fileSize: { type: Number },
    subject: { type: String },
    tags: [{ type: String }],
    downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for efficient queries
LibraryResourceSchema.index({ teacherId: 1 });
LibraryResourceSchema.index({ classroomId: 1 });
LibraryResourceSchema.index({ type: 1 });

// Delete cached model if it exists to ensure fresh schema
if (mongoose.models.LibraryResource) {
    delete mongoose.models.LibraryResource;
}

const LibraryResource: Model<ILibraryResource> = mongoose.model<ILibraryResource>('LibraryResource', LibraryResourceSchema);

export default LibraryResource;
