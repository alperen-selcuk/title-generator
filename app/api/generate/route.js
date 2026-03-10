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

// Mock titles - production'da Gemini API'den gelecek
const mockTitles = {
  realistic: [
    'Senior Frontend Engineer',
    'Full Stack Developer',
    'React Specialist',
  ],
  funny: [
    'Coffee → Code Converter',
    'Bug Collector (Accidental)',
    'Ctrl+Z Enthusiast',
  ],
  absurd: [
    'Keyboard Wizard Supreme',
    'Digital Chaos Manager',
    'Algorithm Whisperer',
  ],
  corporate: [
    'Chief Innovation Ninja',
    'Digital Transformation Rockstar',
    'Synergy Growth Hacker',
  ],
};

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

    const body = await req.json();
    const { tone = 'realistic', generateAll } = body;

    if (generateAll) {
      return NextResponse.json({
        results: {
          realistic: mockTitles.realistic,
          funny: mockTitles.funny,
          absurd: mockTitles.absurd,
          corporate: mockTitles.corporate,
        },
      });
    }

    return NextResponse.json({
      results: {
        [tone]: mockTitles[tone] || mockTitles.realistic,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}