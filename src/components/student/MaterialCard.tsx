import Link from 'next/link';
import {
    BarChart3,
    FileText,
    Video,
    File,
    Folder,
    Bell,
    Calendar,
    Star,
    ExternalLink
} from 'lucide-react';
import styles from './MaterialCard.module.css';

interface MaterialCardProps {
    material: {
        _id: string;
        type: 'quiz' | 'assignment' | 'video' | 'article' | 'resource' | 'announcement';
        title: string;
        description: string;
        dueDate?: string;
        points?: number;
        videoUrl?: string;
        fileUrl?: string;
        content?: string;
        teacher?: {
            name: string;
        };
        createdAt?: string;
    };
}

const materialColors = {
    quiz: '#3b82f6',
    assignment: '#f59e0b',
    video: '#ef4444',
    article: '#8b5cf6',
    resource: '#10b981',
    announcement: '#06b6d4'
};

export default function MaterialCard({ material }: MaterialCardProps) {
    const color = materialColors[material.type];

    const getIcon = () => {
        const size = 24;
        switch (material.type) {
            case 'quiz': return <BarChart3 size={size} />;
            case 'assignment': return <FileText size={size} />;
            case 'video': return <Video size={size} />;
            case 'article': return <File size={size} />;
            case 'resource': return <Folder size={size} />;
            case 'announcement': return <Bell size={size} />;
            default: return <FileText size={size} />;
        }
    };

    const isOverdue = material.dueDate && new Date(material.dueDate) < new Date();

    const getActionButton = () => {
        switch (material.type) {
            case 'quiz':
                return { text: 'Start Quiz', link: `/student/quiz/${material._id}` };
            case 'assignment':
                return { text: 'View Assignment', link: `/student/assignment/${material._id}` };
            case 'video':
                return { text: 'Watch Video', link: material.videoUrl || '#' };
            case 'article':
                return { text: 'Read Article', link: `/student/article/${material._id}` };
            case 'resource':
                return { text: 'Open Resource', link: material.fileUrl || '#' };
            case 'announcement':
                return { text: 'Read More', link: '#' };
            default:
                return { text: 'View', link: '#' };
        }
    };

    const action = getActionButton();

    return (
        <div
            className={`${styles.card} animate-scale-in`}
            style={{ color: color, '--btn-hover-color': color } as React.CSSProperties}
        >
            <div className={styles.iconWrapper} style={{ backgroundColor: `${color}15` }}>
                <span className={styles.icon}>{getIcon()}</span>
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.title} style={{ color: 'var(--color-text-primary)' }}>{material.title}</h3>
                    <span className={styles.typeBadge} style={{ backgroundColor: `${color}15`, borderColor: `${color}40` }}>
                        {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                    </span>
                </div>

                <p className={styles.description}>{material.description}</p>

                <div className={styles.footer}>
                    <div className={styles.meta}>
                        {material.dueDate && (
                            <span className={`${styles.dueDate} ${isOverdue ? styles.overdue : ''}`}>
                                <Calendar size={14} className="inline mr-1" />
                                Due: {new Date(material.dueDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        )}
                        {material.points && (
                            <span className={styles.points}>
                                <Star size={14} className="inline mr-1" />
                                {material.points} pts
                            </span>
                        )}
                    </div>

                    {action.link.startsWith('/') ? (
                        <Link
                            href={action.link}
                            className={styles.actionBtn}
                            style={{ borderColor: color, color: color }}
                        >
                            {action.text}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </Link>
                    ) : (
                        <a
                            href={action.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.actionBtn}
                            style={{ borderColor: color, color: color }}
                        >
                            {action.text}
                            <ExternalLink size={16} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
