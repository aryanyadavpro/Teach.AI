'use client';

import { useState } from 'react';
import styles from './JoinClassroom.module.css';

export default function JoinClassroom() {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/student/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: data.message });
                setCode('');
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to join classroom' });
            }
        } catch (error) {
            console.error('Error joining classroom:', error);
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.icon}>🏫</div>
                <h3 className={styles.title}>Join a Classroom</h3>
                <p className={styles.description}>Enter the 6-character code provided by your teacher to join their class.</p>

                <form onSubmit={handleJoin} className={styles.form}>
                    <input
                        type="text"
                        placeholder="Enter Joining Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className={styles.input}
                        maxLength={6}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading || code.length < 6}
                    >
                        {isLoading ? 'Joining...' : 'Join Class'}
                    </button>
                </form>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
