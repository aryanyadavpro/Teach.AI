'use client';

import Navbar from '@/components/student/Navbar';
import EnrolledClassrooms from '@/components/student/EnrolledClassrooms';
import styles from './page.module.css';

export default function PracticePage() {
    return (
        <div className={styles.practice}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Classroom</h1>
                    <p>Start your learning journey by choosing our classroom</p>
                </div>

                <EnrolledClassrooms />
            </div>
        </div>
    );
}
