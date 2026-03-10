"use client";

import { useState, useRef, useCallback } from "react";

// ─── Tone config ──────────────────────────────────────────────────────────────
const TONES = [
  { id: "realistic", emoji: "🎯", label: "Gerçekçi",        color: "#6af7c8", bg: "rgba(106,247,200,0.08)", border: "rgba(106,247,200,0.3)"  },
  { id: "funny",     emoji: "😂", label: "Komik",            color: "#f7c46a", bg: "rgba(247,196,106,0.08)", border: "rgba(247,196,106,0.3)"  },
  { id: "absurd",    emoji: "🌀", label: "Absürt",           color: "#f76a8f", bg: "rgba(247,106,143,0.08)", border: "rgba(247,106,143,0.3)"  },
  { id: "corporate", emoji: "🤵", label: "Corporate Cringe", color: "#b8b0ff", bg: "rgba(124,106,247,0.08)", border: "rgba(124,106,247,0.3)"  },
];

const TONE_MAP = Object.fromEntries(TONES.map((t) => [t.id, t]));

// ─── Styles (CSS-in-JS object, keeps everything in one file) ─────────────────
const S = {
  body: {
    margin: 0,
    fontFamily: "'Syne', sans-serif",
    background: "#0a0a0f",
    color: "#e8e8f0",
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
  },
  bgGlow: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(ellipse 60% 50% at 20% 20%, rgba(124,106,247,0.12) 0%, transparent 60%)," +
      "radial-gradient(ellipse 40% 60% at 80% 80%, rgba(247,106,143,0.08) 0%, transparent 60%)," +
      "radial-gradient(ellipse 50% 40% at 60% 10%, rgba(106,247,200,0.06) 0%, transparent 50%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "60px 24px 80px",
    position: "relative",
    zIndex: 1,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function Badge({ children }) {
  return (
    <span style={{
      display: "inline-block",
      background: "rgba(124,106,247,0.15)",
      border: "1px solid rgba(124,106,247,0.3)",
      color: "#7c6af7",
      fontFamily: "'DM Mono', monospace",
      fontSize: 11,
      letterSpacing: "0.12em",
      padding: "5px 14px",
      borderRadius: 100,
      marginBottom: 20,
      textTransform: "uppercase",
    }}>{children}</span>
  );
}

function Label({ children }) {
  return (
    <label style={{
      display: "block",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "#6b6b85",
      marginBottom: 10,
    }}>{children}</label>
  );
}

function Input({ style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        background: "#1a1a25",
        border: `1px solid ${focused ? "#7c6af7" : "#2a2a3a"}`,
        boxShadow: focused ? "0 0 0 3px rgba(124,106,247,0.15)" : "none",
        borderRadius: 12,
        padding: "14px 16px",
        color: "#e8e8f0",
        fontFamily: "'Syne', sans-serif",
        fontSize: 15,
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}

function TagsInput({ tags, onChange }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const addTag = (text) => {
    const trimmed = text.trim().replace(/,$/, "");
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
  };

  const removeTag = (i) => onChange(tags.filter((_, idx) => idx !== i));

  const handleKey = (e) => {
    if ((e.key === "Enter" || e.key === ",") && e.target.value.trim()) {
      e.preventDefault();
      addTag(e.target.value);
      e.target.value = "";
    } else if (e.key === "Backspace" && !e.target.value && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        background: "#1a1a25",
        border: `1px solid ${focused ? "#7c6af7" : "#2a2a3a"}`,
        boxShadow: focused ? "0 0 0 3px rgba(124,106,247,0.15)" : "none",
        borderRadius: 12,
        padding: 10,
        cursor: "text",
        minHeight: 52,
        alignItems: "center",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {tags.map((tag, i) => (
        <span key={i} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(124,106,247,0.2)",
          border: "1px solid rgba(124,106,247,0.35)",
          color: "#b8b0ff", fontSize: 13,
          padding: "4px 10px", borderRadius: 8,
          fontFamily: "'DM Mono', monospace",
        }}>
          {tag}
          <span
            onClick={(e) => { e.stopPropagation(); removeTag(i); }}
            style={{ cursor: "pointer", opacity: 0.6, fontSize: 16, lineHeight: 1 }}
          >×</span>
        </span>
      ))}
      <input
        ref={inputRef}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKey}
        placeholder={tags.length === 0 ? "Kubernetes, React, Figma... (Enter ile ekle)" : ""}
        style={{
          border: "none", background: "transparent", outline: "none",
          color: "#e8e8f0", fontFamily: "'Syne', sans-serif",
          fontSize: 15, flex: 1, minWidth: 120, padding: "4px 6px",
        }}
      />
    </div>
  );
}

