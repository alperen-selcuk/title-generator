import { NextResponse } from 'next/server';

// Rate limiter
const ipMap = new Map();
const LIMIT = 10;
const WINDOW = 60 * 60 * 1000;

function checkLimit(ip) {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now > entry.reset) {
    ipMap.set(ip, { count: 1, reset: now + WINDOW });
    return { ok: true, remaining: LIMIT - 1 };
  }

  if (entry.count >= LIMIT) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: LIMIT - entry.count };
}

// Tone prompts for Gemini
const TONE_PROMPTS = {
  realistic: `Generate 3 professional and realistic LinkedIn job titles. They should sound credible and modern, using current industry terminology. Each title max 80 characters.`,
  funny: `Generate 3 funny but somewhat plausible LinkedIn job titles. Humorous and relatable, playing on tech/work culture jokes. Each title max 80 characters.`,
  absurd: `Generate 3 completely absurd and wildly creative LinkedIn job titles. Be extremely creative. Examples: "Kubernetes Asteroid Crasher", "Digital Chaos Manager". Each title max 80 characters.`,
  corporate: `Generate 3 peak corporate buzzword LinkedIn titles using words like: Ninja, Rockstar, Evangelist, Visionary, Disruptor, Growth Hacker, Chief Officer, Guru. Each title max 80 characters.`,
};

async function callGeminiAPI(prompt, apiKey) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 200,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Parse JSON array from response
  const jsonMatch = text.match(/\[.*\]/s);
  if (!jsonMatch) {
    throw new Error('Invalid response format from Gemini');
  }

  const titles = JSON.parse(jsonMatch[0]);
  return titles;
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const limit = checkLimit(ip);

    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Saatlik limit aşıldı' },
        { status: 429 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found');
      return NextResponse.json(
        { error: 'API key eksik - Vercel ortam değişkenlerini kontrol edin' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { currentTitle, skills, industry, tone = 'realistic', generateAll } = body;

    // Validate input
    if (!currentTitle && (!skills || skills.length === 0)) {
      return NextResponse.json(
        { error: 'En az bir başlık veya beceri giriniz' },
        { status: 400 }
      );
    }

    // Build context
    const context = [
      currentTitle ? `Current title: ${currentTitle}` : '',
      skills && skills.length > 0 ? `Skills: ${skills.join(', ')}` : '',
      industry ? `Industry: ${industry}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const results = {};
    const tonesToGenerate = generateAll ? ['realistic', 'funny', 'absurd', 'corporate'] : [tone];

    // Call Gemini API for each tone
    for (const t of tonesToGenerate) {
      try {
        const fullPrompt = `${TONE_PROMPTS[t]}

${context ? `Context:\n${context}` : ''}

Rules:
- Return ONLY a JSON array with exactly 3 strings
- No explanation, no markdown, no code blocks
- Each title max 80 characters
- Be creative and specific
- Format: ["Title 1", "Title 2", "Title 3"]`;

        const titles = await callGeminiAPI(fullPrompt, apiKey);
        results[t] = Array.isArray(titles) ? titles.slice(0, 3) : [titles];
      } catch (error) {
        console.error(`Error generating ${t}:`, error);
        results[t] = [
          `Error: ${error.message}`,
        ];
      }
    }

    return NextResponse.json({
      results,
      remaining: limit.remaining,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}