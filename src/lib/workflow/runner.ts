// Opal-Lite Workflow Runner
// Executes DAG nodes sequentially with step reference resolution

import type { WorkflowDAG, WorkflowNode, ExecutionResult, LogEntry } from '@/types/workflow';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Resolve @Step references in prompt template
export function resolveStepReferences(
    template: string,
    nodeOutputs: Record<string, string>,
    nodes: WorkflowNode[]
): string {
    let resolved = template;

    // Replace @Step1, @Step2, etc.
    const stepPattern = /@Step(\d+)/gi;
    resolved = resolved.replace(stepPattern, (match, stepNum) => {
        const index = parseInt(stepNum, 10) - 1;
        if (index >= 0 && index < nodes.length) {
            const nodeId = nodes[index].node_id;
            return nodeOutputs[nodeId] || match;
        }
        return match;
    });

    // Replace @node_id references
    for (const [nodeId, output] of Object.entries(nodeOutputs)) {
        resolved = resolved.replace(new RegExp(`@${nodeId}`, 'gi'), output);
    }

    return resolved;
}

// Call Gemini for AI generation
async function callGemini(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const candidates = data.candidates || [];

    if (candidates.length === 0) {
        throw new Error('No response from Gemini');
    }

    const textPart = candidates[0]?.content?.parts?.find((p: { text?: string }) => p.text);
    return textPart?.text || 'No response generated';
}

// Execute a single node
export async function executeNode(
    node: WorkflowNode,
    nodeOutputs: Record<string, string>,
    allNodes: WorkflowNode[],
    userInput: string
): Promise<string> {
    switch (node.node_type) {
        case 'Input':
            // Input node passes through the initial user input
            return userInput;

        case 'Process':
            // Process node transforms/passes data from parent
            // For now, just pass through - can be extended for real transformations
            if (node.input_refs.length > 0) {
                const ref = node.input_refs[0];
                const cleanRef = ref.startsWith('@') ? ref.slice(1) : ref;
                return nodeOutputs[cleanRef] || userInput;
            }
            return userInput;

        case 'AI':
            // AI node uses Gemini to generate content
            const prompt = node.prompt_template
                ? resolveStepReferences(node.prompt_template, nodeOutputs, allNodes)
                : userInput;

            // Include user instruction if present
            const fullPrompt = node.user_instruction
                ? `${prompt}\n\nAdditional instructions: ${node.user_instruction}`
                : prompt;

            return await callGemini(fullPrompt);

        case 'Output':
            // Output node returns the last referenced input
            if (node.input_refs.length > 0) {
                const ref = node.input_refs[node.input_refs.length - 1];
                const cleanRef = ref.startsWith('@') ? ref.slice(1) : ref;
                return nodeOutputs[cleanRef] || 'No output available';
            }
            // Default: return the last non-output node's result
            const lastNodeId = allNodes.filter(n => n.node_type !== 'Output').pop()?.node_id;
            return lastNodeId ? nodeOutputs[lastNodeId] || 'No output available' : 'No output';

        default:
            return `Unknown node type: ${node.node_type}`;
    }
}

// Topological sort for DAG execution order
function getExecutionOrder(dag: WorkflowDAG): WorkflowNode[] {
    const nodeMap = new Map(dag.nodes.map(n => [n.node_id, n]));
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    // Initialize
    for (const node of dag.nodes) {
        inDegree.set(node.node_id, 0);
        adjList.set(node.node_id, []);
    }

    // Build adjacency list and in-degree counts
    for (const edge of dag.edges) {
        adjList.get(edge.source)?.push(edge.target);
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    // Kahn's algorithm
    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
        if (degree === 0) queue.push(nodeId);
    }

    const order: WorkflowNode[] = [];
    while (queue.length > 0) {
        const nodeId = queue.shift()!;
        const node = nodeMap.get(nodeId);
        if (node) order.push(node);

        for (const neighbor of adjList.get(nodeId) || []) {
            const newDegree = (inDegree.get(neighbor) || 1) - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) queue.push(neighbor);
        }
    }

    return order;
}

// Main DAG execution function
export async function executeDAG(
    dag: WorkflowDAG,
    userInput: string,
    onLog?: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void,
    onNodeStart?: (nodeId: string) => void,
    onNodeComplete?: (nodeId: string, output: string) => void
): Promise<ExecutionResult> {
    const nodeOutputs: Record<string, string> = {};
    const logs: LogEntry[] = [];

    const log = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
        const fullLog: LogEntry = {
            ...entry,
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString()
        };
        logs.push(fullLog);
        onLog?.(entry);
    };

    try {
        log({ level: 'info', message: `Starting execution of "${dag.name}"` });

        const executionOrder = getExecutionOrder(dag);
        log({ level: 'info', message: `Execution order: ${executionOrder.map(n => n.label || n.node_id).join(' → ')}` });

        for (const node of executionOrder) {
            const stepNum = executionOrder.indexOf(node) + 1;

            log({
                level: 'step',
                message: `Step ${stepNum}: Executing ${node.node_type} "${node.label || node.node_id}"`,
                nodeId: node.node_id
            });

            onNodeStart?.(node.node_id);

            const output = await executeNode(node, nodeOutputs, dag.nodes, userInput);
            nodeOutputs[node.node_id] = output;

            log({
                level: 'success',
                message: `Step ${stepNum} completed`,
                nodeId: node.node_id,
                data: output.length > 100 ? output.slice(0, 100) + '...' : output
            });

            onNodeComplete?.(node.node_id, output);
        }

        // Get final output from Output node
        const outputNode = dag.nodes.find(n => n.node_type === 'Output');
        const finalOutput = outputNode ? nodeOutputs[outputNode.node_id] : Object.values(nodeOutputs).pop();

        log({ level: 'success', message: 'Workflow execution completed!' });

        return {
            success: true,
            finalOutput,
            nodeOutputs,
            logs
        };

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        log({ level: 'error', message: `Execution failed: ${errorMsg}` });

        return {
            success: false,
            nodeOutputs,
            logs,
            error: errorMsg
        };
    }
}
