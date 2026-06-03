import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        score: { type: SchemaType.NUMBER, description: 'Overall score 0-100' },
        label: { type: SchemaType.STRING, description: 'Score band label with emoji' },
        breakdown: {
          type: SchemaType.OBJECT,
          properties: {
            focus_quality: { type: SchemaType.NUMBER },
            consistency: { type: SchemaType.NUMBER },
            effort: { type: SchemaType.NUMBER },
          },
          required: ['focus_quality', 'consistency', 'effort'],
        },
        strengths: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: '2-3 specific things they did well',
        },
        improvements: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: '2-3 specific actionable things to improve tomorrow',
        },
        motivation: {
          type: SchemaType.STRING,
          description: 'One punchy sentence to motivate them for tomorrow',
        },
      },
      required: ['score', 'label', 'breakdown', 'strengths', 'improvements', 'motivation'],
    },
  },
  systemInstruction: `You are a no-nonsense productivity coach for a high school student. Score their daily study performance honestly and help them improve. Be direct, specific, and motivating — not generic or preachy. Talk like a mentor who respects them.

Score 0-100 across three dimensions:
- effort: raw study time and subject coverage
- focus_quality: how focused they were based on their description
- consistency: did they follow through and finish their work

Overall score should reflect the weighted feel of all three.

Score bands:
- 90-100: "Locked In 🔒"
- 75-89: "Dialed In 📈"
- 60-74: "Getting There ⚡"
- 40-59: "Unfocused 😶"
- 0-39: "Off Day 💤"

Be honest — if they barely studied, give them a low score. Don't sugarcoat it. Strengths and improvements should be specific, not generic.`,
});

export async function POST(req: NextRequest) {
  try {
    const { subjects, description, homeworkDone } = await req.json();

    const subjectList = (subjects as { name: string; hours: number }[])
      .filter(s => s.name && s.hours > 0)
      .map(s => `- ${s.name}: ${s.hours} hour${s.hours !== 1 ? 's' : ''}`)
      .join('\n');

    const prompt = `Here's my day:

Study sessions:
${subjectList || '- Nothing studied'}

How I'd describe my day: ${description || 'Not provided.'}

Finished all homework: ${homeworkDone ? 'Yes' : 'No'}

Score my day honestly.`;

    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());

    return NextResponse.json(data);
  } catch (err) {
    console.error('[score API]', err);
    return NextResponse.json({ error: 'Failed to score your day' }, { status: 500 });
  }
}
