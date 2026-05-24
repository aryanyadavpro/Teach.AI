'use client';

import { useState } from 'react';
import Navbar from '@/components/student/Navbar';
import styles from './page.module.css';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    };

    return (
        <div className={styles.contact}>
            <Navbar />
            <div className={styles.mainContainer}>
                <h1 className={styles.pageTitle}>📧 Contact Support</h1>
                <p className={styles.pageDesc}>We&apos;re here to help! Reach out to us anytime.</p>

                <div className={styles.contactGrid}>
                    {/* Contact Form */}
                    <div className={styles.formCard}>
                        <h2>Send us a Message</h2>
                        {submitted && (
                            <div className={styles.successMsg}>
                                ✅ Message sent successfully! We&apos;ll get back to you soon.
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Your Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Subject</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option>General Inquiry</option>
                                    <option>Technical Issue</option>
                                    <option>Account Problem</option>
                                    <option>Feedback</option>
                                    <option>Feature Request</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Describe your issue or question..."
                                    rows={5}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.submitBtn}>
                                📤 Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoCard}>
                            <span className={styles.infoIcon}>📞</span>
                            <h3>Phone Support</h3>
                            <p>+91 1800-123-4567</p>
                            <span className={styles.infoNote}>Mon-Sat, 9AM - 6PM IST</span>
                        </div>
                        <div className={styles.infoCard}>
                            <span className={styles.infoIcon}>✉️</span>
                            <h3>Email Us</h3>
                            <p>support@learnify.com</p>
                            <span className={styles.infoNote}>Response within 24 hours</span>
                        </div>
                        <div className={styles.infoCard}>
                            <span className={styles.infoIcon}>📍</span>
                            <h3>Office Address</h3>
                            <p>123 Education Hub, Sector 5</p>
                            <span className={styles.infoNote}>Mumbai, Maharashtra 400001</span>
                        </div>
                        <div className={styles.infoCard}>
                            <span className={styles.infoIcon}>💬</span>
                            <h3>Live Chat</h3>
                            <p>Available 24/7</p>
                            <button className={styles.chatBtn}>Start Chat</button>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className={styles.faqSection}>
                    <h2>❓ Frequently Asked Questions</h2>
                    <div className={styles.faqList}>
                        {[
                            { q: 'How do I reset my password?', a: 'Go to Settings > Privacy > Change Password' },
                            { q: 'Can I download lessons offline?', a: 'Yes! Use the download button on any lesson' },
                            { q: 'How do I contact my teacher?', a: 'Use the AI Tutor or message through class chat' },
                            { q: 'Is my data secure?', a: 'Yes, we use industry-standard encryption' },
                        ].map((faq, idx) => (
                            <div key={idx} className={styles.faqItem}>
                                <h4>{faq.q}</h4>
                                <p>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
