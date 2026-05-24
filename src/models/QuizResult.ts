import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizResult extends Document {
    studentId: mongoose.Types.ObjectId;
    materialId: mongoose.Types.ObjectId;
    classroomId: mongoose.Types.ObjectId;
    score: number;
    totalQuestions: number;
    percentage: number;
    answers: {
        questionIndex: number;
        selectedAnswer: number;
        isCorrect: boolean;
    }[];
    timeTaken?: number; // in seconds
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    answers: [{
        questionIndex: { type: Number, required: true },
        selectedAnswer: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true }
    }],
    timeTaken: { type: Number },
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index for efficient queries
QuizResultSchema.index({ studentId: 1, materialId: 1 });
QuizResultSchema.index({ classroomId: 1, studentId: 1 });

export default mongoose.models.QuizResult || mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
