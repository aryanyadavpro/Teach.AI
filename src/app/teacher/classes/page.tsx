'use client';

import ClassroomManager from '@/components/teacher/ClassroomManager';
import styles from './page.module.css';

export default function ClassesPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>My Classes</h1>
                <p className={styles.subtitle}>Create and manage your classrooms</p>
            </div>

            <ClassroomManager />
        </div>
    );
}
