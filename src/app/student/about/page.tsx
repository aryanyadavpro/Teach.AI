'use client';

import Navbar from '@/components/student/Navbar';
import styles from './page.module.css';

export default function AboutPage() {
    return (
        <div className={styles.about}>
            <Navbar />
            <div className={styles.mainContainer}>
                {/* Hero Section */}
                <div className={styles.hero}>
                    <h1 className={styles.heroTitle}>About Learnify</h1>
                    <p className={styles.heroDesc}>
                        Empowering students with AI-powered personalized learning
                    </p>
                </div>

                {/* Mission */}
                <div className={styles.section}>
                    <h2>🎯 Our Mission</h2>
                    <p>
                        At Learnify, we believe every student deserves access to quality education tailored to their unique learning style.
                        Our mission is to bridge the gap between traditional education and modern technology, making learning more engaging,
                        effective, and accessible for students across India.
                    </p>
                </div>

                {/* Features */}
                <div className={styles.section}>
                    <h2>✨ What We Offer</h2>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>🤖</span>
                            <h3>AI-Powered Learning</h3>
                            <p>Personalized learning paths adapted to your pace and style</p>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>📚</span>
                            <h3>Comprehensive Content</h3>
                            <p>Aligned with CBSE, ICSE, and State Board curricula</p>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>🎮</span>
                            <h3>Interactive Learning</h3>
                            <p>Engaging videos, diagrams, and practice questions</p>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>📱</span>
                            <h3>Offline Access</h3>
                            <p>Download lessons and learn anywhere, anytime</p>
                        </div>
                    </div>
                </div>

                {/* Team */}
                <div className={styles.section}>
                    <h2>👥 Our Team</h2>
                    <p>
                        We are a passionate team of educators, engineers, and designers committed to revolutionizing
                        education in India. Our diverse backgrounds bring together expertise in pedagogy, AI/ML,
                        and user experience design.
                    </p>
                </div>

                {/* Stats */}
                <div className={styles.statsSection}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>50,000+</span>
                        <span className={styles.statLabel}>Active Students</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>1,000+</span>
                        <span className={styles.statLabel}>Video Lessons</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>500+</span>
                        <span className={styles.statLabel}>Schools</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>4.8★</span>
                        <span className={styles.statLabel}>Rating</span>
                    </div>
                </div>

                {/* Version */}
                <div className={styles.versionInfo}>
                    <p>Version 2.0.1</p>
                    <p>© 2026 Learnify. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
