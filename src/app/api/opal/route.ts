import { NextRequest, NextResponse } from 'next/server';

// Opal Bridge API Route
// Handles logic flow execution for Gemini 2.0 Flash API

interface LogicStep {
    step: number;
    ui_component: string;
    api_call?: 'generation' | 'grounding' | 'code_execution';
    prompt_payload?: string;
    context_from?: number;
    instruction?: string;
    action?: string;
}

interface OpalRequest {
    app_idea: string;
    logic_flow?: LogicStep[];
    execute_step?: number;
    context?: Record<number, string>;
}

interface OpalResponse {
    success: boolean;
    logic_flow?: LogicStep[];
    step_result?: {
        step: number;
        output: string;
        ui_component: string;
    };
    error?: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using gemini-2.5-flash stable
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGemini(
    prompt: string,
    apiCall: 'generation' | 'grounding' | 'code_execution' = 'generation',
    context?: string
): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const fullPrompt = context ? `Context: ${context}\n\n${prompt}` : prompt;

    // Build the request body based on API call type
    const requestBody: Record<string, unknown> = {
        contents: [
            {
                parts: [{ text: fullPrompt }]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
        }
    };

    // Add tools based on api_call type
    if (apiCall === 'grounding') {
        requestBody.tools = [{ google_search_retrieval: {} }];
    } else if (apiCall === 'code_execution') {
        requestBody.tools = [{ code_execution: {} }];
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extract text from response
    const candidates = data.candidates || [];
    if (candidates.length === 0) {
        throw new Error('No response from Gemini');
    }

    const parts = candidates[0]?.content?.parts || [];
    const textPart = parts.find((p: { text?: string }) => p.text);

    return textPart?.text || 'No text response';
}

async function generateDirectResponse(query: string): Promise<string> {
    const systemPrompt = `You are an AI assistant in a learning platform called Learnify. 
You help teachers with their questions and tasks.
Be helpful, friendly, and concise in your responses.

User query: "${query}"

Respond naturally to the user:`;

    return await callGemini(systemPrompt, 'generation');
}

async function generateLogicFlow(appIdea: string): Promise<LogicStep[]> {
    const systemPrompt = `You are the Backend Logic Integrator. Your job is to create a JSON Connection Map for the Gemini 2.0 Flash API.

Available Flash API Capabilities:
- generation: Standard text generation
- grounding: Google Search integration
- code_execution: For math or data logic

Based on the user's app idea, output ONLY a valid JSON object with a "logic_flow" array.

Each step must have:
- step: number
- ui_component: "Input_Box" | "Logic_Card" | "Processing_Card" | "Result_View" | "Display_Area"
- api_call: "generation" | "grounding" | "code_execution" (optional, not needed for render steps)
- prompt_payload: The prompt to send (optional)
- context_from: Step number to get context from (optional)
- instruction: Additional instruction (optional)
- action: "RENDER" | "RENDER_FINAL_TEXT" (for display steps)

Example output:
{
  "logic_flow": [
    { "step": 1, "ui_component": "Input_Box", "api_call": "grounding", "prompt_payload": "Search query here" },
    { "step": 2, "ui_component": "Logic_Card", "api_call": "generation", "context_from": 1, "instruction": "Process the results" },
    { "step": 3, "ui_component": "Result_View", "action": "RENDER" }
  ]
}

User's app idea: "${appIdea}"

Output only the JSON, no markdown, no explanation:`;

    const response = await callGemini(systemPrompt, 'generation');

    // Parse JSON from response
    try {
        // Clean up the response - remove markdown code blocks if present
        let cleanedResponse = response.trim();
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.slice(7);
        }
        if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.slice(3);
        }
        if (cleanedResponse.endsWith('```')) {
            cleanedResponse = cleanedResponse.slice(0, -3);
        }

        const parsed = JSON.parse(cleanedResponse.trim());
        return parsed.logic_flow || [];
    } catch {
        // If parsing fails, create a simple default flow
        return [
            { step: 1, ui_component: 'Input_Box', api_call: 'generation', prompt_payload: appIdea },
            { step: 2, ui_component: 'Result_View', action: 'RENDER' }
        ];
    }
}


async function executeStep(
    step: LogicStep,
    context: Record<number, string>
): Promise<string> {
    if (step.action === 'RENDER' || step.action === 'RENDER_FINAL_TEXT') {
        // For render steps, return the context from previous step
        const lastStepNum = step.step - 1;
        return context[lastStepNum] || 'No content to render';
    }

    if (!step.api_call) {
        return 'Step has no API call defined';
    }

    // Build the prompt
    let prompt = step.prompt_payload || '';
    if (step.instruction) {
        prompt = step.instruction;
    }

    // Get context from previous step if specified
    const prevContext = step.context_from ? context[step.context_from] : undefined;

    return await callGemini(prompt, step.api_call, prevContext);
}

export async function POST(request: NextRequest): Promise<NextResponse<OpalResponse>> {
    try {
        const body = await request.json();

        // Mode 0: Direct chat response (for conversational queries)
        if (body.query) {
            const response = await generateDirectResponse(body.query);
            return NextResponse.json({
                success: true,
                chat_response: response
            });
        }

        // Mode 1: Generate logic flow from app idea
        if (body.app_idea && !body.execute_step) {
            const logicFlow = await generateLogicFlow(body.app_idea);
            return NextResponse.json({
                success: true,
                logic_flow: logicFlow
            });
        }

        // Mode 2: Execute a specific step
        if (body.logic_flow && typeof body.execute_step === 'number') {
            const step = body.logic_flow.find((s: LogicStep) => s.step === body.execute_step);
            if (!step) {
                return NextResponse.json({
                    success: false,
                    error: `Step ${body.execute_step} not found in logic flow`
                });
            }

            const output = await executeStep(step, body.context || {});
            return NextResponse.json({
                success: true,
                step_result: {
                    step: step.step,
                    output,
                    ui_component: step.ui_component
                }
            });
        }

        // Mode 3: Execute entire DAG
        if (body.execute_dag && body.dag && body.user_input !== undefined) {
            const { executeDAG } = await import('@/lib/workflow/runner');
            const result = await executeDAG(body.dag, body.user_input);
            return NextResponse.json({
                success: result.success,
                execution_result: result,
                error: result.error
            });
        }

        return NextResponse.json({
            success: false,
            error: 'Invalid request. Provide app_idea to generate flow, or logic_flow with execute_step to run a step.'
        });

    } catch (error) {
        console.error('Opal API Error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}

// GET endpoint for health check
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        status: 'ok',
        message: 'Opal Bridge API is running',
        apiKeyConfigured: !!GEMINI_API_KEY
    });
}
