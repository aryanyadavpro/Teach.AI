// Opal-Lite Workflow Engine Types
// Canvas Orchestrator with Multi-Step Generation

export type NodeType = 'Input' | 'Process' | 'AI' | 'Output';
export type NodeStatus = 'idle' | 'running' | 'success' | 'error';
export type EdgeType = 'data' | 'trigger' | 'control';

// Editable Node with config object
export interface WorkflowNode {
    node_id: string;
    node_type: NodeType;
    label: string;

    // Input references from other nodes
    input_refs: string[];

    // Core instruction/prompt template
    prompt_template?: string;

    // User's further instructions (editable via node UI)
    user_instruction?: string;

    // Execution status
    status: NodeStatus;

    // Position for React Flow
    position: { x: number; y: number };

    // Node configuration
    config: {
        // Input node: data type expected
        inputType?: 'text' | 'file' | 'json';

        // Process node: transformation type
        processType?: 'transform' | 'filter' | 'merge' | 'split';

        // AI node: model settings
        model?: string;
        temperature?: number;
        maxTokens?: number;

        // Output node: format settings
        outputFormat?: 'text' | 'json' | 'ui' | 'markdown' | 'quiz_json' | 'flashcard_json';

        // Custom config
        [key: string]: unknown;
    };
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    type: EdgeType;
    animated?: boolean;
}

export interface WorkflowDAG {
    id: string;
    name: string;
    description?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    created_at: string;
}

// Template for quick start
export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    dag: WorkflowDAG;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    level: 'info' | 'success' | 'error' | 'step';
    message: string;
    nodeId?: string;
    data?: unknown;
}

export interface ExecutionResult {
    success: boolean;
    finalOutput?: string;
    nodeOutputs: Record<string, string>;
    logs: LogEntry[];
    error?: string;
}

// JSON Schema for "Architect" agent output
export const DAG_JSON_SCHEMA = {
    type: 'object',
    required: ['id', 'name', 'nodes', 'edges'],
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        nodes: {
            type: 'array',
            minItems: 3,
            items: {
                type: 'object',
                required: ['node_id', 'node_type', 'label', 'input_refs', 'position', 'config'],
                properties: {
                    node_id: { type: 'string' },
                    node_type: { enum: ['Input', 'Process', 'AI', 'Output'] },
                    label: { type: 'string' },
                    input_refs: { type: 'array', items: { type: 'string' } },
                    prompt_template: { type: 'string' },
                    user_instruction: { type: 'string' },
                    status: { enum: ['idle', 'running', 'success', 'error'] },
                    position: {
                        type: 'object',
                        properties: { x: { type: 'number' }, y: { type: 'number' } }
                    },
                    config: { type: 'object' }
                }
            }
        },
        edges: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'source', 'target', 'type'],
                properties: {
                    id: { type: 'string' },
                    source: { type: 'string' },
                    target: { type: 'string' },
                    type: { enum: ['data', 'trigger', 'control'] }
                }
            }
        }
    }
} as const;

// Default templates
export const DEFAULT_TEMPLATES: WorkflowTemplate[] = [
    {
        id: 'quiz-generator',
        name: 'Quiz Generator',
        description: 'Generate quizzes on any topic',
        icon: '📝',
        dag: {
            id: 'template_quiz',
            name: 'Quiz Generator',
            nodes: [
                { node_id: 'input_1', node_type: 'Input', label: 'Topic Input', input_refs: [], status: 'idle', position: { x: 100, y: 200 }, config: { inputType: 'text' } },
                { node_id: 'ai_1', node_type: 'AI', label: 'Generate Questions', input_refs: ['@input_1'], prompt_template: 'Generate 5 multiple-choice quiz questions about: @input_1. Return purely valid JSON with this structure: { "questions": [{ "question": "...", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Correct Option string" }] }', status: 'idle', position: { x: 400, y: 200 }, config: { model: 'gemini-2.5-flash' } },
                { node_id: 'output_1', node_type: 'Output', label: 'Quiz Output', input_refs: ['@ai_1'], status: 'idle', position: { x: 700, y: 200 }, config: { outputFormat: 'quiz_json' } }
            ],
            edges: [
                { id: 'e1', source: 'input_1', target: 'ai_1', type: 'data' },
                { id: 'e2', source: 'ai_1', target: 'output_1', type: 'data' }
            ],
            created_at: new Date().toISOString()
        }
    },
    {
        id: 'research-assistant',
        name: 'Research Assistant',
        description: 'Research and summarize topics',
        icon: '🔍',
        dag: {
            id: 'template_research',
            name: 'Research Assistant',
            nodes: [
                { node_id: 'input_1', node_type: 'Input', label: 'Research Topic', input_refs: [], status: 'idle', position: { x: 100, y: 200 }, config: { inputType: 'text' } },
                { node_id: 'ai_1', node_type: 'AI', label: 'Research', input_refs: ['@input_1'], prompt_template: 'Research the following topic in depth: @input_1', status: 'idle', position: { x: 350, y: 100 }, config: { model: 'gemini-2.5-flash' } },
                { node_id: 'ai_2', node_type: 'AI', label: 'Summarize', input_refs: ['@ai_1'], prompt_template: 'Summarize the following research: @ai_1', status: 'idle', position: { x: 600, y: 200 }, config: { model: 'gemini-2.5-flash' } },
                { node_id: 'output_1', node_type: 'Output', label: 'Summary', input_refs: ['@ai_2'], status: 'idle', position: { x: 850, y: 200 }, config: { outputFormat: 'markdown' } }
            ],
            edges: [
                { id: 'e1', source: 'input_1', target: 'ai_1', type: 'data' },
                { id: 'e2', source: 'ai_1', target: 'ai_2', type: 'data' },
                { id: 'e3', source: 'ai_2', target: 'output_1', type: 'data' }
            ],
            created_at: new Date().toISOString()
        }
    },
    {
        id: 'content-creator',
        name: 'Content Creator',
        description: 'Generate and format content',
        icon: '✍️',
        dag: {
            id: 'template_content',
            name: 'Content Creator',
            nodes: [
                { node_id: 'input_1', node_type: 'Input', label: 'Content Brief', input_refs: [], status: 'idle', position: { x: 100, y: 200 }, config: { inputType: 'text' } },
                { node_id: 'ai_1', node_type: 'AI', label: 'Draft Content', input_refs: ['@input_1'], prompt_template: 'Create content based on: @input_1', status: 'idle', position: { x: 350, y: 200 }, config: { model: 'gemini-2.5-flash' } },
                { node_id: 'process_1', node_type: 'Process', label: 'Format', input_refs: ['@ai_1'], status: 'idle', position: { x: 600, y: 200 }, config: { processType: 'transform' } },
                { node_id: 'output_1', node_type: 'Output', label: 'Final Content', input_refs: ['@process_1'], status: 'idle', position: { x: 850, y: 200 }, config: { outputFormat: 'text' } }
            ],
            edges: [
                { id: 'e1', source: 'input_1', target: 'ai_1', type: 'data' },
                { id: 'e2', source: 'ai_1', target: 'process_1', type: 'data' },
                { id: 'e3', source: 'process_1', target: 'output_1', type: 'data' }
            ],
            created_at: new Date().toISOString()
        }
    }
];
