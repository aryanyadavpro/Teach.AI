import { create } from 'zustand';
import type { WorkflowDAG, LogEntry, WorkflowNode, NodeStatus, WorkflowEdge, EdgeType } from '@/types/workflow';

interface WorkflowState {
    // Current DAG
    currentDAG: WorkflowDAG | null;

    // Node outputs - tracks outputs for step references
    nodeOutputs: Record<string, string>;

    // Execution logs for Console
    executionLogs: LogEntry[];

    // Execution state
    isExecuting: boolean;
    currentNodeId: string | null;

    // Canvas-first: Selected node for editing
    selectedNodeId: string | null;

    // Preview panel visibility
    isPreviewOpen: boolean;

    // User input for first node
    userInput: string;

    // Actions
    setDAG: (dag: WorkflowDAG | null) => void;
    setNodeOutput: (nodeId: string, output: string) => void;
    addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
    clearLogs: () => void;
    setExecuting: (isExecuting: boolean) => void;
    setCurrentNode: (nodeId: string | null) => void;
    setSelectedNode: (nodeId: string | null) => void;
    setPreviewOpen: (isOpen: boolean) => void;
    setUserInput: (input: string) => void;
    reset: () => void;

    // Node manipulation
    addNode: (node: WorkflowNode) => void;
    deleteNode: (nodeId: string) => void;
    updateNodeInstruction: (nodeId: string, instruction: string) => void;
    updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
    updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
    updateNodeConfig: (nodeId: string, config: Partial<WorkflowNode['config']>) => void;

    // Edge manipulation
    addEdge: (edge: WorkflowEdge) => void;
    deleteEdge: (edgeId: string) => void;
    validateEdge: (source: string, target: string,) => boolean;

    // Getters
    getOutputByRef: (ref: string) => string | undefined;
    getSelectedNode: () => WorkflowNode | null;
    getParentOutput: (nodeId: string) => string | undefined;
    getDownstreamNodes: (nodeId: string) => string[];
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
    currentDAG: null,
    nodeOutputs: {},
    executionLogs: [],
    isExecuting: false,
    currentNodeId: null,
    selectedNodeId: null,
    isPreviewOpen: false,
    userInput: '',

    setDAG: (dag) => set({ currentDAG: dag }),

    setNodeOutput: (nodeId, output) =>
        set((state) => ({
            nodeOutputs: { ...state.nodeOutputs, [nodeId]: output }
        })),

    addLog: (log) =>
        set((state) => ({
            executionLogs: [
                ...state.executionLogs,
                {
                    ...log,
                    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString()
                }
            ]
        })),

    clearLogs: () => set({ executionLogs: [] }),

    setExecuting: (isExecuting) => set({ isExecuting }),

    setCurrentNode: (nodeId) => set({ currentNodeId: nodeId }),

    setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

    setPreviewOpen: (isOpen) => set({ isPreviewOpen: isOpen }),

    setUserInput: (input) => set({ userInput: input }),

    reset: () => set({
        currentDAG: null,
        nodeOutputs: {},
        executionLogs: [],
        isExecuting: false,
        currentNodeId: null,
        selectedNodeId: null,
        isPreviewOpen: false,
        userInput: ''
    }),

    // Add a new node to the DAG
    addNode: (node) =>
        set((state) => {
            if (!state.currentDAG) {
                // Create new DAG with this node
                return {
                    currentDAG: {
                        id: `dag_${Date.now()}`,
                        name: 'New Workflow',
                        nodes: [node],
                        edges: [],
                        created_at: new Date().toISOString()
                    }
                };
            }
            return {
                currentDAG: {
                    ...state.currentDAG,
                    nodes: [...state.currentDAG.nodes, node]
                }
            };
        }),

    // Delete a node and its connected edges
    deleteNode: (nodeId) =>
        set((state) => {
            if (!state.currentDAG) return state;
            return {
                currentDAG: {
                    ...state.currentDAG,
                    nodes: state.currentDAG.nodes.filter(n => n.node_id !== nodeId),
                    edges: state.currentDAG.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
                },
                selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId
            };
        }),

    // Update user instruction for a specific node
    updateNodeInstruction: (nodeId, instruction) =>
        set((state) => {
            if (!state.currentDAG) return state;
            return {
                currentDAG: {
                    ...state.currentDAG,
                    nodes: state.currentDAG.nodes.map(node =>
                        node.node_id === nodeId
                            ? { ...node, user_instruction: instruction }
                            : node
                    )
                }
            };
        }),

