import Navbar from '@/components/teacher/Navbar';
import styles from './layout.module.css';

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.layout}>
            <Navbar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
