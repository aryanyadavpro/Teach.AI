'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/student/Navbar';
import styles from './page.module.css';


interface Resource {
    id: string;
    title: string;
    type: 'pdf' | 'doc' | 'ppt' | 'video' | 'audio' | 'link';
    subject: string;
    grade: string;
    author: string;
    date: string;
    description: string;
    size?: string;
    duration?: string;
    link?: string;
    fileUrl?: string; // Cloudinary URL
    imageUrl?: string;
    aiContent?: string;
}

// Static types for UI consistency
const fileTypes = [
    { id: 'all', label: 'All Files', icon: '📁', count: 0 },
    { id: 'pdf', label: 'PDF', icon: '📄', count: 0 },
    { id: 'doc', label: 'DOC', icon: '📝', count: 0 },
    { id: 'ppt', label: 'PPT', icon: '📊', count: 0 },
    { id: 'video', label: 'Video', icon: '🎬', count: 0 },
    { id: 'audio', label: 'Audio', icon: '🎧', count: 0 },
];

const grades = [
    { id: 'grade10', label: 'Grade 10', subjects: ['Math', 'Science', 'English', 'History'] },
    { id: 'grade9', label: 'Grade 9', subjects: ['Math', 'Science', 'English'] },
];


export default function LibraryPage() {
    const [activeTab, setActiveTab] = useState<'documents' | 'recordings'>('documents');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedGrades, setExpandedGrades] = useState<string[]>(['grade10']);
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Initial load and filter change
    useEffect(() => {
        searchResources(searchQuery);
    }, [selectedType]);

    const searchResources = async (query: string = '') => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (query.trim()) params.append('search', query);
            if (selectedType !== 'all') params.append('type', selectedType);

            const res = await fetch(`/api/student/library?${params.toString()}`);
            const data = await res.json();
            if (data.resources) {
                setResources(data.resources);
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                searchResources(searchQuery);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const toggleGrade = (gradeId: string) => {
        setExpandedGrades(prev =>
            prev.includes(gradeId)
                ? prev.filter(id => id !== gradeId)
                : [...prev, gradeId]
        );
    };

    // Filter resources based on type and local filters (grade not fully implemented in backend yet)
    const filteredDocuments = resources.filter(doc => {
        const isDoc = ['pdf', 'doc', 'ppt', 'link'].includes(doc.type);
        if (!isDoc) return false;

        const matchesType = selectedType === 'all' || doc.type === selectedType;
        return matchesType;
    });

    const filteredRecordings = resources.filter(rec => {
        return ['video', 'audio'].includes(rec.type);
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf': return '📄';
            case 'doc': return '📝';
            case 'ppt': return '📊';
            case 'video': return '🎬';
            case 'audio': return '🎧';
            case 'link': return '🔗';
            default: return '📁';
        }
    };

    return (
        <div className={styles.library}>
            <Navbar />

            <div className={styles.mainContainer}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1>📚 Resource Library</h1>
                        <p>Access study materials, documents, and class recordings</p>
                    </div>
                    <div className={styles.searchBar}>
                        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search documents, recordings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    {/* File Type Filter */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.filterTitle}>
                            <span>📂</span> File Type
                        </h3>
                        <div className={styles.filterOptions}>
                            {fileTypes.map(type => (
                                <button
                                    key={type.id}
                                    className={`${styles.filterOption} ${selectedType === type.id ? styles.active : ''}`}
                                    onClick={() => setSelectedType(type.id)}
                                >
                                    <span className={styles.filterIcon}>{type.icon}</span>
                                    <span className={styles.filterLabel}>{type.label}</span>
                                    {/* Count would need to be dynamic, hiding for now */}
                                    {/* <span className={styles.filterCount}>{type.count}</span> */}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Folder Structure */}
                    <div className={styles.filterSection}>
                        <h3 className={styles.filterTitle}>
                            <span>🗂️</span> Browse by Grade
                        </h3>
                        <div className={styles.folderTree}>
                            {grades.map(grade => (
                                <div key={grade.id}>
                                    <button
                                        className={`${styles.folderItem} ${expandedGrades.includes(grade.id) ? styles.expanded : ''}`}
                                        onClick={() => toggleGrade(grade.id)}
                                    >
                                        <span>{expandedGrades.includes(grade.id) ? '📂' : '📁'}</span>
                                        <span>{grade.label}</span>
                                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                                            {expandedGrades.includes(grade.id) ? '▼' : '▶'}
                                        </span>
                                    </button>
                                    {expandedGrades.includes(grade.id) && (
                                        <div className={styles.subFolders}>
                                            {grade.subjects.map(subject => (
                                                <button key={subject} className={styles.subFolder} onClick={() => setSearchQuery(subject)}>
                                                    <span>📄</span>
                                                    <span>{subject}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className={styles.contentArea}>
                    {/* Tabs */}
                    <div className={styles.tabsContainer}>
                        <button
                            className={`${styles.tab} ${activeTab === 'documents' ? styles.active : ''}`}
                            onClick={() => setActiveTab('documents')}
                        >
                            📄 Documents
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'recordings' ? styles.active : ''}`}
                            onClick={() => setActiveTab('recordings')}
                        >
                            🎬 Recordings
                        </button>
                    </div>

                    {/* Controls */}
                    <div className={styles.controlsBar}>
                        <span className={styles.resultCount}>
                            {isLoading ? 'Searching...' : `Showing ${activeTab === 'documents' ? filteredDocuments.length : filteredRecordings.length} resources`}
                        </span>
                        <div className={styles.viewToggle}>
                            <button
                                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" />
                                    <rect x="14" y="3" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" />
                                </svg>
                            </button>
                            <button
                                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="8" y1="6" x2="21" y2="6" />
                                    <line x1="8" y1="12" x2="21" y2="12" />
                                    <line x1="8" y1="18" x2="21" y2="18" />
                                    <line x1="3" y1="6" x2="3.01" y2="6" />
                                    <line x1="3" y1="12" x2="3.01" y2="12" />
                                    <line x1="3" y1="18" x2="3.01" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Documents Grid */}
                    {activeTab === 'documents' && (
                        <div className={styles.resourcesGrid}>
                            {filteredDocuments.map(doc => (
                                <div
                                    key={doc.id}
                                    className={`${styles.resourceCard} ${selectedResource?.id === doc.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedResource(doc)}
                                >
                                    <div className={`${styles.resourceIcon} ${styles[doc.type]}`}>
                                        {getTypeIcon(doc.type)}
                                    </div>
                                    <h4 className={styles.resourceTitle}>{doc.title}</h4>
                                    <div className={styles.resourceTags}>
                                        <span className={styles.resourceTag}>{doc.subject}</span>
                                        <span className={`${styles.resourceTag} ${styles.grade}`}>{doc.grade}</span>
                                        {doc.aiContent && (
                                            <span className={styles.resourceTag} style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none' }}>
                                                ✨ AI Generated
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.resourceMeta}>
                                        <span>👤 {doc.author}</span>
                                        {/* <span>•</span> */}
                                        {/* <span>{doc.date}</span> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recordings List */}
                    {activeTab === 'recordings' && (
                        <div className={styles.recordingsList}>
                            {filteredRecordings.map(rec => (
                                <div
                                    key={rec.id}
                                    className={`${styles.recordingCard} ${selectedResource?.id === rec.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedResource(rec)}
                                >
                                    <button className={styles.playBtn}>▶</button>
                                    <div className={styles.recordingInfo}>
                                        <h4 className={styles.recordingTitle}>{rec.title}</h4>
                                        <div className={styles.recordingDetails}>
                                            <span>📚 {rec.subject}</span>
                                            <span>👤 {rec.author}</span>
                                            <span>📅 {rec.date}</span>
                                            {/* <span>⏱️ {rec.duration}</span> */}
                                        </div>
                                    </div>
                                    <div className={styles.recordingActions}>
                                        <a
                                            href={rec.fileUrl || rec.link || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.actionBtn}
                                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Preview Panel */}
                <div className={styles.previewPanel}>
                    {selectedResource ? (
                        <>
                            <div className={styles.previewHeader}>
                                <h3>Preview</h3>
                                <button className={styles.closeBtn} onClick={() => setSelectedResource(null)}>✕</button>
                            </div>
                            <div className={styles.previewContent}>
                                {selectedResource.imageUrl ? (
                                    <img
                                        src={selectedResource.imageUrl}
                                        alt={selectedResource.title}
                                        className={styles.previewImage}
                                        style={{ width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '16px' }}
                                    />
                                ) : (
                                    <div className={`${styles.previewIcon} ${styles[selectedResource.type]}`}>
                                        {getTypeIcon(selectedResource.type)}
                                    </div>
                                )}
                                <h3 className={styles.previewTitle}>{selectedResource.title}</h3>
                                <div className={styles.previewTags}>
                                    <span className={styles.previewTag}>{selectedResource.subject}</span>
                                    <span className={styles.previewTag}>{selectedResource.grade}</span>
                                    <span className={styles.previewTag}>{selectedResource.type.toUpperCase()}</span>
                                </div>
                                <p className={styles.previewDescription}>{selectedResource.description}</p>

                                <a
                                    href={selectedResource.fileUrl || selectedResource.link || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.downloadBtn}
                                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    {selectedResource.type === 'link' || selectedResource.type === 'video' ? 'Open Resource' : 'View / Download'}
                                </a>

                                <div className={styles.secondaryActions}>
                                    <button className={styles.secondaryBtn}>
                                        <span>🔗</span> Share
                                    </button>
                                    <button className={styles.secondaryBtn}>
                                        <span>💾</span> Save
                                    </button>
                                </div>

                                <div className={styles.commentsSection}>
                                    <h4 className={styles.commentsTitle}>Comments</h4>
                                    <div className={styles.commentItem}>
                                        <div className={styles.commentAvatar}>T1</div>
                                        <div className={styles.commentContent}>
                                            <div className={styles.commentHeader}>
                                                <span className={styles.commentAuthor}>Teacher 1</span>
                                                <span className={styles.commentTime}>2 days ago</span>
                                            </div>
                                            <p className={styles.commentText}>Great resource! Very helpful for lesson planning.</p>
                                        </div>
                                    </div>
                                    <div className={styles.commentItem}>
                                        <div className={styles.commentAvatar}>T2</div>
                                        <div className={styles.commentContent}>
                                            <div className={styles.commentHeader}>
                                                <span className={styles.commentAuthor}>Teacher 2</span>
                                                <span className={styles.commentTime}>3 days ago</span>
                                            </div>
                                            <p className={styles.commentText}>Students found this very helpful!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyPreview}>
                            <div className={styles.emptyIcon}>📄</div>
                            <p>Select a resource to preview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
