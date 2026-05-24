'use client';

import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import styles from './OutputRenderer.module.css';

interface OutputRendererProps {
    content: string;
    format?: string;
}

// Component to render text with LaTeX math expressions
function MathText({ text }: { text: string }) {
    if (!text) return null;

    // Split text by LaTeX delimiters: $...$ for inline, $$...$$ for block
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Process block math first ($$...$$)
    const blockRegex = /\$\$([\s\S]*?)\$\$/g;
    const inlineRegex = /\$([^\$\n]+?)\$/g;

    // Replace block math
    remaining = remaining.replace(blockRegex, (match, formula) => {
        return `%%BLOCK_MATH_${key++}%%${formula}%%END_BLOCK%%`;
    });

    // Replace inline math
    remaining = remaining.replace(inlineRegex, (match, formula) => {
        return `%%INLINE_MATH_${key++}%%${formula}%%END_INLINE%%`;
    });

    // Now split and render
    const segments = remaining.split(/(%%(?:BLOCK|INLINE)_MATH_\d+%%[\s\S]*?%%END_(?:BLOCK|INLINE)%%)/);

    return (
        <>
            {segments.map((segment, idx) => {
                const blockMatch = segment.match(/%%BLOCK_MATH_\d+%%([\s\S]*?)%%END_BLOCK%%/);
                const inlineMatch = segment.match(/%%INLINE_MATH_\d+%%([\s\S]*?)%%END_INLINE%%/);

                if (blockMatch) {
                    try {
                        const html = katex.renderToString(blockMatch[1].trim(), { displayMode: true, throwOnError: false });
                        return <div key={idx} className={styles.mathBlock} dangerouslySetInnerHTML={{ __html: html }} />;
                    } catch {
                        return <span key={idx}>{blockMatch[1]}</span>;
                    }
                }

                if (inlineMatch) {
                    try {
                        const html = katex.renderToString(inlineMatch[1].trim(), { displayMode: false, throwOnError: false });
                        return <span key={idx} className={styles.mathInline} dangerouslySetInnerHTML={{ __html: html }} />;
                    } catch {
                        return <span key={idx}>{inlineMatch[1]}</span>;
                    }
                }

                return <span key={idx}>{segment}</span>;
            })}
        </>
    );
}

