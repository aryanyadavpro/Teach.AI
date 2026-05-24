'use client';

import { useState } from 'react';
import Navbar from '@/components/student/Navbar';
import styles from './page.module.css';

// Sample data structure
const studentClass = 10;

const subjectsData = [
    {
        id: 'math',
        name: 'Mathematics',
        icon: '📐',
        color: '#3b82f6',
        chapters: [
            {
                id: 'ch1',
                name: 'Real Numbers',
                progress: 100,
                topics: [
                    { id: 't1', name: 'Introduction to Real Numbers', completed: true, duration: '15 min' },
                    { id: 't2', name: 'Euclid\'s Division Lemma', completed: true, duration: '20 min' },
                    { id: 't3', name: 'Fundamental Theorem of Arithmetic', completed: true, duration: '18 min' },
                ]
            },
            {
                id: 'ch2',
                name: 'Polynomials',
                progress: 60,
                topics: [
                    { id: 't1', name: 'Zeros of a Polynomial', completed: true, duration: '22 min' },
                    { id: 't2', name: 'Relationship Between Zeros', completed: true, duration: '25 min' },
                    { id: 't3', name: 'Division Algorithm', completed: false, duration: '20 min' },
                ]
            },
            {
                id: 'ch3',
                name: 'Pair of Linear Equations',
                progress: 0,
                isNew: true,
                topics: [
                    { id: 't1', name: 'Graphical Method', completed: false, duration: '25 min' },
                    { id: 't2', name: 'Substitution Method', completed: false, duration: '20 min' },
                ]
            }
        ]
    },
    {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        color: '#22c55e',
        chapters: [
            {
                id: 'ch1',
                name: 'Chemical Reactions',
                progress: 80,
                topics: [
                    { id: 't1', name: 'Types of Chemical Reactions', completed: true, duration: '20 min' },
                    { id: 't2', name: 'Balancing Equations', completed: true, duration: '25 min' },
                    { id: 't3', name: 'Oxidation and Reduction', completed: false, duration: '22 min' },
                ]
            },
            {
                id: 'ch2',
                name: 'Life Processes',
                progress: 40,
                topics: [
                    { id: 't1', name: 'Nutrition', completed: true, duration: '30 min' },
                    { id: 't2', name: 'Respiration', completed: false, duration: '28 min' },
                ]
            }
        ]
    },
    {
        id: 'english',
        name: 'English',
        icon: '📚',
        color: '#f59e0b',
        chapters: [
            {
                id: 'ch1',
                name: 'First Flight',
                progress: 50,
                topics: [
                    { id: 't1', name: 'A Letter to God', completed: true, duration: '25 min' },
                    { id: 't2', name: 'Nelson Mandela', completed: false, duration: '30 min' },
                ]
            }
        ]
    },
    {
        id: 'history',
        name: 'History',
        icon: '🏛️',
        color: '#8b5cf6',
        chapters: [
            {
                id: 'ch1',
                name: 'The Rise of Nationalism',
                progress: 30,
                topics: [
                    { id: 't1', name: 'French Revolution', completed: true, duration: '35 min' },
                    { id: 't2', name: 'Making of Nationalism', completed: false, duration: '40 min' },
                ]
            }
        ]
    }
];

type ViewMode = 'subjects' | 'chapters' | 'topic';

interface Topic {
    id: string;
    name: string;
    completed: boolean;
    duration: string;
}

interface Chapter {
    id: string;
    name: string;
    progress: number;
    topics: Topic[];
    isNew?: boolean;
}

interface Subject {
    id: string;
    name: string;
    icon: string;
    color: string;
    chapters: Chapter[];
}

