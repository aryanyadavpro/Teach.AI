'use client';

import { useState, useEffect } from 'react';
import {
    Check,
    X,
    Award,
    ThumbsUp,
    BookOpen,
    PartyPopper,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    XCircle
} from 'lucide-react';
import styles from './QuizPlayer.module.css';

interface Question {
    question: string;
    options: string[];
    correct: number;
    explanation?: string;
    answer?: string;
}

interface QuizPlayerProps {
    materialId: string;
    classroomId: string;
    title: string;
    questions: Question[];
    onComplete: (result: { score: number; total: number; percentage: number }) => void;
    onClose: () => void;
}

export default function QuizPlayer({
    materialId,
    classroomId,
    title,
    questions,
    onComplete,
    onClose
}: QuizPlayerProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
    const [quizComplete, setQuizComplete] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime] = useState(Date.now());
    const [finalResult, setFinalResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

    const question = questions[currentQuestion];

    // Helper to determine the correct index dynamically
    const getCorrectIndex = (q: Question): number => {
        // 1. Try numeric 'correct' field (handling string numbers like "1")
        const numericCorrect = Number(q.correct);
        if (!isNaN(numericCorrect) && numericCorrect >= 0 && numericCorrect < q.options.length) {
            return numericCorrect;
        }

        // 2. Try parsing 'answer' string field (e.g., "Answer: B)", "B", "Option B")
        if (q.answer) {
            const cleanAnswer = q.answer.trim();
            // Regex to find "A", "B", "C", "D" at the start, or after "Answer:"
            const match = cleanAnswer.match(/(?:^|Answer:?|Option)\s*([A-D])(?:$|[\s).:])/i);

            if (match && match[1]) {
                return match[1].toUpperCase().charCodeAt(0) - 65;
            }
        }

        return -1; // Could not determine
    };

    const currentCorrectIndex = getCorrectIndex(question);

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
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(answers[currentQuestion + 1]);
            setShowResult(false);
        } else {
            submitQuiz();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setSelectedAnswer(answers[currentQuestion - 1]);
            setShowResult(answers[currentQuestion - 1] !== null);
        }
    };

    const calculateScore = () => {
        return answers.reduce((acc: number, answer, idx) => {
            if (answer === null) return acc;
            const q = questions[idx];
            return Number(answer) === getCorrectIndex(q) ? acc + 1 : acc;
        }, 0);
    };

    const submitQuiz = async () => {
        setIsSubmitting(true);
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        const score = calculateScore();
        const percentage = Math.round((score / questions.length) * 100);

        try {
            const response = await fetch('/api/student/quiz-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    materialId,
                    classroomId,
                    answers: answers.map((answer, idx) => ({
                        questionIndex: idx,
                        selectedAnswer: answer ?? -1
                    })),
                    timeTaken
                })
            });

            if (response.ok) {
                setFinalResult({ score, total: questions.length, percentage });
                setQuizComplete(true);
                onComplete({ score, total: questions.length, percentage });
            } else {
                alert('Failed to submit quiz. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Error submitting quiz. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (quizComplete && finalResult) {
        return (
            <div className={`${styles.container} animate-fade-in`}>
                <div className={styles.resultsCard}>
                    <div className={styles.resultsEmoji}>
                        {finalResult.percentage >= 80 ? (
                            <PartyPopper size={64} className="text-yellow-500" />
                        ) : finalResult.percentage >= 60 ? (
                            <ThumbsUp size={64} className="text-blue-500" />
                        ) : (
                            <BookOpen size={64} className="text-purple-500" />
                        )}
                    </div>
                    <h2 className={styles.resultsTitle}>
                        {finalResult.percentage >= 80 ? 'Excellent!' : finalResult.percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                    </h2>
                    <div className={styles.scoreCircle}>
                        <span className={styles.scoreValue}>{finalResult.percentage}%</span>
                        <span className={styles.scoreLabel}>Score</span>
                    </div>
                    <div className={styles.scoreDetails}>
                        <div className={styles.scoreItem}>
                            <span className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Correct:</span>
                            <strong>{finalResult.score}</strong>
                        </div>
                        <div className={styles.scoreItem}>
                            <span className="flex items-center gap-2"><XCircle size={18} className="text-red-500" /> Incorrect:</span>
                            <strong>{finalResult.total - finalResult.score}</strong>
                        </div>
                    </div>
                    <p className={styles.savedMessage}><Check size={16} className="inline mr-1" /> Your result has been saved!</p>
                    <button className={styles.closeBtn} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} animate-fade-in`}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.progress}>
                    Question {currentQuestion + 1} of {questions.length}
                </div>
            </div>

            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
            </div>

            <div className={styles.questionCard}>
                <div className={styles.questionNumber}>Q{currentQuestion + 1}</div>
                <h4 className={styles.questionText}>{question.question}</h4>

                <div className={styles.optionsList}>
                    {question.options.map((option, idx) => (
                        <button
                            key={idx}
                            className={`${styles.optionBtn} 
                                ${selectedAnswer === idx ? styles.selected : ''} 
                                ${showResult && idx === currentCorrectIndex ? styles.correct : ''} 
                                ${showResult && selectedAnswer === idx && idx !== currentCorrectIndex ? styles.incorrect : ''}`}
                            onClick={() => handleAnswerSelect(idx)}
                            disabled={showResult}
                        >
                            <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                            <span className={styles.optionText}>{option}</span>
                            {showResult && idx === currentCorrectIndex && <Check size={20} className={styles.checkIcon} />}
                            {showResult && selectedAnswer === idx && idx !== currentCorrectIndex && <X size={20} className={styles.wrongIcon} />}
                        </button>
                    ))}
                </div>

                {showResult && question.explanation && (
                    <div className={`${styles.explanation} ${selectedAnswer === currentCorrectIndex ? styles.correctExp : styles.incorrectExp}`}>
                        <div className="flex items-center gap-2 font-bold mb-1">
                            {selectedAnswer === currentCorrectIndex ? (
                                <><CheckCircle size={18} /> Correct!</>
                            ) : (
                                <><XCircle size={18} /> Incorrect</>
                            )}
                        </div>
                        <p>{question.explanation}</p>
                    </div>
                )}
            </div>

            <div className={styles.navigation}>
                <button
                    className={styles.navBtn}
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                >
                    <ArrowLeft size={16} /> Previous
                </button>

                <div className={styles.questionDots}>
                    {questions.map((_, idx) => (
                        <button
                            key={idx}
                            className={`${styles.dot} 
                                ${idx === currentQuestion ? styles.activeDot : ''} 
                                ${answers[idx] !== null ? styles.answeredDot : ''}`}
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

                {!showResult ? (
                    <button
                        className={styles.checkBtn}
                        onClick={handleCheckAnswer}
                        disabled={selectedAnswer === null}
                    >
                        Check <Check size={16} />
                    </button>
                ) : (
                    <button
                        className={styles.nextBtn}
                        onClick={handleNext}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : currentQuestion === questions.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
