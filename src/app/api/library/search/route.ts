import { NextResponse } from 'next/server';
import googlethis from 'googlethis';
// import axios from 'axios'; // Keeping for future potential scraping if needed
// import * as cheerio from 'cheerio'; // Keeping for future potential scraping if needed

export const runtime = 'nodejs'; // googlethis requires Node.js runtime, checking if this works in Next.js app dir

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const options = {
            page: 0,
            safe: false,
            parse_ads: false,
            additional_params: {
                hl: 'en'
            }
        };

        // 1. Search for Documents (PDFs, etc.)
        const docQuery = `${query} filetype:pdf OR filetype:doc OR filetype:docx OR filetype:ppt OR filetype:pptx`;
        const docResponse = await googlethis.search(docQuery, options);

        let resources: any[] = [];

        // Helper to determine type
        const getType = (url: string) => {
            const lowerUrl = url.toLowerCase();
            if (lowerUrl.endsWith('.pdf')) return 'pdf';
            if (lowerUrl.endsWith('.ppt') || lowerUrl.endsWith('.pptx')) return 'ppt';
            if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) return 'doc';
            return 'link';
        };

        // Process Document Results
        if (docResponse.results) {
            resources = docResponse.results.map((result: any) => ({
                id: result.url,
                title: result.title,
                type: getType(result.url),
                subject: 'General',
                grade: 'All',
                author: new URL(result.url).hostname,
                date: 'Recent',
                description: result.description,
                size: 'Unknown',
                link: result.url
            }));
        }

        // 2. Fallback: Search for verifiable web pages with images
        // If we don't have enough docs, find articles/verified pages
        if (resources.length < 5) {
            let wikiResults: any[] = [];
            let bookResults: any[] = [];

            // A. Search Wikipedia
            try {
                const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
                const wikiResponse = await fetch(wikiUrl, {
                    headers: { 'User-Agent': 'Learnify-Student-Project/1.0' }
                });
                const wikiData = await wikiResponse.json();
                if (wikiData.query && wikiData.query.search) {
                    wikiResults = wikiData.query.search;
                }
            } catch (e) {
                console.log('Wikipedia search failed', e);
            }

            // B. Search Google Books
            try {
                const booksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`;
                const booksResponse = await fetch(booksUrl);
                const booksData = await booksResponse.json();
                if (booksData.items) {
                    bookResults = booksData.items;
                }
            } catch (e) {
                console.log('Google Books search failed', e);
            }

            // C. Image Search (for Wikipedia results that lack consistency)
            let topicImages: string[] = [];
            try {
                const imageResponse = await googlethis.image(query, { safe: false });
                if (imageResponse.length > 0) {
                    topicImages = imageResponse.map((img: any) => img.url);
                }
            } catch (e) {
                console.log('Image search failed', e);
            }

            // Process Wikipedia Results
            const processedWiki = wikiResults.map((result: any, index: number) => ({
                id: `https://en.wikipedia.org/?curid=${result.pageid}`,
                title: result.title,
                type: 'pdf', // Downloadable as PDF
                subject: 'Info',
                grade: 'All',
                author: 'Wikipedia',
                date: new Date(result.timestamp).toLocaleDateString(),
                description: result.snippet.replace(/<\/?[^>]+(>|$)/g, ""),
                size: 'PDF Export',
                link: `https://en.wikipedia.org/api/rest_v1/page/pdf/${encodeURIComponent(result.title)}`,
                imageUrl: topicImages[index % topicImages.length] || undefined
            }));

            // Process Google Books Results
            const processedBooks = bookResults.map((item: any) => {
                const info = item.volumeInfo;
                return {
                    id: item.id,
                    title: info.title,
                    type: 'link', // Books are usually external links/previews
                    subject: 'Book',
                    grade: 'All',
                    author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                    date: info.publishedDate || 'Unknown Date',
                    description: info.description ? (info.description.substring(0, 150) + '...') : 'No description available.',
                    size: 'View Book',
                    link: info.previewLink || info.infoLink,
                    imageUrl: info.imageLinks ? (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail) : undefined
                };
            });

            // Interleave results for better UX
            const combined = [];
            const maxLength = Math.max(processedWiki.length, processedBooks.length);
            for (let i = 0; i < maxLength; i++) {
                if (i < processedWiki.length) combined.push(processedWiki[i]);
                if (i < processedBooks.length) combined.push(processedBooks[i]);
            }

            resources = [...resources, ...combined];
        }

        // 3. Final Fallback: AI Generation
        // If we STILL have no resources, generate one using OpenRouter
        if (resources.length === 0) {
            try {
                const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Learnify"
                    },
                    body: JSON.stringify({
                        "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
                        "messages": [
                            {
                                "role": "user",
                                "content": `Create a comprehensive study note about "${query}". Include definitions, key concepts, history, and a summary. Format as clear text.`
                            }
                        ]
                    })
                });

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json();
                    const content = aiData.choices[0]?.message?.content;
                    if (content) {
                        resources.push({
                            id: 'ai-generated',
                            title: `AI Generated Note: ${query}`,
                            type: 'doc',
                            subject: 'AI Generated',
                            grade: 'All',
                            author: 'OpenRouter AI',
                            date: new Date().toLocaleDateString(),
                            description: content.substring(0, 150) + '...',
                            size: 'AI Text',
                            link: '',
                            aiContent: content
                        });
                    }
                } else {
                    const errText = await aiResponse.text();
                    console.error('OpenRouter Error:', aiResponse.status, errText);
                    throw new Error('OpenRouter API Failed');
                }
            } catch (e) {
                console.error('AI Generation exception', e);
                // Fallback to simulated AI content if API fails (for demo reliability)
                resources.push({
                    id: 'ai-generated-simulated',
                    title: `AI Generated Note: ${query}`,
                    type: 'doc',
                    subject: 'AI Generated',
                    grade: 'All',
                    author: 'AI Assistant (Offline)',
                    date: new Date().toLocaleDateString(),
                    description: `(Offline Mode) Comprehensive study note about ${query}. This content is simulated because the AI service is currently unavailable.`,
                    size: 'AI Text',
                    link: '',
                    aiContent: `# Study Note: ${query}\n\n## Introduction\nThis is a generated summary for the topic "${query}".\n\n## Key Concepts\n- Concept 1 related to ${query}\n- Concept 2 related to ${query}\n\n## Summary\nNormally this would be generated by a live AI model. Currently using offline simulation due to API limits.\n`
                });
            }
        }

        return NextResponse.json({
            resources: resources.slice(0, 15)
        });

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
