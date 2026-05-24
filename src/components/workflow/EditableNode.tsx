'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useWorkflowStore } from '@/store/workflowStore';
import type { NodeStatus, NodeType, WorkflowNode } from '@/types/workflow';
import styles from './EditableNode.module.css';

interface EditableNodeData {
    nodeId: string;
    label: string;
    nodeType: NodeType;
    promptTemplate?: string;
    userInstruction?: string;
    status: NodeStatus;
    config?: WorkflowNode['config'];
    onInstructionSave?: (nodeId: string, instruction: string) => void;
    onDelete?: (nodeId: string) => void;
}

interface EditableNodeProps {
    data: EditableNodeData;
    selected?: boolean;
}

function EditableNode({ data, selected }: EditableNodeProps) {
    const { nodeId, label, nodeType, promptTemplate, userInstruction, status, config, onInstructionSave, onDelete } = data;
    const [instruction, setInstruction] = useState(userInstruction || '');
    const [isEditing, setIsEditing] = useState(false);

    const { setSelectedNode, nodeOutputs } = useWorkflowStore();
    const output = nodeOutputs[nodeId];

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedNode(nodeId);
    }, [nodeId, setSelectedNode]);

    const handleSave = () => {
        onInstructionSave?.(nodeId, instruction);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
        e.stopPropagation();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(nodeId);
    };

    const getStatusColor = () => {
        switch (status) {
            case 'running': return '#3b82f6';
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'running': return '⏳';
            case 'success': return '✓';
            case 'error': return '✕';
            default: return '○';
        }
    };

    const getNodeTypeIcon = () => {
        switch (nodeType) {
            case 'Input': return '📥';
            case 'Process': return '⚙️';
            case 'AI': return '🤖';
            case 'Output': return '📤';
            default: return '📦';
        }
    };

    const getNodeTypeColor = () => {
        switch (nodeType) {
            case 'Input': return '#8b5cf6';
            case 'Process': return '#f59e0b';
            case 'AI': return '#3b82f6';
            case 'Output': return '#10b981';
            default: return '#64748b';
        }
    };

    return (
        <div
            className={`${styles.nodeContainer} ${selected ? styles.selected : ''}`}
            onClick={handleClick}
            style={{ borderTopColor: getNodeTypeColor() }}
        >
            {/* Input Handle (not for Input nodes) */}
            {nodeType !== 'Input' && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className={styles.handle}
                    style={{ background: getNodeTypeColor() }}
                />
            )}

            {/* Header */}
            <div className={styles.header}>
                <span className={styles.typeIcon}>{getNodeTypeIcon()}</span>
                <span className={styles.label}>{label}</span>
                <span
                    className={styles.statusIndicator}
                    style={{ color: getStatusColor() }}
                    title={status}
                >
                    {getStatusIcon()}
                </span>
                <button className={styles.deleteBtn} onClick={handleDelete} title="Delete node">
                    ✕
                </button>
            </div>

            {/* Node Type Badge */}
            <div className={styles.typeBadge} style={{ background: getNodeTypeColor() }}>
                {nodeType}
            </div>

            {/* Prompt Template (AI nodes) */}
            {nodeType === 'AI' && promptTemplate && (
                <div className={styles.templateSection}>
                    <span className={styles.templateLabel}>Prompt:</span>
                    <span className={styles.templateText}>
                        {promptTemplate.length > 60 ? promptTemplate.slice(0, 60) + '...' : promptTemplate}
                    </span>
                </div>
            )}

            {/* Config Preview */}
            {config && Object.keys(config).length > 0 && (
                <div className={styles.configSection}>
                    {nodeType === 'Input' && config.inputType && (
                        <span className={styles.configTag}>📝 {config.inputType as string}</span>
                    )}
                    {nodeType === 'Process' && config.processType && (
                        <span className={styles.configTag}>⚙️ {config.processType as string}</span>
                    )}
                    {nodeType === 'Output' && config.outputFormat && (
                        <span className={styles.configTag}>📄 {config.outputFormat as string}</span>
                    )}
                </div>
            )}

            {/* Instruction Box (AI nodes) */}
            {nodeType === 'AI' && (
                <div className={styles.instructionSection}>
                    {isEditing ? (
                        <div className={styles.editArea}>
                            <textarea
                                className={styles.instructionInput}
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Add instructions..."
                                rows={2}
                                autoFocus
                            />
                            <div className={styles.editActions}>
                                <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                                <button className={styles.saveBtn} onClick={handleSave}>
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={styles.instructionPreview}
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        >
                            {instruction || <span className={styles.placeholder}>+ Add instructions</span>}
                        </div>
                    )}
                </div>
            )}

            {/* Output Preview */}
            {output && status === 'success' && (
                <div className={styles.outputPreview}>
                    <span className={styles.outputText}>
                        {output.length > 50 ? output.slice(0, 50) + '...' : output}
                    </span>
                </div>
            )}

            {/* Output Handle (not for Output nodes) */}
            {nodeType !== 'Output' && (
                <Handle
                    type="source"
                    position={Position.Right}
                    className={styles.handle}
                    style={{ background: getNodeTypeColor() }}
                />
            )}
        </div>
    );
}

export default memo(EditableNode);
