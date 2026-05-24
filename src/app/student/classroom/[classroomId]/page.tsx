'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/student/Navbar';
import MaterialModal from '@/components/student/MaterialModal';
import styles from './page.module.css';

interface Classroom {
    _id: string;
    name: string;
    code: string;
    teacher: {
        name: string;
        email: string;
    };
    joinedAt: string;
}

interface Material {
    _id: string;
    type: 'quiz' | 'assignment' | 'video' | 'article' | 'resource' | 'announcement';
    title: string;
    description: string;
    content?: string;
    jsonData?: any;
    teacher?: { name: string; email: string };
    createdAt: string;
    dueDate?: string;
    points?: number;
}

const materialIcons: Record<string, string> = {
    quiz: '📊',
    assignment: '📝',
    video: '🎥',
    article: '📄',
    resource: '📚',
    announcement: '📢'
};

const materialColors: Record<string, string> = {
    quiz: '#3b82f6',
    assignment: '#f59e0b',
    video: '#ef4444',
    article: '#8b5cf6',
    resource: '#22c55e',
    announcement: '#06b6d4'
};

export default function ClassroomPage() {
    const params = useParams();
    const router = useRouter();
    const classroomId = params.classroomId as string;

    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');

    useEffect(() => {
        fetchClassroomData();
        fetchMaterials();
    }, [classroomId]);

    const fetchClassroomData = async () => {
        try {
            const response = await fetch(`/api/student/classroom/${classroomId}`);
            if (response.ok) {
                const data = await response.json();
                setClassroom(data.classroom);
            } else if (response.status === 404) {
                setError('Classroom not found');
            } else if (response.status === 403) {
                setError('You are not enrolled in this classroom');
            } else {
                setError('Failed to load classroom');
            }
        } catch (err) {
            setError('Failed to load classroom');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMaterials = async () => {
        try {
            const response = await fetch(`/api/student/classroom/${classroomId}/materials`);
            if (response.ok) {
                const data = await response.json();
                setMaterials(data.materials?.all || []);
            }
        } catch (err) {
            console.error('Failed to fetch materials:', err);
        }
    };

    const filteredMaterials = activeFilter === 'all'
        ? materials
        : activeFilter === 'others'
            ? materials.filter(m => !['quiz', 'assignment'].includes(m.type))
            : materials.filter(m => m.type === activeFilter);

    const filterCounts = {
        all: materials.length,
        quiz: materials.filter(m => m.type === 'quiz').length,
        assignment: materials.filter(m => m.type === 'assignment').length,
        others: materials.filter(m => !['quiz', 'assignment'].includes(m.type)).length,
    };

    if (isLoading) {
        return (
            <div className={styles.page}>
                <Navbar />
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading classroom...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <Navbar />
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h2>{error}</h2>
                    <button onClick={() => router.push('/student/classroom')} className={styles.backBtn}>
                        ← Back to Classrooms
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Navbar />

            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.push('/student/practice')} className={styles.backButton}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Classrooms
                    </button>

                    {classroom && (
                        <div className={styles.classroomInfo}>
                            <div className={styles.classroomIcon}>📘</div>
                            <div className={styles.classroomDetails}>
                                <h1 className={styles.classroomName}>{classroom.name}</h1>
                                <div className={styles.classroomMeta}>
                                    <span className={styles.teacher}>
                                        👨‍🏫 {classroom.teacher?.name || 'Unknown Teacher'}
                                    </span>
                                    <span className={styles.divider}>•</span>
                                    <span className={styles.code}>
                                        Code: {classroom.code}
                                    </span>
                                    <span className={styles.divider}>•</span>
                                    <span className={styles.joined}>
                                        Joined {new Date(classroom.joinedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className={styles.filters}>
                    {Object.entries(filterCounts).map(([type, count]) => {
                        const icons: Record<string, string> = {
                            all: '📋',
                            quiz: '📊',
                            assignment: '📝',
                            others: '📚'
                        };
                        const labels: Record<string, string> = {
                            all: 'All',
                            quiz: 'Quizzes',
                            assignment: 'Assignments',
                            others: 'Others'
                        };
                        return (
                            <button
                                key={type}
                                className={`${styles.filterBtn} ${activeFilter === type ? styles.activeFilter : ''}`}
                                onClick={() => setActiveFilter(type)}
                            >
                                {icons[type]} {labels[type]}
                                <span className={styles.filterCount}>{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {filteredMaterials.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📚</div>
                            <h3>No Materials Yet</h3>
                            <p>Materials will appear here when your teacher adds them.</p>
                        </div>
                    ) : (
                        <div className={styles.materialsGrid}>
                            {filteredMaterials.map((material) => (
                                <div
                                    key={material._id}
                                    className={styles.materialCard}
                                    onClick={() => setSelectedMaterial(material)}
                                >
                                    <div
                                        className={styles.materialIcon}
                                        style={{ backgroundColor: `${materialColors[material.type]}15` }}
                                    >
                                        <span style={{ color: materialColors[material.type] }}>
                                            {materialIcons[material.type]}
                                        </span>
                                    </div>
                                    <div className={styles.materialContent}>
                                        <div className={styles.materialHeader}>
                                            <h3 className={styles.materialTitle}>{material.title}</h3>
                                            <span
                                                className={styles.materialType}
                                                style={{
                                                    backgroundColor: `${materialColors[material.type]}20`,
                                                    color: materialColors[material.type]
                                                }}
                                            >
                                                {material.type}
                                            </span>
                                        </div>
                                        <p className={styles.materialDesc}>{material.description}</p>
                                        <div className={styles.materialMeta}>
                                            <span className={styles.materialDate}>
                                                {new Date(material.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            {material.dueDate && (
                                                <span className={styles.materialDue}>
                                                    Due: {new Date(material.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                            {material.points && (
                                                <span className={styles.materialPoints}>
                                                    ⭐ {material.points} pts
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.materialArrow}>→</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Material Modal */}
            {selectedMaterial && (
                <MaterialModal
                    material={selectedMaterial}
                    onClose={() => setSelectedMaterial(null)}
                />
            )}
        </div>
    );
}
