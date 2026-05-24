'use client';

import { useState, useEffect, useCallback } from 'react';
import * as webllm from '@mlc-ai/web-llm';

interface UseWebLLMReturn {
    engine: webllm.MLCEngine | null;
    isLoading: boolean;
    isReady: boolean;
    progress: string;
    error: string | null;
    initializeModel: () => Promise<void>;
    chat: (message: string, onChunk?: (text: string) => void) => Promise<string>;
}

// Using Gemma 2B quantized model compatible with WebLLM
const MODEL_ID = 'gemma-2b-it-q4f32_1-MLC';

export function useWebLLM(): UseWebLLMReturn {
    const [engine, setEngine] = useState<webllm.MLCEngine | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState<string | null>(null);

    const initializeModel = useCallback(async () => {
        if (engine || isLoading) return;

        setIsLoading(true);
        setError(null);
        setProgress('Initializing engine...');

        try {
            // Create engine with progress callback
            const newEngine = await webllm.CreateMLCEngine(MODEL_ID, {
                initProgressCallback: (report) => {
                    setProgress(report.text);
                },
            });

            setEngine(newEngine);
            setIsReady(true);
            setProgress('Model loaded successfully!');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load model';
            setError(errorMessage);
            setProgress('');
            console.error('WebLLM initialization error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [engine, isLoading]);

    const chat = useCallback(
        async (message: string, onChunk?: (text: string) => void): Promise<string> => {
            if (!engine || !isReady) {
                throw new Error('Model not ready. Please load the model first.');
            }

            try {
                const messages: webllm.ChatCompletionMessageParam[] = [
                    {
                        role: 'system',
                        content: 'You are a helpful AI tutor. Answer questions clearly and concisely. Help students learn by explaining concepts step by step.',
                    },
                    {
                        role: 'user',
                        content: message,
                    },
                ];

                // Stream response if onChunk is provided
                if (onChunk) {
                    let fullResponse = '';
                    const asyncChunkGenerator = await engine.chat.completions.create({
                        messages,
                        temperature: 0.7,
                        max_tokens: 512,
                        stream: true,
                    });

                    for await (const chunk of asyncChunkGenerator) {
                        const delta = chunk.choices[0]?.delta?.content || '';
                        fullResponse += delta;
                        onChunk(fullResponse);
                    }

                    return fullResponse;
                } else {
                    // Non-streaming response
                    const completion = await engine.chat.completions.create({
                        messages,
                        temperature: 0.7,
                        max_tokens: 512,
                    });

                    return completion.choices[0]?.message?.content || 'No response';
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Chat failed';
                throw new Error(errorMessage);
            }
        },
        [engine, isReady]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (engine) {
                // Note: MLCEngine doesn't have a built-in cleanup method in current versions
                // but we should set it to null to allow garbage collection
                setEngine(null);
            }
        };
    }, [engine]);

    return {
        engine,
        isLoading,
        isReady,
        progress,
        error,
        initializeModel,
        chat,
    };
}
