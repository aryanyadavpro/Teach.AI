'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/student/Navbar';
import styles from './page.module.css';

const articles: Record<string, { title: string; subject: string; readTime: string; author: string; content: { type: string; text: string }[]; tags: string[] }> = {
    'renaissance': {
        title: 'History of Renaissance',
        subject: 'History',
        readTime: '15 min read',
        author: 'Dr. Meera Sharma',
        tags: ['Renaissance', 'Art', 'Culture', 'Europe'],
        content: [
            { type: 'heading', text: 'Introduction to the Renaissance' },
            { type: 'paragraph', text: 'The Renaissance was a fervent period of European cultural, artistic, political, and economic "rebirth" following the Middle Ages. Generally described as taking place from the 14th century to the 17th century, the Renaissance promoted the rediscovery of classical philosophy, literature, and art.' },
            { type: 'heading', text: 'Origins in Italy' },
            { type: 'paragraph', text: 'The Renaissance began in Italy during the 14th century. Italian city-states like Florence, Venice, and Rome became centers of wealth, power, and intellectual activity. Wealthy patrons like the Medici family in Florence sponsored artists, architects, and thinkers.' },
            { type: 'highlight', text: '💡 Key Insight: The word "Renaissance" means "rebirth" in French, referring to the renewed interest in classical Greek and Roman culture.' },
            { type: 'heading', text: 'Major Figures' },
            { type: 'paragraph', text: 'Leonardo da Vinci (1452-1519) was the archetypal Renaissance man, excelling in painting, sculpture, architecture, music, mathematics, engineering, and more. His works include the Mona Lisa and The Last Supper.' },
            { type: 'paragraph', text: 'Michelangelo (1475-1564) was a sculptor, painter, architect, and poet. He created the ceiling of the Sistine Chapel and the statue of David.' },
            { type: 'heading', text: 'Impact on Art' },
            { type: 'paragraph', text: 'Renaissance artists developed new techniques like linear perspective to create depth in paintings. They studied human anatomy to portray the body more realistically. Art moved from religious symbolism to depicting real human emotions and the natural world.' },
            { type: 'quote', text: '"Learning never exhausts the mind." - Leonardo da Vinci' },
            { type: 'heading', text: 'The Spread of Ideas' },
            { type: 'paragraph', text: 'The invention of the printing press by Johannes Gutenberg around 1440 revolutionized the spread of knowledge. Books became more accessible, literacy increased, and ideas spread faster than ever before.' },
            { type: 'heading', text: 'Legacy' },
            { type: 'paragraph', text: 'The Renaissance laid the groundwork for the modern world. It sparked new ways of thinking about science, religion, art, and politics. The scientific revolution, the Reformation, and the Age of Exploration all have roots in Renaissance ideas.' },
        ]
    }
};

function ArticleContent() {
    const searchParams = useSearchParams();
    const articleId = searchParams.get('id') || 'renaissance';
    const article = articles[articleId] || articles['renaissance'];

    const [isBookmarked, setIsBookmarked] = useState(false);
    const [fontSize, setFontSize] = useState('medium');
    const [readProgress, setReadProgress] = useState(0);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setReadProgress(Math.min(progress, 100));
    };

    return (
        <div className={styles.articlePage}>
            <Navbar />

            {/* Reading Progress Bar */}
            <div className={styles.readingProgress}>
                <div className={styles.progressFill} style={{ width: `${readProgress}%` }} />
            </div>

            <div className={styles.mainContainer} onScroll={handleScroll}>
                {/* Back Button */}
                <Link href="/student/dashboard" className={styles.backBtn}>
                    ← Back to Dashboard
                </Link>

                <article className={styles.articleContent}>
                    {/* Header */}
                    <header className={styles.articleHeader}>
                        <span className={styles.subjectBadge}>{article.subject}</span>
                        <h1 className={styles.articleTitle}>{article.title}</h1>
                        <div className={styles.articleMeta}>
                            <span className={styles.author}>✍️ {article.author}</span>
                            <span className={styles.readTime}>📖 {article.readTime}</span>
                        </div>
                        <div className={styles.tags}>
                            {article.tags.map(tag => (
                                <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                        </div>
                    </header>

                    {/* Controls */}
                    <div className={styles.controls}>
                        <div className={styles.fontControls}>
                            <span>Font Size:</span>
                            <button
                                className={fontSize === 'small' ? styles.active : ''}
                                onClick={() => setFontSize('small')}
                            >A-</button>
                            <button
                                className={fontSize === 'medium' ? styles.active : ''}
                                onClick={() => setFontSize('medium')}
                            >A</button>
                            <button
                                className={fontSize === 'large' ? styles.active : ''}
                                onClick={() => setFontSize('large')}
                            >A+</button>
                        </div>
                        <div className={styles.actionBtns}>
                            <button
                                className={`${styles.actionBtn} ${isBookmarked ? styles.bookmarked : ''}`}
                                onClick={() => setIsBookmarked(!isBookmarked)}
                            >
                                {isBookmarked ? '🔖 Saved' : '📑 Save'}
                            </button>
                            <button className={styles.actionBtn}>🔊 Listen</button>
                            <button className={styles.actionBtn}>📤 Share</button>
                        </div>
                    </div>

                    {/* Article Body */}
                    <div className={`${styles.articleBody} ${styles[fontSize]}`}>
                        {article.content.map((block, idx) => {
                            if (block.type === 'heading') {
                                return <h2 key={idx} className={styles.sectionHeading}>{block.text}</h2>;
                            }
                            if (block.type === 'paragraph') {
                                return <p key={idx}>{block.text}</p>;
                            }
                            if (block.type === 'highlight') {
                                return <div key={idx} className={styles.highlight}>{block.text}</div>;
                            }
                            if (block.type === 'quote') {
                                return <blockquote key={idx} className={styles.quote}>{block.text}</blockquote>;
                            }
                            return null;
                        })}
                    </div>

                    {/* Footer */}
                    <footer className={styles.articleFooter}>
                        <div className={styles.completionCard}>
                            <span>✅ You&apos;ve completed this article!</span>
                            <div className={styles.nextActions}>
                                <Link href="/student/quiz?id=history" className={styles.primaryBtn}>
                                    📝 Take Quiz
                                </Link>
                                <Link href="/student/learn" className={styles.secondaryBtn}>
                                    📚 More Articles
                                </Link>
                            </div>
                        </div>
                    </footer>
                </article>
            </div>
        </div>
    );
}

export default function ArticlePage() {
    return (
        <Suspense fallback={
            <div className={styles.articlePage}>
                <Navbar />
                <div className={styles.mainContainer}>
                    Loading article...
                </div>
            </div>
        }>
            <ArticleContent />
        </Suspense>
    );
}
