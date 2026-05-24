'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    BackgroundVariant,
    NodeMouseHandler,
    type Node,
    type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './page.module.css';
import { useWorkflowStore } from '@/store/workflowStore';
import EditableNode from '@/components/workflow/EditableNode';
import { OutputRenderer } from '@/components/workflow/OutputRenderer';
import type { WorkflowDAG, WorkflowNode } from '@/types/workflow';
import { DEFAULT_TEMPLATES as templates } from '@/types/workflow';

// Initial empty arrays
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function AIStudioPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesState] = useEdgesState(initialEdges);
    const [prompt, setPrompt] = useState('');
    const [appName, setAppName] = useState('Untitled Workflow');
    const [isLoading, setIsLoading] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'logs' | 'json' | 'share'>('preview');

    // Publishing state
    const [teacherClassrooms, setTeacherClassrooms] = useState<{ _id: string, name: string, code: string }[]>([]);
    const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
    const [materialType, setMaterialType] = useState<string>('article');
    const [materialTitle, setMaterialTitle] = useState('');
    const [saveToLibrary, setSaveToLibrary] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishMessage, setPublishMessage] = useState('');

    const nodeTypes = useMemo(() => ({ editable: EditableNode }), []);

    const {
        currentDAG,
        executionLogs,
        nodeOutputs,
        isExecuting,
        isPreviewOpen,
        selectedNodeId,
        userInput,
        setDAG,
        addLog,
        clearLogs,
        setExecuting,
        setSelectedNode,
        setNodeOutput,
        setUserInput,
        setPreviewOpen,
        updateNodeInstruction,
        updateNodeStatus,
        addNode: addNodeToStore,
        deleteNode: deleteNodeFromStore,
        validateEdge,
        reset: resetWorkflow,
        getSelectedNode
    } = useWorkflowStore();

    const selectedNode = getSelectedNode();

    // Handle connection with validation
    const onConnect = useCallback((params: Connection) => {
        if (!params.source || !params.target) return;
        if (!validateEdge(params.source, params.target)) {
            addLog({ level: 'error', message: 'Invalid connection: check node types' });
            return;
        }
        setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, eds));
    }, [setEdges, validateEdge, addLog]);

    const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
        setSelectedNode(node.id);
    }, [setSelectedNode]);

    // Handle instruction save
    const handleInstructionSave = useCallback((nodeId: string, instruction: string) => {
        updateNodeInstruction(nodeId, instruction);
        addLog({ level: 'info', message: `Updated "${nodeId}" instructions` });
    }, [updateNodeInstruction, addLog]);

    // Handle node deletion
    const handleNodeDelete = useCallback((nodeId: string) => {
        deleteNodeFromStore(nodeId);
        setNodes((nds) => nds.filter(n => n.id !== nodeId));
        setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
        addLog({ level: 'info', message: `Deleted node "${nodeId}"` });
    }, [deleteNodeFromStore, setNodes, setEdges, addLog]);

    // Convert DAG to React Flow format
    const dagToFlow = useCallback((dag: WorkflowDAG) => {
        const flowNodes: Node[] = dag.nodes.map(node => ({
            id: node.node_id,
            type: 'editable',
            position: node.position,
            data: {
                nodeId: node.node_id,
                label: node.label,
                nodeType: node.node_type,
                promptTemplate: node.prompt_template,
                userInstruction: node.user_instruction,
                status: node.status,
                config: node.config,
                onInstructionSave: handleInstructionSave,
                onDelete: handleNodeDelete,
            },
        }));

        const flowEdges: Edge[] = dag.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 }
        }));

        return { nodes: flowNodes, edges: flowEdges };
    }, [handleInstructionSave, handleNodeDelete]);

    // Sync DAG to flow
    useEffect(() => {
        if (currentDAG) {
            const { nodes: flowNodes, edges: flowEdges } = dagToFlow(currentDAG);
            setNodes(flowNodes);
            setEdges(flowEdges);
        }
    }, [currentDAG, dagToFlow, setNodes, setEdges]);

    // Fetch teacher's classrooms for publishing
    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const response = await fetch('/api/teacher/my-classrooms');
                if (response.ok) {
                    const data = await response.json();
                    setTeacherClassrooms(data.classrooms || []);
                }
            } catch (error) {
                console.error('Failed to fetch classrooms:', error);
            }
        };
        fetchClassrooms();
    }, []);

    // Load template
    const loadTemplate = (template: typeof templates[0]) => {
        setDAG({ ...template.dag, id: `dag_${Date.now()}`, created_at: new Date().toISOString() });
        setAppName(template.name);
        addLog({ level: 'info', message: `Loaded template: ${template.name}` });
    };

    // Generate workflow from prompt
    const generateWorkflow = async () => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setUserInput(prompt);
        clearLogs();
        addLog({ level: 'info', message: 'Generating workflow...' });

        try {
            const response = await fetch('/api/generate-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await response.json();

            if (data.success && data.dag) {
                // Add default status and config to nodes
                data.dag.nodes = data.dag.nodes.map((n: WorkflowNode, i: number) => ({
                    ...n,
                    status: 'idle',
                    position: n.position || { x: 150 + i * 300, y: 200 },
                    config: n.config || {}
                }));
                setDAG(data.dag);
                setAppName(data.dag.name);
                addLog({ level: 'success', message: `Created "${data.dag.name}" with ${data.dag.nodes.length} nodes` });
            } else {
                throw new Error(data.error || 'Generation failed');
            }
        } catch (error) {
            addLog({ level: 'error', message: error instanceof Error ? error.message : 'Generation error' });
        } finally {
            setIsLoading(false);
            setPrompt('');
        }
    };

    // Run workflow
    const runWorkflow = async () => {
        if (!currentDAG || isExecuting) return;

        setPreviewOpen(true);
        setExecuting(true);
        clearLogs();
        addLog({ level: 'info', message: `Running "${currentDAG.name}"...` });

        // Reset all node statuses
        currentDAG.nodes.forEach(n => updateNodeStatus(n.node_id, 'idle'));

        try {
            const response = await fetch('/api/opal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    execute_dag: true,
                    dag: currentDAG,
                    user_input: userInput || prompt
                }),
            });
            const data = await response.json();

            if (data.success && data.execution_result) {
                Object.entries(data.execution_result.nodeOutputs).forEach(([nodeId, output]) => {
                    setNodeOutput(nodeId, output as string);
                    updateNodeStatus(nodeId, 'success');
                });
                addLog({ level: 'success', message: 'Workflow completed!' });
            } else {
                throw new Error(data.error || 'Execution failed');
            }
        } catch (error) {
            addLog({ level: 'error', message: error instanceof Error ? error.message : 'Execution error' });
        } finally {
            setExecuting(false);
        }
    };

    // Add new node
    const addNewNode = (type: 'Input' | 'Process' | 'AI' | 'Output') => {
        const newNode: WorkflowNode = {
            node_id: `${type.toLowerCase()}_${Date.now()}`,
            node_type: type,
            label: `New ${type}`,
            input_refs: [],
            status: 'idle',
            position: { x: 300, y: 300 },
            config: type === 'Input' ? { inputType: 'text' } :
                type === 'AI' ? { model: 'gemini-2.5-flash' } :
                    type === 'Output' ? { outputFormat: 'text' } : {}
        };
        addNodeToStore(newNode);
        setShowAddMenu(false);
        addLog({ level: 'info', message: `Added ${type} node` });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateWorkflow();
        }
    };

    // Find final output
    const getFinalOutput = () => {
        if (!currentDAG) return null;
        const outputNode = currentDAG.nodes.find(n => n.node_type === 'Output');
        return outputNode ? nodeOutputs[outputNode.node_id] : null;
    };

    return (
        <div className={styles.container}>
            {/* Top Toolbar */}
            <header className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <button className={styles.backBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className={styles.appNameInput}
                    />
                    <span className={styles.badge}>CANVAS</span>
                </div>

                <div className={styles.toolbarCenter}>
                    <div className={styles.addDropdown}>
                        <button
                            className={styles.addBtn}
                            onClick={() => setShowAddMenu(!showAddMenu)}
                        >
                            + Add Node
                        </button>
                        {showAddMenu && (
                            <div className={styles.addMenu}>
                                <button onClick={() => addNewNode('Input')}>📥 Input</button>
                                <button onClick={() => addNewNode('Process')}>⚙️ Process</button>
                                <button onClick={() => addNewNode('AI')}>🤖 AI</button>
                                <button onClick={() => addNewNode('Output')}>📤 Output</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.toolbarRight}>
                    <button
                        className={styles.resetBtn}
                        onClick={() => setPreviewOpen(!isPreviewOpen)}
                        title={isPreviewOpen ? "Hide Preview" : "Show Preview"}
                    >
                        {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
                    </button>
                    <button className={styles.resetBtn} onClick={resetWorkflow}>
                        Reset
                    </button>
                    <button
                        className={styles.runBtn}
                        onClick={runWorkflow}
                        disabled={!currentDAG || isExecuting}
                    >
                        {isExecuting ? (
                            <><span className={styles.spinner}></span> Running...</>
                        ) : (
                            <>▶ Run</>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className={styles.main}>
                {/* Canvas Area */}
                <main className={styles.canvasArea}>
                    {currentDAG ? (
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesState}
                            onConnect={onConnect}
                            onNodeClick={onNodeClick}
                            nodeTypes={nodeTypes}
                            fitView
                            style={{ background: '#f8fafc' }}
                        >
                            <Controls />
                            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#cbd5e1" />
                        </ReactFlow>
                    ) : (
                        <div className={styles.emptyCanvas}>
                            <div className={styles.emptyIcon}>🎨</div>
                            <h2>Create Your Workflow</h2>
                            <p>Use a template or describe your workflow below</p>
                        </div>
                    )}

                    {/* Floating Prompt Bar */}
                    <div className={styles.floatingPrompt}>

                        {/* Templates Menu (Popup) */}
                        {showTemplates && (
                            <div className={styles.templatesMenu}>
                                <div className={styles.menuHeader}>Start with a Template</div>
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        className={styles.menuItem}
                                        onClick={() => { loadTemplate(t); setShowTemplates(false); }}
                                    >
                                        <span className={styles.menuIcon}>{t.icon}</span>
                                        <div className={styles.menuInfo}>
                                            <span className={styles.menuTitle}>{t.name}</span>
                                            <span className={styles.menuDesc}>{t.description}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            className={styles.plusBtn}
                            onClick={() => setShowTemplates(!showTemplates)}
                            title="Choose a template"
                        >
                            +
                        </button>

                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Describe your workflow (e.g., Create a quiz generator about any topic)..."
                            disabled={isLoading}
                        />
                        <button
                            onClick={generateWorkflow}
                            disabled={isLoading || !prompt.trim()}
                        >
                            {isLoading ? <span className={styles.spinner}></span> : '✨ Generate'}
                        </button>
                    </div>
                </main>

                {/* Preview Panel (Right Side) */}
                <aside className={`${styles.previewPanel} ${isPreviewOpen ? styles.previewOpen : ''}`}>
                    <div className={styles.previewHeader}>
                        <h3>Output Panel</h3>
                        <button className={styles.closeBtn} onClick={() => setPreviewOpen(false)}>✕</button>
                    </div>

                    {/* Tab Bar */}
                    <div className={styles.tabBar}>
                        <button
                            className={`${styles.tab} ${activeTab === 'preview' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('preview')}
                        >
                            <span className={styles.tabIcon}>👁️</span>
                            Preview
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'logs' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('logs')}
                        >
                            <span className={styles.tabIcon}>📋</span>
                            Logs
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'json' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('json')}
                        >
                            <span className={styles.tabIcon}>{ }</span>
                            JSON
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'share' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('share')}
                        >
                            <span className={styles.tabIcon}>📤</span>
                            Share
                        </button>
                    </div>

                    <div className={styles.tabContent}>
                        {/* Preview Tab */}
                        <div className={`${styles.tabPanel} ${activeTab === 'preview' ? styles.tabPanelActive : ''}`}>
                            {isExecuting ? (
                                <div className={styles.executing}>
                                    <div className={styles.bigSpinner}></div>
                                    <p>Executing workflow...</p>
                                </div>
                            ) : getFinalOutput() ? (
                                <div className={styles.outputResult}>
                                    <h4>Output</h4>
                                    <OutputRenderer content={getFinalOutput() || ''} />
                                </div>
                            ) : (
                                <div className={styles.emptyPreview}>
                                    <p>Click "Run" to execute the workflow</p>
                                </div>
                            )}
                        </div>

                        {/* Logs Tab */}
                        <div className={`${styles.tabPanel} ${activeTab === 'logs' ? styles.tabPanelActive : ''}`}>
                            {executionLogs.length > 0 ? (
                                <div className={styles.logsSection}>
                                    <h4>Execution Logs</h4>
                                    <div className={styles.logsList}>
                                        {executionLogs.map(log => (
                                            <div key={log.id} className={`${styles.logEntry} ${styles[`log_${log.level}`]}`}>
                                                {log.message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.emptyPreview}>
                                    <p>No logs yet. Run a workflow to see logs.</p>
                                </div>
                            )}
                        </div>

                        {/* JSON View Tab */}
                        <div className={`${styles.tabPanel} ${activeTab === 'json' ? styles.tabPanelActive : ''}`}>
                            {getFinalOutput() ? (
                                <div className={styles.jsonView}>
                                    <pre>{JSON.stringify({
                                        workflow: currentDAG?.name,
                                        executedAt: new Date().toISOString(),
                                        nodeOutputs: nodeOutputs,
                                        finalOutput: getFinalOutput()
                                    }, null, 2)}</pre>
                                </div>
                            ) : (
                                <div className={styles.emptyPreview}>
                                    <p>No JSON output yet. Run a workflow to see raw data.</p>
                                </div>
                            )}
                        </div>

                        {/* Share Tab */}
                        <div className={`${styles.tabPanel} ${activeTab === 'share' ? styles.tabPanelActive : ''}`}>
                            {getFinalOutput() ? (
                                <div className={styles.publishSection}>
                                    <h4>📤 Publish to Classroom</h4>

                                    <div className={styles.publishField}>
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={materialTitle || appName}
                                            onChange={(e) => setMaterialTitle(e.target.value)}
                                            placeholder="Material title"
                                            className={styles.publishInput}
                                        />
                                    </div>

                                    <div className={styles.publishField}>
                                        <label>Type</label>
                                        <select
                                            value={materialType}
                                            onChange={(e) => setMaterialType(e.target.value)}
                                            className={styles.publishSelect}
                                        >
                                            <option value="article">📄 Article</option>
                                            <option value="announcement">📢 Announcement</option>
                                            <option value="assignment">📝 Assignment</option>
                                            <option value="quiz">📊 Quiz</option>
                                            <option value="resource">📁 Resource</option>
                                            <option value="video">🎥 Video</option>
                                        </select>
                                    </div>

                                    <div className={styles.publishField}>
                                        <label>Select Classrooms</label>
                                        <div className={styles.classroomList}>
                                            {teacherClassrooms.length === 0 ? (
                                                <p className={styles.noClassrooms}>No classrooms found. Create one first!</p>
                                            ) : (
                                                teacherClassrooms.map(c => (
                                                    <label key={c._id} className={styles.classroomCheckbox}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedClassrooms.includes(c._id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedClassrooms([...selectedClassrooms, c._id]);
                                                                } else {
                                                                    setSelectedClassrooms(selectedClassrooms.filter(id => id !== c._id));
                                                                }
                                                            }}
                                                        />
                                                        <span>{c.name}</span>
                                                        <span className={styles.classroomCode}>{c.code}</span>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <label className={styles.saveToLibraryCheck}>
                                        <input
                                            type="checkbox"
                                            checked={saveToLibrary}
                                            onChange={(e) => setSaveToLibrary(e.target.checked)}
                                        />
                                        <span>Also save to Library</span>
                                    </label>

                                    {publishMessage && (
                                        <div className={styles.publishMessage}>
                                            {publishMessage}
                                        </div>
                                    )}

                                    <button
                                        className={styles.publishBtn}
                                        onClick={async () => {
                                            if (selectedClassrooms.length === 0) {
                                                setPublishMessage('Please select at least one classroom');
                                                return;
                                            }
                                            setIsPublishing(true);
                                            setPublishMessage('');
                                            try {
                                                const response = await fetch('/api/teacher/publish-material', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        classroomIds: selectedClassrooms,
                                                        type: materialType,
                                                        title: materialTitle || appName,
                                                        description: 'Generated via AI Studio',
                                                        content: getFinalOutput(),
                                                        saveToLibrary
                                                    })
                                                });
                                                const data = await response.json();
                                                if (response.ok) {
                                                    setPublishMessage(`✅ ${data.message}`);
                                                    setSelectedClassrooms([]);
                                                } else {
                                                    setPublishMessage(`❌ ${data.error}`);
                                                }
                                            } catch (error) {
                                                setPublishMessage('❌ Failed to publish');
                                            } finally {
                                                setIsPublishing(false);
                                            }
                                        }}
                                        disabled={isPublishing || selectedClassrooms.length === 0}
                                    >
                                        {isPublishing ? 'Publishing...' : `Publish to ${selectedClassrooms.length} Classroom(s)`}
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.emptyPreview}>
                                    <p>Run a workflow first to share the output</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