    // Update status for a specific node
    updateNodeStatus: (nodeId, status) =>
        set((state) => {
            if (!state.currentDAG) return state;
            return {
                currentDAG: {
                    ...state.currentDAG,
                    nodes: state.currentDAG.nodes.map(node =>
                        node.node_id === nodeId
                            ? { ...node, status }
                            : node
                    )
                }
            };
        }),

    // Update position for a specific node
    updateNodePosition: (nodeId, position) =>
        set((state) => {
            if (!state.currentDAG) return state;
            return {
                currentDAG: {
                    ...state.currentDAG,
                    nodes: state.currentDAG.nodes.map(node =>
                        node.node_id === nodeId
                            ? { ...node, position }
                            : node
                    )
                }
            };
        }),

    // Update node config
    updateNodeConfig: (nodeId, config) =>
        set((state) => {
            if (!state.currentDAG) return state;
            return {
                currentDAG: {
                    ...state.currentDAG,
                    nodes: state.currentDAG.nodes.map(node =>
                        node.node_id === nodeId
                            ? { ...node, config: { ...node.config, ...config } }
                            : node
                    )
                }
            };
        }),

    // Add an edge
    addEdge: (edge) =>
        set((state) => {
            if (!state.currentDAG) return state;
            return {
                currentDAG: {
                    ...state.currentDAG,
                    edges: [...state.currentDAG.edges, edge]
                }
            };
        }),

    // Delete an edge
    deleteEdge: (edgeId) =>
        set((state) => {
            if (!state.currentDAG) return state;
            return {
                currentDAG: {
                    ...state.currentDAG,
                    edges: state.currentDAG.edges.filter(e => e.id !== edgeId)
                }
            };
        }),

    // Validate edge connection (typed connections)
    validateEdge: (source, target) => {
        const state = get();
        if (!state.currentDAG) return false;

        const sourceNode = state.currentDAG.nodes.find(n => n.node_id === source);
        const targetNode = state.currentDAG.nodes.find(n => n.node_id === target);

        if (!sourceNode || !targetNode) return false;

        // Output nodes cannot be sources
        if (sourceNode.node_type === 'Output') return false;

        // Input nodes cannot be targets
        if (targetNode.node_type === 'Input') return false;

        // Prevent self-loops
        if (source === target) return false;

        // Prevent duplicate connections
        const existingEdge = state.currentDAG.edges.find(
            e => e.source === source && e.target === target
        );
        if (existingEdge) return false;

        return true;
    },

    getOutputByRef: (ref) => {
        const state = get();
        const cleanRef = ref.startsWith('@') ? ref.slice(1) : ref;

        // Handle @Step1, @Step2 format
        if (cleanRef.toLowerCase().startsWith('step')) {
            const stepNum = parseInt(cleanRef.slice(4), 10);
            if (state.currentDAG && stepNum > 0 && stepNum <= state.currentDAG.nodes.length) {
                const nodeId = state.currentDAG.nodes[stepNum - 1].node_id;
                return state.nodeOutputs[nodeId];
            }
        }

        // Handle @parentOutput
        if (cleanRef === 'parentOutput') {
            const selectedId = state.selectedNodeId || state.currentNodeId;
            if (selectedId) {
                return get().getParentOutput(selectedId);
            }
        }

        // Handle direct node_id reference
        return state.nodeOutputs[cleanRef];
    },

    getSelectedNode: () => {
        const state = get();
        if (!state.currentDAG || !state.selectedNodeId) return null;
        return state.currentDAG.nodes.find(n => n.node_id === state.selectedNodeId) || null;
    },

    getParentOutput: (nodeId) => {
        const state = get();
        if (!state.currentDAG) return undefined;

        const parentEdge = state.currentDAG.edges.find(e => e.target === nodeId);
        if (parentEdge) {
            return state.nodeOutputs[parentEdge.source];
        }
        return undefined;
    },

    getDownstreamNodes: (nodeId) => {
        const state = get();
        if (!state.currentDAG) return [];

        const downstream: string[] = [];
        const queue = [nodeId];
        const visited = new Set<string>();

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (visited.has(current)) continue;
            visited.add(current);

            const children = state.currentDAG.edges
                .filter(e => e.source === current)
                .map(e => e.target);

            for (const child of children) {
                downstream.push(child);
                queue.push(child);
            }
        }

        return downstream;
    }
}));