export const OutputRenderer = memo(function OutputRenderer({ content, format }: OutputRendererProps) {
    // Try to parse JSON content
    let parsedContent: any = null;
    let isJson = false;

    try {
        let jsonStr = content.trim();
        console.log('[OutputRenderer] Content received, length:', content?.length, 'first 100 chars:', jsonStr.substring(0, 100));

        // 1. Try extracting from code blocks first
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1].trim();
        }

        // 2. Aggressive JSON extraction: Find first '{' and last '}'
        // This handles cases like "Here is the JSON: { ... }" which fails startsWith('{')
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const candidate = jsonStr.substring(firstBrace, lastBrace + 1);
            try {
                parsedContent = JSON.parse(candidate);
                isJson = true;
            } catch (e) {
                // Sometmes the substring isn't valid JSON, fall back to original
                parsedContent = JSON.parse(jsonStr);
                isJson = true;
            }
        } else {
            // Try parsing as is (e.g. array starting with '[')
            parsedContent = JSON.parse(jsonStr);
            isJson = true;
        }
    } catch (e) {
        // Not JSON
        console.log('[OutputRenderer] JSON parse failed:', e);
    }

    // Determine render type
    console.log('[OutputRenderer] isJson:', isJson, 'parsedContent keys:', parsedContent ? Object.keys(parsedContent) : 'null');
    const isQuiz = isJson && (parsedContent?.questions || (Array.isArray(parsedContent) && parsedContent[0]?.question));
    const isFlashcards = isJson && (parsedContent?.cards || parsedContent?.flashcards || (Array.isArray(parsedContent) && parsedContent[0]?.front));
    const isCode = !isJson && (content.includes('```') || format === 'code');
    console.log('[OutputRenderer] isQuiz:', isQuiz, 'isFlashcards:', isFlashcards);

    if (isQuiz) {
        const questions = parsedContent.questions || parsedContent;
        return <QuizViewer data={questions} />;
    }

    if (isFlashcards) {
        const cards = parsedContent.cards || parsedContent.flashcards || parsedContent;
        return <FlashcardViewer data={cards} />;
    }

    // For code or markdown
    return (
        <div className={styles.textOutput}>
            <ReactMarkdown
                components={{
                    code({ className, children }) {
                        return (
                            <div className={styles.codeBlock}>
                                <pre><code className={className}>{children}</code></pre>
                            </div>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
});

function QuizViewer({ data, title = "Quiz" }: { data: any[], title?: string }) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    const getScore = () => {
        let correct = 0;
        data.forEach((q, idx) => {
            if (answers[idx] === q.answer) correct++;
        });
        return correct;
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(59, 130, 246); // Blue
        doc.text("Learnify Quiz", 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

        let yPos = 40;

        data.forEach((q, idx) => {
            // Check page break
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Question
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");

            const questionText = `Q${idx + 1}: ${q.question}`;
            const splitQuestion = doc.splitTextToSize(questionText, 180);
            doc.text(splitQuestion, 14, yPos);
            yPos += splitQuestion.length * 7;

            // Options
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(60);

            q.options?.forEach((opt: string) => {
                // Check page break for options
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                const splitOpt = doc.splitTextToSize(`• ${opt}`, 170);
                doc.text(splitOpt, 20, yPos);
                yPos += splitOpt.length * 6;
            });

            yPos += 10; // Spacing between questions
        });

        // Add Answer Key Page
        doc.addPage();
        doc.setFontSize(18);
        doc.setTextColor(0);
        doc.text("Answer Key", 14, 20);

        const answerData = data.map((q, i) => [`Q${i + 1}`, q.answer]);

        autoTable(doc, {
            startY: 30,
            head: [['Question', 'Correct Answer']],
            body: answerData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }
        });

        const safeTitle = (title || "quiz").replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`${safeTitle}_${Date.now()}.pdf`);
    };

    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className={styles.quizContainer}>
            <div className={styles.quizHeader}>
                <div className={styles.headerLeft}>
                    <span className={styles.quizBadge}>📝 Quiz</span>
                    <span className={styles.questionCount}>{data.length} Questions</span>
                </div>
                <button
                    className={styles.downloadBtn}
                    onClick={downloadPDF}
                    title="Download PDF"
                >
                    ⬇ PDF
                </button>
            </div>

            <div className={styles.questionsWrapper}>
                {data.map((q, idx) => (
                    <div key={idx} className={styles.questionCard}>
                        <div className={styles.questionNumber}>{idx + 1}</div>
                        <div className={styles.questionContent}>
                            <p className={styles.questionText}><MathText text={q.question} /></p>
                            <div className={styles.optionsGrid}>
                                {q.options?.map((opt: string, oIdx: number) => {
                                    const isSelected = answers[idx] === opt;
                                    const isCorrect = opt === q.answer;
                                    const showCorrect = showResults && isCorrect;
                                    const showWrong = showResults && isSelected && !isCorrect;

                                    return (
                                        <label
                                            key={oIdx}
                                            className={`${styles.optionLabel} ${isSelected ? styles.selected : ''} ${showCorrect ? styles.correct : ''} ${showWrong ? styles.wrong : ''}`}
                                        >
                                            <span className={styles.optionBadge}>{optionLabels[oIdx]}</span>
                                            <input
                                                type="radio"
                                                name={`q-${idx}`}
                                                value={opt}
                                                checked={isSelected}
                                                onChange={() => setAnswers({ ...answers, [idx]: opt })}
                                                disabled={showResults}
                                            />
                                            <span className={styles.optionText}><MathText text={opt} /></span>
                                            {showCorrect && <span className={styles.resultIcon}>✓</span>}
                                            {showWrong && <span className={styles.resultIcon}>✗</span>}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.quizFooter}>
                {showResults && (
                    <div className={styles.scoreDisplay}>
                        Score: <strong>{getScore()}</strong> / {data.length}
                    </div>
                )}
                <button
                    className={styles.submitBtn}
                    onClick={() => setShowResults(!showResults)}
                >
                    {showResults ? '🔄 Try Again' : '✅ Check Answers'}
                </button>
            </div>
        </div>
    );
}

function FlashcardViewer({ data }: { data: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const currentCard = data[currentIndex];

    const goNext = () => {
        if (currentIndex < data.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setFlipped(false);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setFlipped(false);
        }
    };

    return (
        <div className={styles.flashcardContainer}>
            <div className={styles.flashcardHeader}>
                <span className={styles.flashcardBadge}>🎴 Flashcards</span>
                <span className={styles.cardCounter}>
                    {currentIndex + 1} / {data.length}
                </span>
            </div>

            <div
                className={`${styles.flashcard} ${flipped ? styles.flipped : ''}`}
                onClick={() => setFlipped(!flipped)}
            >
                <div className={styles.cardInner}>
                    <div className={styles.cardFront}>
                        <span className={styles.cardLabel}>Question</span>
                        <p>{currentCard?.front || currentCard?.term || currentCard?.question}</p>
                    </div>
                    <div className={styles.cardBack}>
                        <span className={styles.cardLabel}>Answer</span>
                        <p>{currentCard?.back || currentCard?.definition || currentCard?.answer}</p>
                    </div>
                </div>
                <span className={styles.flipHint}>
                    {flipped ? '↩ Click to see question' : '👆 Click to reveal answer'}
                </span>
            </div>

            <div className={styles.flashcardNav}>
                <button
                    className={styles.navBtn}
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                >
                    ← Previous
                </button>
                <div className={styles.progressDots}>
                    {data.map((_, idx) => (
                        <span
                            key={idx}
                            className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`}
                            onClick={() => { setCurrentIndex(idx); setFlipped(false); }}
                        />
                    ))}
                </div>
                <button
                    className={styles.navBtn}
                    onClick={goNext}
                    disabled={currentIndex === data.length - 1}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