export default function LearnPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('subjects');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [activeTab, setActiveTab] = useState('video');

    const handleSubjectClick = (subject: Subject) => {
        setSelectedSubject(subject);
        setViewMode('chapters');
    };

    const handleChapterClick = (chapter: Chapter) => {
        setSelectedChapter(chapter);
        setSelectedTopic(chapter.topics[0]);
        setViewMode('topic');
    };

    const handleBack = () => {
        if (viewMode === 'topic') {
            setViewMode('chapters');
            setSelectedTopic(null);
        } else if (viewMode === 'chapters') {
            setViewMode('subjects');
            setSelectedSubject(null);
        }
    };

    const getBreadcrumb = () => {
        const crumbs = [`Class ${studentClass}`];
        if (selectedSubject) crumbs.push(selectedSubject.name);
        if (selectedChapter) crumbs.push(selectedChapter.name);
        return crumbs;
    };

    return (
        <div className={styles.learn}>
            <Navbar />

            <div className={styles.mainContainer}>
                {/* Breadcrumb Navigation */}
                <div className={styles.breadcrumb}>
                    {getBreadcrumb().map((crumb, index) => (
                        <span key={index} className={styles.crumb}>
                            {index > 0 && <span className={styles.separator}>›</span>}
                            <span
                                className={index < getBreadcrumb().length - 1 ? styles.clickable : styles.current}
                                onClick={() => {
                                    if (index === 0) { setViewMode('subjects'); setSelectedSubject(null); setSelectedChapter(null); }
                                    else if (index === 1 && viewMode === 'topic') { setViewMode('chapters'); setSelectedChapter(null); }
                                }}
                            >
                                {crumb}
                            </span>
                        </span>
                    ))}
                </div>

                {/* Subjects View */}
                {viewMode === 'subjects' && (
                    <div className={styles.subjectsView}>
                        <div className={styles.header}>
                            <h1 className={styles.title}>📖 My Subjects</h1>
                            <p className={styles.subtitle}>Class {studentClass} - Continue learning from where you left</p>
                        </div>

                        <div className={styles.subjectsGrid}>
                            {subjectsData.map((subject, index) => (
                                <div
                                    key={subject.id}
                                    className={styles.subjectCard}
                                    style={{ '--accent-color': subject.color, animationDelay: `${index * 0.1}s` } as React.CSSProperties}
                                    onClick={() => handleSubjectClick(subject)}
                                >
                                    <div className={styles.subjectIcon}>{subject.icon}</div>
                                    <div className={styles.subjectInfo}>
                                        <h3 className={styles.subjectName}>{subject.name}</h3>
                                        <p className={styles.subjectMeta}>{subject.chapters.length} Chapters</p>
                                        <div className={styles.subjectProgress}>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${Math.round(subject.chapters.reduce((a, c) => a + c.progress, 0) / subject.chapters.length)}%` }}
                                                />
                                            </div>
                                            <span className={styles.progressText}>
                                                {Math.round(subject.chapters.reduce((a, c) => a + c.progress, 0) / subject.chapters.length)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.arrowIcon}>→</div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Section Grid */}
                        <div className={styles.bottomSection}>
                            {/* Continue Learning */}
                            <div className={styles.continueSection}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>🎯 Continue Learning</h2>
                                    <span className={styles.seeAll}>See All →</span>
                                </div>
                                <div className={styles.continueList}>
                                    <div className={styles.continueCard}>
                                        <div className={styles.continueIcon} style={{ background: 'rgba(59, 130, 246, 0.1)' }}>📐</div>
                                        <div className={styles.continueInfo}>
                                            <h4>Polynomials - Division Algorithm</h4>
                                            <p>Mathematics • 60% complete</p>
                                            <div className={styles.continueProgress}>
                                                <div className={styles.progressFill} style={{ width: '60%' }} />
                                            </div>
                                        </div>
                                        <button
                                            className={styles.resumeBtn}
                                            onClick={() => {
                                                const mathSubject = subjectsData.find(s => s.id === 'math');
                                                if (mathSubject) {
                                                    const chapter = mathSubject.chapters.find(c => c.id === 'ch2');
                                                    if (chapter) {
                                                        const topic = chapter.topics.find(t => !t.completed);
                                                        if (topic) {
                                                            setSelectedSubject(mathSubject);
                                                            setSelectedChapter(chapter);
                                                            setSelectedTopic(topic);
                                                            setViewMode('topic');
                                                        }
                                                    }
                                                }
                                            }}
                                        >
                                            ▶ Resume
                                        </button>
                                    </div>
                                    <div className={styles.continueCard}>
                                        <div className={styles.continueIcon} style={{ background: 'rgba(34, 197, 94, 0.1)' }}>🔬</div>
                                        <div className={styles.continueInfo}>
                                            <h4>Chemical Reactions - Oxidation</h4>
                                            <p>Science • 40% complete</p>
                                            <div className={styles.continueProgress}>
                                                <div className={styles.progressFill} style={{ width: '40%' }} />
                                            </div>
                                        </div>
                                        <button
                                            className={styles.resumeBtn}
                                            onClick={() => {
                                                const scienceSubject = subjectsData.find(s => s.id === 'science');
                                                if (scienceSubject) {
                                                    const chapter = scienceSubject.chapters.find(c => c.id === 'ch1');
                                                    if (chapter) {
                                                        const topic = chapter.topics.find(t => !t.completed);
                                                        if (topic) {
                                                            setSelectedSubject(scienceSubject);
                                                            setSelectedChapter(chapter);
                                                            setSelectedTopic(topic);
                                                            setViewMode('topic');
                                                        }
                                                    }
                                                }
                                            }}
                                        >
                                            ▶ Resume
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Downloaded Content */}
                            <div className={styles.downloadedSection}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>📥 Offline Content</h2>
                                    <span className={styles.storageInfo}>245 MB used</span>
                                </div>
                                <div className={styles.downloadedList}>
                                    <div className={styles.downloadedItem}>
                                        <div className={styles.downloadedIcon}>📐</div>
                                        <div className={styles.downloadedInfo}>
                                            <span>Real Numbers</span>
                                            <small>Complete Chapter • 45MB</small>
                                        </div>
                                        <span className={styles.offlineBadge}>✓ Offline</span>
                                    </div>
                                    <div className={styles.downloadedItem}>
                                        <div className={styles.downloadedIcon}>🔬</div>
                                        <div className={styles.downloadedInfo}>
                                            <span>Chemical Reactions</span>
                                            <small>3 Videos • 120MB</small>
                                        </div>
                                        <span className={styles.offlineBadge}>✓ Offline</span>
                                    </div>
                                    <div className={styles.downloadedItem}>
                                        <div className={styles.downloadedIcon}>📚</div>
                                        <div className={styles.downloadedInfo}>
                                            <span>English Notes</span>
                                            <small>PDF Notes • 15MB</small>
                                        </div>
                                        <span className={styles.offlineBadge}>✓ Offline</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className={styles.statsSection}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>📊 Your Progress</h2>
                                </div>
                                <div className={styles.statsGrid}>
                                    <div className={styles.statCard}>
                                        <div className={styles.statIcon}>🎬</div>
                                        <div className={styles.statValue}>24</div>
                                        <div className={styles.statLabel}>Videos Watched</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statIcon}>📝</div>
                                        <div className={styles.statValue}>18</div>
                                        <div className={styles.statLabel}>Notes Read</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statIcon}>✅</div>
                                        <div className={styles.statValue}>156</div>
                                        <div className={styles.statLabel}>Questions Solved</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <div className={styles.statIcon}>⏱️</div>
                                        <div className={styles.statValue}>12h</div>
                                        <div className={styles.statLabel}>Time Spent</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chapters View */}
                {viewMode === 'chapters' && selectedSubject && (
                    <div className={styles.chaptersView}>
                        <button className={styles.backBtn} onClick={handleBack}>
                            ← Back to Subjects
                        </button>

                        <div className={styles.header}>
                            <div className={styles.subjectBadge} style={{ background: selectedSubject.color }}>
                                {selectedSubject.icon}
                            </div>
                            <div>
                                <h1 className={styles.title}>{selectedSubject.name}</h1>
                                <p className={styles.subtitle}>Select a chapter to start learning</p>
                            </div>
                        </div>

                        <div className={styles.chaptersList}>
                            {selectedSubject.chapters.map((chapter, index) => (
                                <div
                                    key={chapter.id}
                                    className={styles.chapterCard}
                                    style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
                                    onClick={() => handleChapterClick(chapter)}
                                >
                                    <div className={styles.chapterNumber}>
                                        {chapter.progress === 100 ? '✓' : index + 1}
                                    </div>
                                    <div className={styles.chapterInfo}>
                                        <div className={styles.chapterHeader}>
                                            <h3 className={styles.chapterName}>{chapter.name}</h3>
                                            {chapter.isNew && <span className={styles.newBadge}>NEW</span>}
                                        </div>
                                        <p className={styles.chapterTopics}>{chapter.topics.length} Topics • {chapter.topics.reduce((a, t) => a + parseInt(t.duration), 0)} min</p>
                                        <div className={styles.chapterProgress}>
                                            <div className={styles.progressBar}>
                                                <div className={styles.progressFill} style={{ width: `${chapter.progress}%` }} />
                                            </div>
                                            <span className={styles.progressPercent}>{chapter.progress}%</span>
                                        </div>
                                    </div>
                                    <button className={styles.downloadBtn} onClick={(e) => { e.stopPropagation(); }} title="Download for Offline">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Topic/Lesson View */}
                {viewMode === 'topic' && selectedSubject && selectedChapter && selectedTopic && (
                    <div className={styles.topicView}>
                        <button className={styles.backBtn} onClick={handleBack}>
                            ← Back to Chapters
                        </button>

                        <div className={styles.topicLayout}>
                            {/* Main Content */}
                            <div className={styles.mainContent}>
                                <div className={styles.topicHeader}>
                                    <div>
                                        <h1 className={styles.topicTitle}>{selectedSubject.name} - {selectedChapter.name}</h1>
                                        <p className={styles.lessonName}>Topic: {selectedTopic.name}</p>
                                    </div>
                                    <button className={styles.saveOfflineBtn}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Save Offline
                                    </button>
                                </div>

                                {/* Content Tabs */}
                                <div className={styles.contentTabs}>
                                    {[
                                        { id: 'video', label: '🎬 Video Lecture', icon: '🎬' },
                                        { id: 'diagram', label: '🔬 Interactive', icon: '🔬' },
                                        { id: 'notes', label: '📝 Notes', icon: '📝' },
                                        { id: 'practice', label: '❓ Practice', icon: '❓' },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                                            onClick={() => setActiveTab(tab.id)}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Video Content */}
                                {activeTab === 'video' && (
                                    <div className={styles.videoSection}>
                                        <div className={styles.videoPlayer}>
                                            <div className={styles.videoPlaceholder}>
                                                <div className={styles.playButton}>▶</div>
                                                <div className={styles.videoOverlay}>
                                                    <span>Video: {selectedTopic.name}</span>
                                                </div>
                                            </div>
                                            <div className={styles.videoControls}>
                                                <div className={styles.videoProgress}>
                                                    <div className={styles.videoProgressFill} style={{ width: '35%' }} />
                                                </div>
                                                <div className={styles.videoTime}>
                                                    <span>5:45 / {selectedTopic.duration}</span>
                                                    <div className={styles.videoActions}>
                                                        <button title="Speed">1x</button>
                                                        <button title="Quality">HD</button>
                                                        <button title="Fullscreen">⛶</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Interactive Diagram */}
                                {activeTab === 'diagram' && (
                                    <div className={styles.diagramSection}>
                                        <div className={styles.diagramCard}>
                                            <div className={styles.diagramHeader}>
                                                <h3>🔬 Interactive Experiment</h3>
                                                <span className={styles.interactiveBadge}>INTERACTIVE</span>
                                            </div>
                                            <p className={styles.diagramDesc}>Explore the concept through interactive visualization. Click and drag to interact.</p>
                                            <div className={styles.diagramArea}>
                                                <div className={styles.diagramPlaceholder}>
                                                    <span className={styles.rotateIcon}>🔄</span>
                                                    <p>Interactive Diagram</p>
                                                    <small>Tap to explore {selectedTopic.name}</small>
                                                </div>
                                            </div>
                                            <div className={styles.diagramControls}>
                                                <button className={styles.controlBtn}>🔍 Zoom</button>
                                                <button className={styles.controlBtn}>🔄 Reset</button>
                                                <button className={styles.controlBtn}>📸 Capture</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notes Section */}
                                {activeTab === 'notes' && (
                                    <div className={styles.notesSection}>
                                        <div className={styles.notesCard}>
                                            <div className={styles.notesHeader}>
                                                <h3>📝 Lesson Notes</h3>
                                                <button className={styles.downloadNotesBtn}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="7 10 12 15 17 10" />
                                                        <line x1="12" y1="15" x2="12" y2="3" />
                                                    </svg>
                                                    Download PDF
                                                </button>
                                            </div>
                                            <div className={styles.notesContent}>
                                                <h4>Key Concepts</h4>
                                                <ul>
                                                    <li><strong>Definition:</strong> {selectedTopic.name} is a fundamental concept in {selectedSubject.name}.</li>
                                                    <li><strong>Formula:</strong> The main formula involves understanding core principles.</li>
                                                    <li><strong>Application:</strong> Used in solving real-world problems.</li>
                                                </ul>
                                                <h4>Important Points</h4>
                                                <ol>
                                                    <li>Understand the basic definition first</li>
                                                    <li>Practice with simple examples</li>
                                                    <li>Apply to complex problems</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Practice Questions */}
                                {activeTab === 'practice' && (
                                    <div className={styles.practiceSection}>
                                        <div className={styles.practiceCard}>
                                            <div className={styles.practiceHeader}>
                                                <h3>❓ Practice Questions</h3>
                                                <span className={styles.questionCount}>5 Questions</span>
                                            </div>
                                            <div className={styles.questionsList}>
                                                {[1, 2, 3, 4, 5].map((q) => (
                                                    <div key={q} className={styles.questionItem}>
                                                        <div className={styles.questionNum}>Q{q}</div>
                                                        <div className={styles.questionContent}>
                                                            <p>Sample question about {selectedTopic?.name} goes here?</p>
                                                            <div className={styles.questionMeta}>
                                                                <span className={styles.difficulty}>Medium</span>
                                                                <span>2 marks</span>
                                                            </div>
                                                        </div>
                                                        <button className={styles.attemptBtn}>Attempt</button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button className={styles.startQuizBtn}>
                                                Start Full Quiz →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <aside className={styles.sidebar}>
                                {/* Chapter Progress */}
                                <div className={styles.chapterProgressCard}>
                                    <div className={styles.progressHeader}>
                                        <h3>{selectedChapter.name}</h3>
                                        <span className={styles.progressBadge}>{selectedChapter.progress}%</span>
                                    </div>
                                    <div className={styles.topicsList}>
                                        {selectedChapter.topics.map((topic, idx) => (
                                            <div
                                                key={topic.id}
                                                className={`${styles.topicItem} ${selectedTopic?.id === topic.id ? styles.active : ''} ${topic.completed ? styles.completed : ''}`}
                                                onClick={() => setSelectedTopic(topic)}
                                            >
                                                <span className={styles.topicStatus}>
                                                    {topic.completed ? '✓' : selectedTopic?.id === topic.id ? '▶' : (idx + 1)}
                                                </span>
                                                <span className={styles.topicName}>{topic.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button className={styles.downloadChapterBtn}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Full Chapter (45MB)
                                    </button>
                                </div>

                                {/* Weekly Goal */}
                                <div className={styles.weeklyGoal}>
                                    <div className={styles.goalHeader}>
                                        <span className={styles.trophyIcon}>🏆</span>
                                        <h4>Weekly Goal</h4>
                                    </div>
                                    <p className={styles.goalText}>Complete 3 more lessons to earn the <strong>Chapter Master</strong> badge!</p>
                                    <div className={styles.goalProgress}>
                                        <div className={styles.goalProgressBar}>
                                            <div className={styles.goalProgressFill} style={{ width: '60%' }} />
                                        </div>
                                        <span>3/5 Lessons completed</span>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
