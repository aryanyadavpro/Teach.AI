'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

interface Classroom {
    _id: string;
    name: string;
    code: string;
}

interface Resource {
    _id: string;
    title: string;
    description?: string;
    type: 'pdf' | 'doc' | 'ppt' | 'image' | 'other';
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    subject?: string;
    classroomId?: { _id: string; name: string };
    createdAt: string;
}

export default function ContentManagementPage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [selectedClassroomFilter, setSelectedClassroomFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        classroomId: '',
        subject: '',
        tags: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchClassrooms();
        fetchResources();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const response = await fetch('/api/teacher/classroom');
            if (response.ok) {
                const data = await response.json();
                setClassrooms(data);
            }
        } catch (error) {
            console.error('Error fetching classrooms:', error);
        }
    };

    const fetchResources = async (classroomId?: string) => {
        try {
            const url = classroomId && classroomId !== 'all'
                ? `/api/teacher/content?classroomId=${classroomId}`
                : '/api/teacher/content';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setResources(data.resources || []);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClassroomFilterChange = (classroomId: string) => {
        setSelectedClassroomFilter(classroomId);
        setIsLoading(true);
        fetchResources(classroomId);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!formData.title) {
                setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !formData.title || !formData.classroomId) {
            alert('Please select a file, enter a title, and choose a classroom');
            return;
        }

        setIsUploading(true);
        setUploadProgress(20);

        try {
            const data = new FormData();
            data.append('file', selectedFile);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('classroomId', formData.classroomId);
            data.append('subject', formData.subject);
            data.append('tags', formData.tags);

            setUploadProgress(50);

            const response = await fetch('/api/teacher/content', {
                method: 'POST',
                body: data
            });

            setUploadProgress(80);

            if (response.ok) {
                setUploadProgress(100);
                setShowUploadModal(false);
                setSelectedFile(null);
                setFormData({ title: '', description: '', classroomId: '', subject: '', tags: '' });
                fetchResources(selectedClassroomFilter);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to upload');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;

        try {
            const response = await fetch(`/api/teacher/content?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchResources(selectedClassroomFilter);
            } else {
                alert('Failed to delete resource');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf': return '📄';
            case 'doc': return '📝';
            case 'ppt': return '📊';
            case 'image': return '🖼️';
            default: return '📁';
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Content Management</h1>
                    <p className={styles.subtitle}>Upload and manage learning resources for your classrooms</p>
                </div>
                <button
                    className={styles.uploadBtn}
                    onClick={() => setShowUploadModal(true)}
                    disabled={classrooms.length === 0}
                >
                    + Upload Resource
                </button>
            </div>

            {/* Classroom Filter */}
            {classrooms.length > 0 && (
                <div className={styles.filterBar}>
                    <span className={styles.filterLabel}>Filter by classroom:</span>
                    <select
                        value={selectedClassroomFilter}
                        onChange={(e) => handleClassroomFilterChange(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Classrooms</option>
                        {classrooms.map(cls => (
                            <option key={cls._id} value={cls._id}>{cls.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {classrooms.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📚</span>
                    <h3>Create a classroom first</h3>
                    <p>You need at least one classroom before uploading resources</p>
                    <a href="/teacher/classes" className={styles.uploadBtn}>Go to Classes</a>
                </div>
            ) : isLoading ? (
                <div className={styles.loading}>Loading resources...</div>
            ) : resources.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📚</span>
                    <h3>No resources uploaded yet</h3>
                    <p>Upload PDFs, documents, presentations, and images for your students</p>
                    <button className={styles.uploadBtn} onClick={() => setShowUploadModal(true)}>
                        Upload Your First Resource
                    </button>
                </div>
            ) : (
                <div className={styles.resourceGrid}>
                    {resources.map((resource) => (
                        <div key={resource._id} className={styles.resourceCard}>
                            <div className={styles.resourceIcon}>
                                {getTypeIcon(resource.type)}
                            </div>
                            <div className={styles.resourceInfo}>
                                <h4 className={styles.resourceTitle}>{resource.title}</h4>
                                <p className={styles.resourceMeta}>
                                    {resource.type.toUpperCase()} • {formatFileSize(resource.fileSize)}
                                    {resource.classroomId && ` • ${resource.classroomId.name}`}
                                </p>
                                {resource.description && (
                                    <p className={styles.resourceDesc}>{resource.description}</p>
                                )}
                            </div>
                            <div className={styles.resourceActions}>
                                <a
                                    href={resource.fileUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.viewBtn}
                                >
                                    View
                                </a>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(resource._id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className={styles.modalOverlay} onClick={() => !isUploading && setShowUploadModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Upload Resource</h2>
                            <button
                                className={styles.closeBtn}
                                onClick={() => !isUploading && setShowUploadModal(false)}
                                disabled={isUploading}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className={styles.uploadForm}>
                            {/* File Drop Zone */}
                            <div
                                className={`${styles.dropZone} ${selectedFile ? styles.hasFile : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                                    hidden
                                />
                                {selectedFile ? (
                                    <div className={styles.selectedFile}>
                                        <span className={styles.fileIcon}>{getTypeIcon(selectedFile.type)}</span>
                                        <span className={styles.fileName}>{selectedFile.name}</span>
                                        <span className={styles.fileSize}>{formatFileSize(selectedFile.size)}</span>
                                    </div>
                                ) : (
                                    <div className={styles.dropPrompt}>
                                        <span className={styles.dropIcon}>📤</span>
                                        <p>Click to select file</p>
                                        <span className={styles.dropHint}>PDF, DOC, PPT, Images</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroupFull}>
                                    <label>Classroom *</label>
                                    <select
                                        value={formData.classroomId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, classroomId: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select classroom</option>
                                        {classrooms.map(cls => (
                                            <option key={cls._id} value={cls._id}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Resource title"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Subject</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                    >
                                        <option value="">Select subject</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Science">Science</option>
                                        <option value="English">English</option>
                                        <option value="History">History</option>
                                        <option value="Geography">Geography</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className={styles.formGroupFull}>
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description of the resource"
                                        rows={2}
                                    />
                                </div>

                                <div className={styles.formGroupFull}>
                                    <label>Tags</label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                        placeholder="e.g., algebra, chapter1 (comma separated)"
                                    />
                                </div>
                            </div>

                            {isUploading && (
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                                </div>
                            )}

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={!selectedFile || !formData.title || !formData.classroomId || isUploading}
                            >
                                {isUploading ? 'Uploading...' : 'Upload Resource'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
