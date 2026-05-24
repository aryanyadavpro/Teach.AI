'use client';

import { useState } from 'react';
import Navbar from '@/components/student/Navbar';
import styles from './page.module.css';

interface StudentProfile {
    avatar: string;
    firstName: string;
    lastName: string;
    fatherName: string;
    motherName: string;
    class: string;
    division: string;
    rollNo: string;
    dob: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    address: string;
    bloodGroup: string;
    admissionNo: string;
    admissionDate: string;
}

const initialProfile: StudentProfile = {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
    firstName: 'Aryan',
    lastName: 'Sharma',
    fatherName: 'Rajesh Sharma',
    motherName: 'Priya Sharma',
    class: '10',
    division: 'A',
    rollNo: '15',
    dob: '2010-05-15',
    age: 15,
    gender: 'Male',
    phone: '+91 98765 43210',
    email: 'aryan.sharma@student.edu',
    address: '123, Green Avenue, Sector 5, Mumbai, Maharashtra - 400001',
    bloodGroup: 'B+',
    admissionNo: 'STU2020001',
    admissionDate: '2020-04-01',
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<StudentProfile>(initialProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<StudentProfile>(initialProfile);
    const [activeTab, setActiveTab] = useState('personal');

    const handleEdit = () => {
        setEditData({ ...profile });
        setIsEditing(true);
    };

    const handleSave = () => {
        setProfile(editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({ ...profile });
        setIsEditing(false);
    };

    const handleChange = (field: keyof StudentProfile, value: string) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAvatarChange = () => {
        // Generate a new random avatar
        const seeds = ['student', 'alex', 'john', 'jane', 'sam', 'mike', 'emma', 'lily'];
        const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
        setEditData(prev => ({
            ...prev,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`
        }));
    };

    return (
        <div className={styles.profile}>
            <Navbar />

            <div className={styles.mainContainer}>
                {/* Profile Header */}
                <div className={styles.profileHeader}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarWrapper}>
                            <img
                                src={isEditing ? editData.avatar : profile.avatar}
                                alt="Profile"
                                className={styles.avatar}
                            />
                            {isEditing && (
                                <button className={styles.changeAvatarBtn} onClick={handleAvatarChange}>
                                    📷
                                </button>
                            )}
                        </div>
                        <div className={styles.headerInfo}>
                            <h1 className={styles.studentName}>
                                {profile.firstName} {profile.lastName}
                            </h1>
                            <p className={styles.studentClass}>
                                Class {profile.class} - {profile.division} | Roll No: {profile.rollNo}
                            </p>
                            <div className={styles.badges}>
                                <span className={styles.badge}>🎓 Student</span>
                                <span className={styles.badge}>🔥 12 Day Streak</span>
                                <span className={styles.badge}>⭐ Top 10%</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        {!isEditing ? (
                            <button className={styles.editBtn} onClick={handleEdit}>
                                ✏️ Edit Profile
                            </button>
                        ) : (
                            <div className={styles.editActions}>
                                <button className={styles.cancelBtn} onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button className={styles.saveBtn} onClick={handleSave}>
                                    💾 Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabsContainer}>
                    {[
                        { id: 'personal', label: '👤 Personal Info' },
                        { id: 'academic', label: '📚 Academic' },
                        { id: 'contact', label: '📞 Contact' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Profile Content */}
                <div className={styles.profileContent}>
                    {/* Personal Info Tab */}
                    {activeTab === 'personal' && (
                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <h3>Basic Information</h3>
                                <div className={styles.infoFields}>
                                    <div className={styles.field}>
                                        <label>First Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.firstName}
                                                onChange={(e) => handleChange('firstName', e.target.value)}
                                            />
                                        ) : (
                                            <span>{profile.firstName}</span>
                                        )}
                                    </div>
                                    <div className={styles.field}>
                                        <label>Last Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.lastName}
                                                onChange={(e) => handleChange('lastName', e.target.value)}
                                            />
                                        ) : (
                                            <span>{profile.lastName}</span>
                                        )}
                                    </div>
                                    <div className={styles.field}>
                                        <label>Date of Birth</label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={editData.dob}
                                                onChange={(e) => handleChange('dob', e.target.value)}
                                            />
                                        ) : (
                                            <span>{new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        )}
                                    </div>
                                    <div className={styles.field}>
                                        <label>Age</label>
                                        <span>{profile.age} years</span>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Gender</label>
                                        {isEditing ? (
                                            <select
                                                value={editData.gender}
                                                onChange={(e) => handleChange('gender', e.target.value)}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        ) : (
                                            <span>{profile.gender}</span>
                                        )}
                                    </div>
                                    <div className={styles.field}>
                                        <label>Blood Group</label>
                                        {isEditing ? (
                                            <select
                                                value={editData.bloodGroup}
                                                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                                            >
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        ) : (
                                            <span>{profile.bloodGroup}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.infoCard}>
                                <h3>Family Information</h3>
                                <div className={styles.infoFields}>
                                    <div className={styles.field}>
                                        <label>Father&apos;s Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.fatherName}
                                                onChange={(e) => handleChange('fatherName', e.target.value)}
                                            />
                                        ) : (
                                            <span>{profile.fatherName}</span>
                                        )}
                                    </div>
                                    <div className={styles.field}>
                                        <label>Mother&apos;s Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.motherName}
                                                onChange={(e) => handleChange('motherName', e.target.value)}
                                            />
                                        ) : (
                                            <span>{profile.motherName}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Academic Tab */}
                    {activeTab === 'academic' && (
                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <h3>Academic Details</h3>
                                <div className={styles.infoFields}>
                                    <div className={styles.field}>
                                        <label>Class</label>
                                        <span>{profile.class}</span>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Division</label>
                                        <span>{profile.division}</span>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Roll Number</label>
                                        <span>{profile.rollNo}</span>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Admission Number</label>
                                        <span>{profile.admissionNo}</span>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Admission Date</label>
                                        <span>{new Date(profile.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.statsCard}>
                                <h3>📊 Performance Overview</h3>
                                <div className={styles.performanceStats}>
                                    <div className={styles.perfItem}>
                                        <div className={styles.perfCircle}>
                                            <svg viewBox="0 0 36 36" className={styles.circleChart}>
                                                <path
                                                    className={styles.circleBg}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                                <path
                                                    className={styles.circleFill}
                                                    strokeDasharray="85, 100"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <span className={styles.perfValue}>85%</span>
                                        </div>
                                        <span className={styles.perfLabel}>Overall Score</span>
                                    </div>
                                    <div className={styles.perfItem}>
                                        <div className={styles.perfCircle}>
                                            <svg viewBox="0 0 36 36" className={styles.circleChart}>
                                                <path
                                                    className={styles.circleBg}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                                <path
                                                    className={styles.circleFill}
                                                    style={{ stroke: '#22c55e' }}
                                                    strokeDasharray="92, 100"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <span className={styles.perfValue}>92%</span>
                                        </div>
                                        <span className={styles.perfLabel}>Attendance</span>
                                    </div>
                                    <div className={styles.perfItem}>
                                        <div className={styles.perfCircle}>
                                            <svg viewBox="0 0 36 36" className={styles.circleChart}>
                                                <path
                                                    className={styles.circleBg}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                                <path
                                                    className={styles.circleFill}
                                                    style={{ stroke: '#f59e0b' }}
                                                    strokeDasharray="78, 100"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <span className={styles.perfValue}>78%</span>
                                        </div>
                                        <span className={styles.perfLabel}>Assignments</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Tab */}
                    {activeTab === 'contact' && (
                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <h3>Contact Details</h3>
                                <div className={styles.infoFields}>
                                    <div className={styles.field}>
                                        <label>Phone Number</label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                            />
                                        ) : (
                                            <span>{profile.phone}</span>
                                        )}
                                    </div>
                                    <div className={styles.field}>
                                        <label>Email Address</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                            />
                                        ) : (
                                            <span>{profile.email}</span>
                                        )}
                                    </div>
                                    <div className={`${styles.field} ${styles.fullWidth}`}>
                                        <label>Address</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editData.address}
                                                onChange={(e) => handleChange('address', e.target.value)}
                                                rows={3}
                                            />
                                        ) : (
                                            <span>{profile.address}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
