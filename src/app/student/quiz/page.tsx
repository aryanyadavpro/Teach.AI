'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/student/Navbar';
import styles from './page.module.css';

interface Question {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
}

const quizzes: Record<string, { title: string; subject: string; totalQuestions: number; timeLimit: string; questions: Question[] }> = {
    'biology': {
        title: 'Biology: Plant Systems',
        subject: 'Science',
        totalQuestions: 5,
        timeLimit: '10 min',
        questions: [
            {
                id: 1,
                question: 'What is the primary function of roots in plants?',
                options: ['Photosynthesis', 'Absorption of water and minerals', 'Producing flowers', 'Storing food'],
                correct: 1,
                explanation: 'Roots primarily absorb water and dissolved minerals from the soil and anchor the plant.'
            },
            {
                id: 2,
                question: 'Which part of the plant is responsible for photosynthesis?',
                options: ['Roots', 'Stem', 'Leaves', 'Flowers'],
                correct: 2,
                explanation: 'Leaves contain chlorophyll which captures sunlight for photosynthesis.'
            },
            {
                id: 3,
                question: 'What is the function of xylem in plants?',
                options: ['Transport of food', 'Transport of water', 'Photosynthesis', 'Reproduction'],
                correct: 1,
                explanation: 'Xylem transports water and minerals from roots to other parts of the plant.'
            },
            {
                id: 4,
                question: 'Which gas do plants release during photosynthesis?',
                options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'],
                correct: 2,
                explanation: 'Plants release oxygen as a byproduct of photosynthesis while absorbing CO₂.'
            },
            {
                id: 5,
                question: 'What is the role of stomata in leaves?',
                options: ['Absorption of water', 'Gas exchange', 'Food storage', 'Support'],
                correct: 1,
                explanation: 'Stomata are tiny pores that allow gas exchange (CO₂ in, O₂ out) and water vapor release.'
            }
        ]
    }
};

function QuizContent() {
    const searchParams = useSearchParams();
    const quizId = searchParams.get('id') || 'biology';
    const quiz = quizzes[quizId] || quizzes['biology'];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null));
    const [quizCompleted, setQuizCompleted] = useState(false);

    const handleAnswerSelect = (optionIndex: number) => {
        if (showResult) return;
        setSelectedAnswer(optionIndex);
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleCheckAnswer = () => {
        setShowResult(true);
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(answers[currentQuestion + 1]);
            setShowResult(false);
        } else {
            setQuizCompleted(true);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setSelectedAnswer(answers[currentQuestion - 1]);
            setShowResult(answers[currentQuestion - 1] !== null);
        }
    };

    const calculateScore = (): number => {
        return answers.reduce<number>((acc, answer, idx) => {
            return answer === quiz.questions[idx].correct ? acc + 1 : acc;
        }, 0);
    };

    const question = quiz.questions[currentQuestion];
    const score = calculateScore();
    const percentage = Math.round((score / quiz.questions.length) * 100);

    if (quizCompleted) {
        return (
            <div className={styles.quizPage}>
                <Navbar />
                <div className={styles.mainContainer}>
                    <div className={styles.resultsCard}>
                        <div className={styles.resultsEmoji}>
                            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
                        </div>
                        <h1 className={styles.resultsTitle}>
                            {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                        </h1>
                        <div className={styles.scoreCircle}>
                            <span className={styles.scoreValue}>{percentage}%</span>
                            <span className={styles.scoreLabel}>Score</span>
                        </div>
                        <div className={styles.scoreDetails}>
                            <div className={styles.scoreItem}>
                                <span>✅</span>
                                <span>Correct: {score}</span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span>❌</span>
                                <span>Incorrect: {quiz.questions.length - score}</span>
                            </div>
                        </div>
                        <div className={styles.resultsActions}>
                            <button
                                className={styles.retryBtn}
                                onClick={() => {
                                    setCurrentQuestion(0);
                                    setSelectedAnswer(null);
                                    setShowResult(false);
                                    setAnswers(new Array(quiz.questions.length).fill(null));
                                    setQuizCompleted(false);
                                }}
                            >
                                🔄 Retry Quiz
                            </button>
                            <Link href="/student/dashboard" className={styles.homeBtn}>
                                🏠 Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.quizPage}>
            <Navbar />
            <div className={styles.mainContainer}>
                {/* Back Button */}
                <Link href="/student/dashboard" className={styles.backBtn}>
                    ← Back to Dashboard
                </Link>

                {/* Quiz Header */}
                <div className={styles.quizHeader}>
                    <div>
                        <span className={styles.subjectBadge}>{quiz.subject}</span>
                        <h1 className={styles.quizTitle}>{quiz.title}</h1>
                    </div>
                    <div className={styles.quizMeta}>
                        <span className={styles.timer}>⏱️ {quiz.timeLimit}</span>
                        <span className={styles.questionCount}>
                            Question {currentQuestion + 1} of {quiz.questions.length}
                        </span>
                    </div>
                </div>

                {/* Progress */}
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className={styles.questionCard}>
                    <h2 className={styles.questionText}>{question.question}</h2>

                    <div className={styles.optionsList}>
                        {question.options.map((option, idx) => (
                            <button
                                key={idx}
                                className={`${styles.optionBtn} ${selectedAnswer === idx ? styles.selected : ''} ${showResult && idx === question.correct ? styles.correct : ''
                                    } ${showResult && selectedAnswer === idx && idx !== question.correct ? styles.incorrect : ''}`}
                                onClick={() => handleAnswerSelect(idx)}
                            >
                                <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                                <span className={styles.optionText}>{option}</span>
                                {showResult && idx === question.correct && <span className={styles.checkIcon}>✓</span>}
                                {showResult && selectedAnswer === idx && idx !== question.correct && <span className={styles.wrongIcon}>✗</span>}
                            </button>
                        ))}
                    </div>

                    {/* Explanation */}
                    {showResult && (
                        <div className={`${styles.explanation} ${selectedAnswer === question.correct ? styles.correctExplanation : styles.incorrectExplanation}`}>
                            <strong>{selectedAnswer === question.correct ? '✅ Correct!' : '❌ Incorrect'}</strong>
                            <p>{question.explanation}</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className={styles.quizNav}>
                    <button
                        className={styles.navBtn}
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                    >
                        ← Previous
                    </button>

                    {!showResult ? (
                        <button
                            className={styles.checkBtn}
                            onClick={handleCheckAnswer}
                            disabled={selectedAnswer === null}
                        >
                            Check Answer
                        </button>
                    ) : (
                        <button className={styles.nextBtn} onClick={handleNext}>
                            {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next →'}
                        </button>
                    )}
                </div>

                {/* Question Navigation Dots */}
                <div className={styles.questionDots}>
                    {quiz.questions.map((_, idx) => (
                        <button
                            key={idx}
                            className={`${styles.dot} ${idx === currentQuestion ? styles.activeDot : ''} ${answers[idx] !== null ? styles.answeredDot : ''
                                }`}
                            onClick={() => {
                                setCurrentQuestion(idx);
                                setSelectedAnswer(answers[idx]);
                                setShowResult(answers[idx] !== null);
                            }}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function QuizPage() {
    return (
        <Suspense fallback={<div className={styles.quizPage}><Navbar /><div className={styles.mainContainer}>Loading quiz...</div></div>}>
            <QuizContent />
        </Suspense>
    );
}
