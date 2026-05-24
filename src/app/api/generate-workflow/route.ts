import { NextRequest, NextResponse } from 'next/server';
import type { WorkflowDAG, WorkflowNode, WorkflowEdge } from '@/types/workflow';

// Generate Workflow API Route
// Translates natural language into a JSON DAG using Gemini 2.5 Flash

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GenerateWorkflowRequest {
    prompt: string;
}

interface GenerateWorkflowResponse {
    success: boolean;
    dag?: WorkflowDAG;
    error?: string;
}

async function callGeminiArchitect(userPrompt: string): Promise<WorkflowDAG> {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const architectPrompt = `You are the Opal-Lite Architect Agent. Your job is to translate natural language ideas into a JSON Directed Acyclic Graph (DAG) workflow.

Available node types with their purposes:
- Input: Captures user input (MUST be the first node, one per workflow)
- Process: Transforms, filters, or manipulates data (use for formatting, parsing, combining)
- AI: Uses AI/LLM to generate content with a prompt_template
- Output: Displays the final result (MUST be the last node, one per workflow)

STRICT RULES:
1. Generate 3-6 interconnected nodes (minimum 3, maximum 6)
2. MUST start with exactly ONE "Input" node
3. MUST end with exactly ONE "Output" node  
4. Use at least 1-2 "AI" nodes for intelligent processing
5. Use "Process" nodes for data transformation between AI calls
6. Each node MUST have a unique node_id, label, position, and config
7. Use @node_id references in prompt_template (e.g., @input_1, @ai_1)
8. Edges connect nodes - ensure proper data flow from Input to Output
9. Position nodes with x increasing left-to-right (spacing ~300px)

Node config requirements:
- Input: { "inputType": "text" | "file" | "json" }
- Process: { "processType": "transform" | "filter" | "merge" | "split" }
- AI: { "model": "gemini-2.5-flash", "temperature": 0.7 }
- Output: { "outputFormat": "markdown" | "quiz_json" | "flashcard_json" }

IMPORTANT:
- If user asks for a QUIZ: 
  - Set Output node config to { "outputFormat": "quiz_json" }
  - The preceding AI node prompt MUST generate purely valid JSON with this structure: { "questions": [{ "question": "...", "options": ["A", "B", "C", "D"], "answer": "matched option string" }] }
- If user asks for FLASHCARDS:
  - Set Output node config to { "outputFormat": "flashcard_json" }
  - The preceding AI node prompt MUST generate purely valid JSON: { "cards": [{ "front": "Term", "back": "Definition" }] }
- Otherwise, default to Markdown.

Example JSON structure:
{
  "id": "workflow_${Date.now()}",
  "name": "Quiz Generator",
  "description": "Creates quizzes on any topic",
  "nodes": [
    {"node_id": "input_1", "node_type": "Input", "label": "Topic Input", "input_refs": [], "position": {"x": 100, "y": 200}, "config": {"inputType": "text"}},
    {"node_id": "ai_1", "node_type": "AI", "label": "Research Topic", "input_refs": ["@input_1"], "prompt_template": "Research key facts about: @input_1", "position": {"x": 400, "y": 150}, "config": {"model": "gemini-2.5-flash", "temperature": 0.7}},
    {"node_id": "ai_2", "node_type": "AI", "label": "Generate Questions", "input_refs": ["@ai_1"], "prompt_template": "Based on this research: @ai_1\\n\\nCreate 5 multiple-choice quiz questions.", "position": {"x": 700, "y": 200}, "config": {"model": "gemini-2.5-flash", "temperature": 0.5}},
    {"node_id": "process_1", "node_type": "Process", "label": "Format Quiz", "input_refs": ["@ai_2"], "position": {"x": 1000, "y": 200}, "config": {"processType": "transform"}},
    {"node_id": "output_1", "node_type": "Output", "label": "Display Quiz", "input_refs": ["@process_1"], "position": {"x": 1300, "y": 200}, "config": {"outputFormat": "ui"}}
  ],
  "edges": [
    {"id": "e1", "source": "input_1", "target": "ai_1", "type": "data"},
    {"id": "e2", "source": "ai_1", "target": "ai_2", "type": "data"},
    {"id": "e3", "source": "ai_2", "target": "process_1", "type": "data"},
    {"id": "e4", "source": "process_1", "target": "output_1", "type": "data"}
  ]
}

User's idea: "${userPrompt}"

Output ONLY valid JSON. No markdown, no explanation:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: architectPrompt }] }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 3000,
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
    let jsonText = textPart?.text || '';

    // Clean up response
    jsonText = jsonText.trim();
    if (jsonText.startsWith('```json')) jsonText = jsonText.slice(7);
    if (jsonText.startsWith('```')) jsonText = jsonText.slice(3);
    if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3);
    jsonText = jsonText.trim();

    try {
        const dag = JSON.parse(jsonText);

        // Validate and fill defaults
        if (!dag.id) dag.id = `workflow_${Date.now()}`;
        if (!dag.name) dag.name = 'Generated Workflow';
        if (!dag.nodes || !Array.isArray(dag.nodes)) throw new Error('Invalid nodes array');
        if (!dag.edges || !Array.isArray(dag.edges)) dag.edges = [];

        dag.created_at = new Date().toISOString();

        // Ensure all nodes have required fields
        dag.nodes = dag.nodes.map((node: WorkflowNode, i: number) => ({
            ...node,
            node_id: node.node_id || `node_${i + 1}`,
            status: 'idle',
            position: node.position || { x: 100 + i * 300, y: 200 },
            config: node.config || {},
            input_refs: node.input_refs || []
        }));

        // Ensure all edges have type
        dag.edges = dag.edges.map((edge: WorkflowEdge, i: number) => ({
            ...edge,
            id: edge.id || `e${i + 1}`,
            type: edge.type || 'data'
        }));

        // Auto-generate edges if missing
        if (dag.edges.length === 0 && dag.nodes.length > 1) {
            dag.edges = dag.nodes.slice(0, -1).map((node: WorkflowNode, i: number) => ({
                id: `e${i + 1}`,
                source: node.node_id,
                target: dag.nodes[i + 1].node_id,
                type: 'data'
            }));
        }

        return dag as WorkflowDAG;
    } catch (parseError) {
        console.error('Failed to parse DAG JSON:', jsonText);
        throw new Error('Failed to parse workflow DAG');
    }
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateWorkflowResponse>> {
    try {
        const body: GenerateWorkflowRequest = await request.json();

        if (!body.prompt || typeof body.prompt !== 'string') {
            return NextResponse.json({
                success: false,
                error: 'Missing or invalid "prompt" field'
            }, { status: 400 });
        }

        const dag = await callGeminiArchitect(body.prompt);

        return NextResponse.json({
            success: true,
            dag
        });

    } catch (error) {
        console.error('Generate Workflow Error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
}

export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        status: 'ok',
        endpoint: '/api/generate-workflow',
        method: 'POST',
        body: { prompt: 'string' }
    });
}
