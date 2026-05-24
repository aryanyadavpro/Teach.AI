'use client';

import { useState, useEffect } from 'react';
import styles from './ClassroomManager.module.css';

interface User {
    _id: string;
    name: string;
    email: string;
}

interface Classroom {
    _id: string;
    name: string;
    code: string;
}

export default function ClassroomManager() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [newClassName, setNewClassName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [isViewingMembers, setIsViewingMembers] = useState(false);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);

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
        }
    };

    const handleCreateClassroom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/teacher/classroom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newClassName }),
            });

            if (response.ok) {
                setNewClassName('');
                setIsCreating(false);
                fetchClassrooms();
            } else {
                alert('Failed to create classroom');
            }
        } catch (error) {
            console.error('Error creating classroom:', error);
            alert('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const viewMembers = async (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsViewingMembers(true);
        setIsLoadingMembers(true);
        try {
            const response = await fetch(`/api/teacher/classroom/${classroom._id}/members`);
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>My Classrooms</h3>
                <button
                    className={styles.addBtn}
                    onClick={() => setIsCreating(!isCreating)}
                >
                    {isCreating ? 'Cancel' : '+ New Class'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateClassroom} className={styles.createForm}>
                    <input
                        type="text"
                        placeholder="Class Name (e.g., Mathematics 101)"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className={styles.input}
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading || !newClassName.trim()}
                    >
                        {isLoading ? 'Creating...' : 'Create'}
                    </button>
                </form>
            )}

            <div className={styles.classList}>
                {classrooms.length === 0 ? (
                    <p className={styles.emptyState}>No classrooms created yet.</p>
                ) : (
                    classrooms.map((cls) => (
                        <div key={cls._id} className={styles.classCard}>
                            <div className={styles.classInfo}>
                                <span className={styles.className}>{cls.name}</span>
                                <div className={styles.codeRow}>
                                    <span className={styles.classCodeLabel}>Code:</span>
                                    <span className={styles.classCode}>{cls.code}</span>
                                    <button
                                        className={styles.copyBtn}
                                        onClick={() => navigator.clipboard.writeText(cls.code)}
                                        title="Copy Code"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <button
                                className={styles.viewMembersBtn}
                                onClick={() => viewMembers(cls)}
                            >
                                View Students
                            </button>
                        </div>
                    ))
                )}
            </div>

            {isViewingMembers && selectedClassroom && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h4>Students in {selectedClassroom.name}</h4>
                            <button
                                className={styles.closeBtn}
                                onClick={() => {
                                    setIsViewingMembers(false);
                                    setMembers([]);
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            {isLoadingMembers ? (
                                <p className={styles.modalLoading}>Loading students...</p>
                            ) : members.length === 0 ? (
                                <p className={styles.modalEmpty}>No students have joined yet.</p>
                            ) : (
                                <table className={styles.memberTable}>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((member) => (
                                            <tr key={member._id}>
                                                <td>{member.name}</td>
                                                <td>{member.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
