import { NextResponse } from 'next/server';
export async function POST(request) {
  const { messages, dataSummary } = await request.json();
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a helpful clinic data assistant. Be concise and format currency with $. Today is ${new Date().toLocaleDateString()}.

CLINIC DATA:
${dataSummary}

Help users understand their data, identify variances, and prepare weekly huddle summaries.`,
        messages: messages
      })
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
  }
}
