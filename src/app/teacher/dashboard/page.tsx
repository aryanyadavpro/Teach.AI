import WelcomeCard from '@/components/teacher/WelcomeCard';
import ClassroomSummary from '@/components/teacher/ClassroomSummary';
import ImpactCard from '@/components/teacher/ImpactCard';

import styles from './page.module.css';

export default function TeacherDashboard() {
    return (
        <div className={styles.dashboard}>
            {/* Main Content Area */}
            <div className={styles.mainContent}>
                <WelcomeCard />
                <div className={styles.overviewGrid}>
                    <ClassroomSummary />
                    <ImpactCard />
                </div>

            </div>
        </div>
    );
}