function TitleCard({ title, delay = 0 }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(title).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      background: "#111118",
      border: "1px solid #2a2a3a",
      borderRadius: 16,
      padding: "18px 22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      animation: `slideIn 0.3s ease ${delay}s forwards`,
      opacity: 0,
    }}>
      <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, flex: 1 }}>
        {title}
      </span>
      <button onClick={copy} style={{
        background: copied ? "rgba(106,247,200,0.08)" : "#1a1a25",
        border: `1px solid ${copied ? "rgba(106,247,200,0.3)" : "#2a2a3a"}`,
        color: copied ? "#6af7c8" : "#6b6b85",
        fontFamily: "'DM Mono', monospace",
        fontSize: 11, padding: "7px 14px",
        borderRadius: 8, cursor: "pointer",
        transition: "all 0.15s", whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        {copied ? "✓ kopyalandı" : "kopyala"}
      </button>
    </div>
  );
}

function ToneSection({ tone, titles }) {
  const t = TONE_MAP[tone];
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          textTransform: "uppercase", letterSpacing: "0.1em",
          padding: "4px 12px", borderRadius: 100,
          background: t.bg, border: `1px solid ${t.border}`, color: t.color,
        }}>
          {t.emoji} {t.label}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {titles.map((title, i) => (
          <TitleCard key={i} title={title} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [currentTitle, setCurrentTitle] = useState("");
  const [skills, setSkills] = useState([]);
  const [industry, setIndustry] = useState("");
  const [selectedTone, setSelectedTone] = useState("realistic");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // { [tone]: string[] }
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(null);

  const callAPI = useCallback(async (generateAll = false) => {
    if (!currentTitle.trim() && skills.length === 0) {
      setError("En az mevcut title'ını veya bir skill gir 🙏");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentTitle,
          skills,
          industry,
          tone: selectedTone,
          generateAll,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
        return;
      }

      setResults(data.results);
      if (data.remaining !== undefined) setRemaining(data.remaining);
    } catch (err) {
      setError("Bağlantı hatası: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentTitle, skills, industry, selectedTone]);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0f; }
        input::placeholder { color: #6b6b85; }
        @keyframes slideIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={S.body}>
        <div style={S.bgGlow} />
        <div style={S.container}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Badge>✦ Ücretsiz · Saçma · Ama İşe Yarıyor</Badge>
            <h1 style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 800, lineHeight: 1.05,
              marginBottom: 16, letterSpacing: "-0.02em",
            }}>
              LinkedIn<br />
              <span style={{
                background: "linear-gradient(135deg, #7c6af7 0%, #f76a8f 50%, #6af7c8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Title Generator
              </span>
            </h1>
            <p style={{ color: "#6b6b85", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
              Çünkü "Senior Software Engineer" artık kimseyi heyecanlandırmıyor.
            </p>
          </div>

          {/* Form Card */}
          <div style={{
            background: "#111118", border: "1px solid #2a2a3a",
            borderRadius: 20, padding: 36, marginBottom: 24,
          }}>
            {/* Current Title */}
            <div style={{ marginBottom: 24 }}>
              <Label>Şu anki title'ın 💼</Label>
              <Input
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="ör: Software Engineer, DevOps Engineer, Product Manager..."
              />
            </div>

            {/* Skills */}
            <div style={{ marginBottom: 24 }}>
              <Label>Tool'lar & Skill'ler ⚡ <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(Enter ile ekle)</span></Label>
              <TagsInput tags={skills} onChange={setSkills} />
            </div>

            {/* Industry */}
            <div style={{ marginBottom: 24 }}>
              <Label>Sektör / Alan 🏢 <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opsiyonel)</span></Label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="ör: Fintech, E-ticaret, Sağlık, Oyun..."
              />
            </div>

            {/* Tone Selector */}
            <div style={{ marginBottom: 8 }}>
              <Label>Ton seç 🎨</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTone(t.id)}
                    style={{
                      background: selectedTone === t.id ? t.bg : "#1a1a25",
                      border: `1px solid ${selectedTone === t.id ? t.border : "#2a2a3a"}`,
                      color: selectedTone === t.id ? t.color : "#6b6b85",
                      borderRadius: 12, padding: "14px 10px",
                      cursor: "pointer", textAlign: "center",
                      transition: "all 0.2s",
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 13, fontWeight: 700,
                    }}
                  >
                    <span style={{ fontSize: 22, display: "block", marginBottom: 6 }}>{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => callAPI(false)}
              disabled={loading}
              style={{
                width: "100%", marginTop: 20, padding: 18,
                background: loading ? "#2a2a3a" : "linear-gradient(135deg, #7c6af7, #9b6af7)",
                border: "none", borderRadius: 14,
                color: "#fff", fontFamily: "'Syne', sans-serif",
                fontSize: 16, fontWeight: 800, letterSpacing: "0.02em",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Üretiliyor..." : "✦ Title Üret"}
            </button>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 14, background: "rgba(247,106,143,0.1)",
                border: "1px solid rgba(247,106,143,0.3)",
                color: "#f76a8f", borderRadius: 12,
                padding: "14px 18px", fontSize: 14,
              }}>
                {error}
              </div>
            )}

            {/* Rate limit info */}
            {remaining !== null && (
              <p style={{
                marginTop: 10, textAlign: "center",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11, color: "#6b6b85",
              }}>
                Bu saatte {remaining} isteğin kaldı.
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: 48, color: "#6b6b85" }}>
              <div style={{
                width: 40, height: 40,
                border: "3px solid #2a2a3a",
                borderTopColor: "#7c6af7",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }} />
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, letterSpacing: "0.05em" }}>
                En iyi title'lar üretiliyor...
              </div>
            </div>
          )}

          {/* Results */}
          {results && !loading && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>Üretilen Title'lar</h2>
              </div>

              {Object.entries(results).map(([tone, titles]) => (
                <ToneSection key={tone} tone={tone} titles={titles} />
              ))}

              {/* All tones button */}
              {Object.keys(results).length === 1 && (
                <button
                  onClick={() => callAPI(true)}
                  style={{
                    display: "block", width: "100%",
                    padding: 14, background: "transparent",
                    border: "1px dashed #2a2a3a", borderRadius: 14,
                    color: "#6b6b85", fontFamily: "'Syne', sans-serif",
                    fontSize: 14, fontWeight: 700,
                    cursor: "pointer", marginTop: 4,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#7c6af7";
                    e.target.style.color = "#7c6af7";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "#2a2a3a";
                    e.target.style.color = "#6b6b85";
                  }}
                >
                  🎲 Tüm tonlarda üret (4'ü birden)
                </button>
              )}
            </div>
          )}

          <footer style={{
            textAlign: "center", marginTop: 60,
            color: "#6b6b85", fontFamily: "'DM Mono', monospace", fontSize: 12,
          }}>
            made with ✦ gemini · your cringe, weaponized
          </footer>
        </div>
      </div>
    </>
  );
}
