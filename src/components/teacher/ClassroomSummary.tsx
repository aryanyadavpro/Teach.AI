'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './ClassroomSummary.module.css';

interface Classroom {
    _id: string;
    name: string;
    code: string;
}

export default function ClassroomSummary() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const response = await fetch('/api/teacher/classroom');
            if (response.ok) {
                const data = await response.json();
                setClassrooms(data);
            }
        } catch (error) {
            console.error('Error fetching classrooms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${styles.container} animate-fade-in`}>
            <div className={styles.header}>
                <div>
                    <span className={styles.title}>My Classrooms</span>
                    <span className={styles.count}>{classrooms.length}</span>
                </div>
                <Link href="/teacher/classes" className={styles.viewAllBtn}>
                    View All
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {isLoading ? (
                <div className={styles.loading}>
                    <div className="animate-pulse">Loading classes...</div>
                </div>
            ) : classrooms.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🏫</span>
                    <p>No classrooms yet</p>
                    <Link href="/teacher/classes" className={styles.createBtn}>
                        Create Your First Class
                    </Link>
                </div>
            ) : (
                <div className={styles.classList}>
                    {classrooms.slice(0, 3).map((cls, index) => (
                        <Link
                            href={`/teacher/classes/${cls._id}`}
                            key={cls._id}
                            className={`${styles.classCard} animate-slide-up`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className={styles.classIconWrapper}>📘</div>
                            <div className={styles.classInfo}>
                                <span className={styles.className}>{cls.name}</span>
                                <div className={styles.classMetadata}>
                                    <span>Code:</span>
                                    <span className={styles.classCode}>{cls.code}</span>
                                </div>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    ))}
                    {classrooms.length > 3 && (
                        <Link href="/teacher/classes" className={styles.moreLink}>
                            +{classrooms.length - 3} more classes
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
