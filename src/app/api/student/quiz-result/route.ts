import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import QuizResult from '@/models/QuizResult';
import Material from '@/models/Material';
import User from '@/models/User';
import { isStudentEnrolled } from '@/models/Enrollment';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { error: 'Unauthorized. Students only.' },
                { status: 401 }
            );
        }

        await dbConnect();

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { materialId, classroomId, answers, timeTaken } = body;

        if (!materialId || !classroomId || !answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const enrolled = await isStudentEnrolled(session.user.id, classroomId);
        if (!enrolled) {
            return NextResponse.json(
                { error: 'You are not enrolled in this classroom' },
                { status: 403 }
            );
        }

        // Fetch the material to get questions
        const material = await Material.findById(materialId);
        if (!material) {
            return NextResponse.json(
                { error: 'Material not found' },
                { status: 404 }
            );
        }

        // Get questions from jsonData
        let questions: any[] = [];
        const jsonData = material.jsonData as any;

        if (jsonData?.questions) {
            questions = jsonData.questions;
        } else if (Array.isArray(jsonData)) {
            questions = jsonData;
        }

        if (questions.length === 0) {
            return NextResponse.json(
                { error: 'No questions found in this quiz' },
                { status: 400 }
            );
        }

        // Calculate score
        let correctCount = 0;

        // Helper to mimic frontend logic
        const getCorrectIndex = (q: any): number => {
            const numericCorrect = Number(q.correct);
            if (!isNaN(numericCorrect) && numericCorrect >= 0 && numericCorrect < (q.options?.length || 4)) {
                return numericCorrect;
            }
            if (q.answer) {
                const cleanAnswer = String(q.answer).trim();
                const match = cleanAnswer.match(/(?:^|Answer:?|Option)\s*([A-D])(?:$|[\s).:])/i);
                if (match && match[1]) {
                    return match[1].toUpperCase().charCodeAt(0) - 65;
                }
            }
            return -1;
        };

        const processedAnswers = answers.map((answer: { questionIndex: number; selectedAnswer: number }) => {
            const question = questions[answer.questionIndex];
            const correctIndex = question ? getCorrectIndex(question) : -1;
            const isCorrect = question && Number(answer.selectedAnswer) === correctIndex;

            if (isCorrect) correctCount++;
            return {
                questionIndex: answer.questionIndex,
                selectedAnswer: answer.selectedAnswer,
                isCorrect
            };
        });

        const totalQuestions = questions.length;
        const percentage = Math.round((correctCount / totalQuestions) * 100);

        // Save result
        const quizResult = new QuizResult({
            studentId: user._id,
            materialId: new mongoose.Types.ObjectId(materialId),
            classroomId: new mongoose.Types.ObjectId(classroomId),
            score: correctCount,
            totalQuestions,
            percentage,
            answers: processedAnswers,
            timeTaken,
            completedAt: new Date()
        });

        await quizResult.save();

        return NextResponse.json({
            success: true,
            result: {
                id: quizResult._id,
                score: correctCount,
                totalQuestions,
                percentage,
                completedAt: quizResult.completedAt
            }
        });

    } catch (error) {
        console.error('Error submitting quiz result:', error);
        return NextResponse.json(
            { error: 'Failed to submit quiz result' },
            { status: 500 }
        );
    }
}

// GET - Fetch quiz results for a student
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(request.url);
        const materialId = searchParams.get('materialId');
        const classroomId = searchParams.get('classroomId');

        const query: any = { studentId: user._id };
        if (materialId) query.materialId = new mongoose.Types.ObjectId(materialId);
        if (classroomId) query.classroomId = new mongoose.Types.ObjectId(classroomId);

        const results = await QuizResult.find(query)
            .populate('materialId', 'title type')
            .sort({ completedAt: -1 })
            .lean();

        return NextResponse.json({ results });

    } catch (error) {
        console.error('Error fetching quiz results:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quiz results' },
            { status: 500 }
        );
    }
}
