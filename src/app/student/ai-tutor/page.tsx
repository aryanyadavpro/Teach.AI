'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/student/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { useWebLLM } from '@/hooks/useWebLLM';
import styles from './page.module.css';

interface Message {
    id: number;
    type: 'user' | 'ai';
    content: string;
}

export default function AITutorPage() {
    const { t } = useLanguage();
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [userName] = useState('Student');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // WebLLM integration
    const { isLoading, isReady, progress, error, initializeModel, chat } = useWebLLM();

    const quickActions = [
        { label: t('explainTopic'), icon: '📚' },
        { label: t('solveProblem'), icon: '🧮' },
        { label: t('createNotes'), icon: '📝' },
        { label: t('helpStudy'), icon: '🎯' },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text?: string) => {
        const messageText = text || inputText;
        if (!messageText.trim()) return;

        // Check if model is ready
        if (!isReady) {
            alert('Please load the model first by clicking the "Load Model" button');
            return;
        }

        const newMessage: Message = {
            id: Date.now(),
            type: 'user',
            content: messageText,
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            // Create a placeholder message for streaming updates
            const aiMessageId = Date.now() + 1;
            const aiMessage: Message = {
                id: aiMessageId,
                type: 'ai',
                content: '',
            };
            setMessages(prev => [...prev, aiMessage]);

            // Get response from WebLLM with streaming
            await chat(messageText, (streamedText) => {
                // Update the AI message with streamed content
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === aiMessageId
                            ? { ...msg, content: streamedText }
                            : msg
                    )
                );
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            const errorResponse: Message = {
                id: Date.now() + 2,
                type: 'ai',
                content: `Error: ${errorMessage}. Please make sure the model is loaded.`,
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = (action: string) => {
        setInputText(action);
        inputRef.current?.focus();
    };

    const handleNewChat = () => {
        setMessages([]);
        setInputText('');
    };

    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            <div className={styles.mainContainer}>
                {/* Main Chat Area */}
                <main className={styles.chatArea}>
                    <div className={styles.chatHeader}>
                        <div className={styles.headerLeft}>
                            <div className={styles.headerTitle}>
                                <span className={styles.aiLogo}>🤖</span>
                                <div>
                                    <h1>{t('aiTutor')}</h1>
                                    <span className={styles.statusBadge}>
                                        <span className={styles.statusDot}></span>
                                        {t('readyToHelp')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.headerRight}>
                            <div className={styles.offlineTag}>
                                <span className={styles.offlineDot} style={{
                                    backgroundColor: isReady ? '#10b981' : isLoading ? '#f59e0b' : '#6b7280'
                                }}></span>
                                {isReady ? 'Model Ready' : isLoading ? 'Loading...' : 'Model Not Loaded'}
                            </div>
                            {!isReady && !isLoading && (
                                <button
                                    className={styles.clearBtn}
                                    onClick={initializeModel}
                                    style={{ marginLeft: '8px' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                        <path d="M3 3v5h5" />
                                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                        <path d="M16 21h5v-5" />
                                    </svg>
                                    Load Model
                                </button>
                            )}
                            {error && (
                                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                                    Error: {error}
                                </div>
                            )}
                            {messages.length > 0 && (
                                <button className={styles.clearBtn} onClick={handleNewChat}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                    {t('clear')}
                                </button>
                            )}
                        </div>
                    </div>

                    {messages.length === 0 ? (
                        <div className={styles.welcomeScreen}>
                            <div className={styles.welcomeCard}>
                                {isLoading && (
                                    <div style={{
                                        marginBottom: '24px',
                                        padding: '16px',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(59, 130, 246, 0.3)'
                                    }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#3b82f6' }}>
                                            Loading Offline Model...
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                                            {progress}
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '4px',
                                            background: '#e2e8f0',
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                                animation: 'progress 1.5s ease-in-out infinite',
                                                width: '40%'
                                            }}></div>
                                        </div>
                                    </div>
                                )}
                                <div className={styles.welcomeIcon}>✨</div>
                                <h1 className={styles.welcomeTitle}>
                                    {t('hello')}, {userName}!
                                </h1>
                                <p className={styles.welcomeSubtitle}>
                                    {isReady ? t('whatToLearn') : 'Please load the offline AI model to start learning'}
                                </p>

                                {/* Input Area */}
                                <div className={styles.inputContainer}>
                                    <div className={styles.inputBox}>
                                        <textarea
                                            ref={inputRef}
                                            className={styles.textInput}
                                            placeholder={t('askAnything')}
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            rows={1}
                                        />
                                        <div className={styles.inputActions}>
                                            <button className={styles.toolBtn} title="Add attachment">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                                </svg>
                                            </button>
                                            <button
                                                className={styles.sendBtn}
                                                onClick={() => handleSend()}
                                                disabled={!inputText.trim()}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="22" y1="2" x2="11" y2="13" />
                                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className={styles.quickActions}>
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.label}
                                            className={styles.actionChip}
                                            onClick={() => handleQuickAction(action.label)}
                                        >
                                            <span>{action.icon}</span>
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.chatScreen}>
                            <div className={styles.messagesArea}>
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`${styles.message} ${styles[message.type]}`}
                                    >
                                        {message.type === 'ai' && (
                                            <div className={styles.aiAvatar}>🤖</div>
                                        )}
                                        <div className={styles.messageContent}>
                                            <pre className={styles.messageText}>{message.content}</pre>
                                        </div>
                                        {message.type === 'user' && (
                                            <div className={styles.userAvatar}>👤</div>
                                        )}
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className={`${styles.message} ${styles.ai}`}>
                                        <div className={styles.aiAvatar}>🤖</div>
                                        <div className={styles.typingIndicator}>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className={styles.chatInputContainer}>
                                <div className={styles.inputBox}>
                                    <textarea
                                        ref={inputRef}
                                        className={styles.textInput}
                                        placeholder={t('askAnything')}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        rows={1}
                                    />
                                    <div className={styles.inputActions}>
                                        <button className={styles.toolBtn} title="Add attachment">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                            </svg>
                                        </button>
                                        <button
                                            className={styles.sendBtn}
                                            onClick={() => handleSend()}
                                            disabled={!inputText.trim()}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
