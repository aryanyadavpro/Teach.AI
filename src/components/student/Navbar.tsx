'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    Flame,
    Bell,
    User,
    Settings,
    Info,
    Mail,
    LogOut,
    AlertTriangle,
    CheckCircle,
    X,
    Menu
} from 'lucide-react';
import styles from './Navbar.module.css';

const navLinks = [
    { href: '/student/classroom', label: 'Classroom' },
    { href: '/student/ai-tutor', label: 'AI Tutor' },
    { href: '/student/library', label: 'Library' },
];

const notifications = [
    { id: 1, title: 'Assignment Due Tomorrow', message: 'Polynomials Practice Set is due on Feb 2', time: '2 hours ago', type: 'warning', unread: true },
    { id: 2, title: 'New Test Available', message: 'Weekly Math Quiz is now available', time: '5 hours ago', type: 'info', unread: true },
    { id: 3, title: 'Great Progress!', message: 'You completed 5 lessons this week', time: '1 day ago', type: 'success', unread: false },
    { id: 4, title: 'Teacher Feedback', message: 'Your English essay has been graded', time: '2 days ago', type: 'info', unread: false },
];

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationsList, setNotificationsList] = useState(notifications);

    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const dismissNotification = (id: number) => {
        setNotificationsList(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notificationsList.filter(n => n.unread).length;

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/student/classroom" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#3b82f6" />
                            <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className={styles.logoText}>Learnify</span>
                </Link>

                {/* Nav Links */}
                <div className={styles.navLinks}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right Section */}
                <div className={styles.rightSection}>


                    {/* Notifications */}
                    <div className={styles.notifWrapper} ref={notifRef}>
                        <button
                            className={`${styles.iconBtn} ${showNotifications ? styles.active : ''}`}
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
                        </button>

                        {showNotifications && (
                            <div className={styles.notifDropdown}>
                                <div className={styles.notifHeader}>
                                    <h4>Notifications</h4>
                                    <span className={styles.notifCount}>{notificationsList.length} new</span>
                                </div>
                                <div className={styles.notifList}>
                                    {notificationsList.length === 0 ? (
                                        <div className={styles.noNotifs}>No notifications</div>
                                    ) : (
                                        notificationsList.map(notif => (
                                            <div key={notif.id} className={`${styles.notifItem} ${notif.unread ? styles.unread : ''}`}>
                                                <div className={`${styles.notifIcon} ${styles[notif.type]}`}>
                                                    {notif.type === 'warning' && <AlertTriangle size={16} />}
                                                    {notif.type === 'info' && <Info size={16} />}
                                                    {notif.type === 'success' && <CheckCircle size={16} />}
                                                </div>
                                                <div className={styles.notifContent}>
                                                    <span className={styles.notifTitle}>{notif.title}</span>
                                                    <span className={styles.notifMessage}>{notif.message}</span>
                                                    <span className={styles.notifTime}>{notif.time}</span>
                                                </div>
                                                <button
                                                    className={styles.dismissBtn}
                                                    onClick={() => dismissNotification(notif.id)}
                                                    title="Dismiss"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <Link href="/student/notifications" className={styles.viewAllBtn}>
                                    View All Notifications
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className={styles.profileWrapper} ref={profileRef}>
                        <button
                            className={`${styles.profileBtn} ${showProfileMenu ? styles.active : ''}`}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=student"
                                alt="Profile"
                                className={styles.profileImg}
                            />
                        </button>

                        {showProfileMenu && (
                            <div className={styles.profileDropdown}>
                                <div className={styles.profileHeader}>
                                    <img
                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=student"
                                        alt="Profile"
                                        className={styles.dropdownAvatar}
                                    />
                                    <div className={styles.profileInfo}>
                                        <span className={styles.profileName}>{session?.user?.name || 'Aryan Sharma'}</span>
                                        <span className={styles.profileClass}>{session?.user?.email || 'Class 10 - A'}</span>
                                    </div>
                                </div>
                                <div className={styles.menuDivider} />
                                <div className={styles.menuItems}>
                                    <Link href="/student/profile" className={styles.menuItem}>
                                        <span className={styles.menuIcon}><User size={18} /></span>
                                        <span>My Profile</span>
                                    </Link>
                                    <Link href="/student/settings" className={styles.menuItem}>
                                        <span className={styles.menuIcon}><Settings size={18} /></span>
                                        <span>Settings</span>
                                    </Link>
                                    <Link href="/student/about" className={styles.menuItem}>
                                        <span className={styles.menuIcon}><Info size={18} /></span>
                                        <span>About Us</span>
                                    </Link>
                                    <Link href="/student/contact" className={styles.menuItem}>
                                        <span className={styles.menuIcon}><Mail size={18} /></span>
                                        <span>Contact Support</span>
                                    </Link>
                                </div>
                                <div className={styles.menuDivider} />
                                <button
                                    className={styles.logoutBtn}
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                >
                                    <span className={styles.menuIcon}><LogOut size={18} /></span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
