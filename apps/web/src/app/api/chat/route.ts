// apps/web/src/app/api/chat/route.ts
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Configure OpenRouter as an OpenAI-compatible provider
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': process.env.NEXTAUTH_URL || 'https://bba-services.app',
    'X-Title': 'BBA Client Platform',
  },
});

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if AI is enabled
    if (process.env.NEXT_PUBLIC_AI_ENABLED !== 'true') {
      return NextResponse.json({ error: 'AI chat is not enabled' }, { status: 503 });
    }

    const { messages } = await req.json();

    // Create streaming response with Vercel AI SDK
    const result = streamText({
      model: openrouter('minimax/minimax-m2.5'),
      system: `You are a professional tax and financial advisor assistant for BBA Services. 
      
You help clients with:
- Tax strategy and planning
- Business formation and structure
- Financial analysis and reporting
- Document compliance and requirements
- General business advisory

Provide accurate, professional guidance while noting when clients should consult directly with their BBA advisor for specific situations.`,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[CHAT_API]', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
