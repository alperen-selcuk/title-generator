// app/api/generate/route.js
// Bu dosya SADECE sunucuda çalışır. API key hiçbir zaman browser'a gitmez.

import { NextResponse } from "next/server";

// ─── In-Memory Rate Limiter ───────────────────────────────────────────────────
const ipRequestMap = new Map();

const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = ipRequestMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

// ─── Tone Prompts ─────────────────────────────────────────────────────────────
const TONE_PROMPTS = {
  realistic: `Generate 3 professional, impressive, and realistic LinkedIn job titles. 
They should sound credible and modern, using current industry terminology. 
Slightly more elevated and specific than generic titles. No buzzword overload.`,

  funny: `Generate 3 funny but somewhat plausible LinkedIn job titles. 
Humorous and relatable, playing on tech/work culture jokes and absurdities. 
Still something a real person might semi-seriously put on their profile.`,

  absurd: `Generate 3 completely absurd, wildly creative LinkedIn titles. 
Examples of the vibe: "Kubernetes Asteroid Crasher", "DevOps Supreme", "Interdimensional Bug Whisperer", "Excel Warlord".
Be extremely creative. These should be memorable and hilariously share-worthy.`,

  corporate: `Generate 3 peak corporate buzzword LinkedIn titles. 
Maximum synergy. Maximum thought leadership. Maximum cringe.
Use words like: Ninja, Rockstar, Evangelist, Visionary, Disruptor, Growth Hacker, Chief Officer, Guru, Wizard.`,
};

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    // 1. IP al
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // 2. Rate limit kontrol
    const rl = checkRateLimit(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Saatlik limit doldu. ${Math.ceil(rl.retryAfterSec / 60)} dakika sonra tekrar dene.` },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSec) },
        }
      );
    }

    // 3. Request body parse
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Geçersiz istek formatı." },
        { status: 400 }
      );
    }

    const { currentTitle, skills, industry, tone, generateAll } = body;

    // 4. Input validasyonu
    if (!currentTitle && (!skills || skills.length === 0)) {
      return NextResponse.json(
        { error: "En az mevcut title veya bir skill girilmeli." },
        { status: 400 }
      );
    }

    const validTones = ["realistic", "funny", "absurd", "corporate"];
    const tonesToGenerate = generateAll
      ? validTones
      : [validTones.includes(tone) ? tone : "realistic"];

    // 5. API Key kontrol
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return NextResponse.json(
        { 
          error: "Sunucu hatası: API key eksik. Vercel ortam değişkenlerini kontrol edin." 
        },
        { status: 500 }
      );
    }

    const userContext = [
      currentTitle && `Current title: ${currentTitle}`,
      skills?.length > 0 && `Skills & Tools: ${skills.join(", ")}`,
      industry && `Industry/Field: ${industry}`,
    ]
      .filter(Boolean)
      .join("\n");

    const results = {};

    for (const t of tonesToGenerate) {
      const prompt = `${TONE_PROMPTS[t]}

User context:
${userContext}

Rules:
- Return ONLY a valid JSON array with exactly 3 strings. No explanation, no markdown, no backticks.
- Each title max 80 characters.
- Be creative and specific to the user's actual skills/tools.
- Example format: ["Title One", "Title Two", "Title Three"]`;

      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 1.1,
                maxOutputTokens: 300,
              },
            }),
          }
        );

        if (!geminiRes.ok) {
          const errData = await geminiRes.text();
          console.error(`Gemini API error (${t}):`, errData);
          throw new Error(`Gemini API hatası: ${geminiRes.status}`);
        }

        const geminiData = await geminiRes.json();
        const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const clean = raw.replace(/```json|```/g, "").trim();
        const titles = JSON.parse(clean);

        if (!Array.isArray(titles)) {
          throw new Error("API yanıtı dizisi değil");
        }

        results[t] = titles;
      } catch (err) {
        console.error(`Error generating ${t}:`, err.message);
        throw err;
      }
    }

    return NextResponse.json(
      { results, remaining: rl.remaining },
      { status: 200 }
    );
  } catch (err) {
    console.error("Route handler error:", err);
    return NextResponse.json(
      { error: "Başlıklar üretilirken hata oluştu: " + (err.message || "Bilinmeyen hata") },
      { status: 500 }
    );
  }
}