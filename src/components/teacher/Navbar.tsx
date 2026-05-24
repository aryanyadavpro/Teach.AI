'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import styles from './Navbar.module.css';

const navLinks = [
    { href: '/teacher/dashboard', label: 'Dashboard' },
    { href: '/teacher/ai-studio', label: 'AI Studio' },
    { href: '/teacher/classes', label: 'Classes' },
    { href: '/teacher/content', label: 'Content' },
];

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/teacher/dashboard" className={styles.logo}>
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


                    {/* Profile */}
                    <div className={styles.profileWrapper} ref={profileRef}>
                        <button
                            className={`${styles.profileBtn} ${showProfileMenu ? styles.active : ''}`}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacher"
                                alt="Profile"
                                className={styles.profileImg}
                            />
                        </button>

                        {showProfileMenu && (
                            <div className={styles.profileDropdown}>
                                <div className={styles.profileHeader}>
                                    <img
                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacher"
                                        alt="Profile"
                                        className={styles.dropdownAvatar}
                                    />
                                    <div className={styles.profileInfo}>
                                        <span className={styles.profileName}>{session?.user?.name || 'Teacher'}</span>
                                        <span className={styles.profileClass}>{session?.user?.email || 'admin@learnify.com'}</span>
                                    </div>
                                </div>
                                <div className={styles.menuDivider} />
                                <div className={styles.menuItems}>

                                    <Link href="/teacher/settings" className={styles.menuItem}>
                                        <span className={styles.menuIcon}>⚙️</span>
                                        <span>Settings</span>
                                    </Link>
                                </div>
                                <div className={styles.menuDivider} />
                                <button
                                    className={styles.logoutBtn}
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                >
                                    <span className={styles.menuIcon}>🔌</span>
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
