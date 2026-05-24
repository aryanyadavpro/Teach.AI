'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './MaterialModal.module.css';
import QuizPlayer from './QuizPlayer';

interface Flashcard {
    front: string;
    back: string;
}

interface MaterialModalProps {
    material: {
        _id: string;
        type: string;
        title: string;
        description: string;
        content?: string;
        jsonData?: any;
        teacher?: { name: string };
        createdAt?: string;
    };
    onClose: () => void;
    // classroomId is needed for QuizPlayer to save results
    // We can try to get it from URL params or assume it's available via props in a real app
    // For now we will accept it as an optional prop or fallback to URL extraction if needed,
    // but the component calling this usually knows the context.
    // However, looking at usage in EnrolledClassrooms, it doesn't pass classroomId.
    // We'll update the interface to accept it, but for now we might need to extract it from URL.
}

export default function MaterialModal({ material, onClose }: MaterialModalProps) {
    const [mounted, setMounted] = useState(false);
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Extract classroomId from URL if possible, since it's not passed as prop
    // In /student/classroom/[classroomId], we can use useParams, but this modal might be used elsewhere.
    // Let's rely on window.location for now or safer: useParams from next/navigation
    // But we need to import useParams.

    // Actually, let's keep it simple. If it's a quiz, we render the QuizPlayer. 
    // The QuizPlayer needs classroomId. 
    // We will assume the parent component *should* pass it, but if not we can try to get it from the URL
    // or pass a dummy one if strictly viewing.

    // Parse flashcards from jsonData
    const getFlashcards = (): Flashcard[] => {
        if (!material.jsonData) return [];
        if (Array.isArray(material.jsonData.flashcards)) {
            return material.jsonData.flashcards;
        }
        if (Array.isArray(material.jsonData)) {
            return material.jsonData.map((item: any) => ({
                front: item.front || item.question || item.term || '',
                back: item.back || item.answer || item.definition || ''
            }));
        }
        return [];
    };

    const flashcards = getFlashcards();

    const renderArticleContent = () => {
        const content = material.content || material.jsonData?.content || '';
        return (
            <div className={styles.articleContent}>
                <div className={styles.articleText} dangerouslySetInnerHTML={{
                    __html: content.replace(/\n/g, '<br/>')
                }} />
            </div>
        );
    };

    const renderFlashcards = () => {
        if (flashcards.length === 0) {
            return <div className={styles.emptyContent}>No flashcards available</div>;
        }

        const card = flashcards[currentCard];
        return (
            <div className={styles.flashcardContainer}>
                <div className={styles.flashcardProgress}>
                    Card {currentCard + 1} of {flashcards.length}
                </div>

                <div
                    className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className={styles.flashcardInner}>
                        <div className={styles.flashcardFront}>
                            <span className={styles.flipHint}>Click to flip</span>
                            <p>{card.front}</p>
                        </div>
                        <div className={styles.flashcardBack}>
                            <span className={styles.flipHint}>Click to flip</span>
                            <p>{card.back}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.flashcardNav}>
                    <button
                        onClick={() => { setCurrentCard(Math.max(0, currentCard - 1)); setIsFlipped(false); }}
                        disabled={currentCard === 0}
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={() => { setCurrentCard(Math.min(flashcards.length - 1, currentCard + 1)); setIsFlipped(false); }}
                        disabled={currentCard === flashcards.length - 1}
                    >
                        Next →
                    </button>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (material.type === 'quiz') {
            // We need classroomId for the QuizPlayer. 
            // Since we are in the modal, we can try to grab it from the URL
            const pathParts = window.location.pathname.split('/');
            const classroomIdIndex = pathParts.indexOf('classroom') + 1;
            const classroomId = classroomIdIndex > 0 && pathParts[classroomIdIndex] ? pathParts[classroomIdIndex] : 'unknown';

            return (
                <div className={styles.quizWrapper}>
                    <QuizPlayer
                        materialId={material._id}
                        classroomId={classroomId}
                        title={material.title}
                        questions={material.jsonData?.questions || []}
                        onComplete={() => { }}
                        onClose={onClose}
                    />
                </div>
            );
        }

        switch (material.type) {
            case 'article':
            case 'announcement':
            case 'resource':
                if (flashcards.length > 0) {
                    return renderFlashcards();
                }
                return renderArticleContent();
            default:
                if (flashcards.length > 0) {
                    return renderFlashcards();
                }
                return renderArticleContent();
        }
    };

    const materialIcons: Record<string, string> = {
        quiz: '📊',
        assignment: '📝',
        video: '🎥',
        article: '📄',
        resource: '📚',
        announcement: '📢'
    };

    if (!mounted) return null;

    // Use a portal to render the modal at the end of the document body
    // This helps avoid layout issues and z-index wars with other fixed elements (like navbar)
    const modalContent = material.type === 'quiz' ? (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} ${styles.quizModal}`} onClick={(e) => e.stopPropagation()}>
                {renderContent()}
            </div>
        </div>
    ) : (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleArea}>
                        <span className={styles.icon}>{materialIcons[material.type] || '📄'}</span>
                        <div>
                            <h2 className={styles.title}>{material.title}</h2>
                            <p className={styles.meta}>
                                {material.teacher?.name && <span>By {material.teacher.name}</span>}
                                {material.createdAt && (
                                    <span> • {new Date(material.createdAt).toLocaleDateString()}</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.body}>
                    {material.description && (
                        <p className={styles.description}>{material.description}</p>
                    )}
                    {renderContent()}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
