'use client';

import { useState } from 'react';

export default function Home() {
  const [currentTitle, setCurrentTitle] = useState('');
  const [skills, setSkills] = useState(['']);
  const [industry, setIndustry] = useState('');
  const [tone, setTone] = useState('realistic');
  const [generateAll, setGenerateAll] = useState(false);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const removeSkill = (index) => {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  const updateSkill = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTitle: currentTitle.trim(),
          skills: skills.filter(s => s.trim()),
          industry: industry.trim(),
          tone,
          generateAll,
        }),
      });

      // Eğer response 500 veya başka hata dönerse HTML dönebilir
      const contentType = res.headers.get('content-type');
      let data;

      try {
        data = await res.json();
      } catch (parseError) {
        // JSON parse hatası = muhtemelen HTML error page
        const text = await res.text();
        throw new Error(
          `Server hatası: ${res.status} - ${text.substring(0, 100)}`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || `Server hatası: ${res.status}`);
      }

      setResults(data.results);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Bilinmeyen hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toneLabels = {
    realistic: 'Gerçekçi',
    funny: 'Komik',
    absurd: 'Saçma',
    corporate: 'Kurumsal',
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <h1 style={styles.title}>LinkedIn Title Generator</h1>
          <p style={styles.description}>Gemini AI ile profesyonel LinkedIn başlıkları üretin</p>
        </header>

        <main style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Current Title */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Mevcut Başlık (İsteğe Bağlı)</label>
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                style={styles.input}
                placeholder="Örn: Frontend Developer"
              />
            </div>

            {/* Skills */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Beceriler</label>
              {skills.map((skill, index) => (
                <div key={index} style={styles.skillRow}>
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    style={{ ...styles.input, flex: 1 }}
                    placeholder={`Beceri ${index + 1}`}
                  />
                  {skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      style={styles.deleteBtn}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSkill}
                style={styles.addSkillBtn}
              >
                + Beceri Ekle
              </button>
            </div>

            {/* Industry */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Sektör (İsteğe Bağlı)</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={styles.input}
                placeholder="Örn: Teknoloji, Finans, Sağlık"
              />
            </div>

            {/* Tone & Generate All */}
            <div style={styles.twoColumns}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Başlık Türü</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  style={styles.input}
                >
                  <option value="realistic">Gerçekçi</option>
                  <option value="funny">Komik</option>
                  <option value="absurd">Saçma</option>
                  <option value="corporate">Kurumsal</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={{ ...styles.label, marginBottom: '0.5rem' }}>Seçenekler</label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={generateAll}
                    onChange={(e) => setGenerateAll(e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Tüm başlıkları oluştur
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Başlıklar Üretiliyor...' : 'Başlıklar Üret'}
            </button>
          </form>
        </main>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Results */}
        {Object.keys(results).length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.resultsTitle}>Üretilen Başlıklar</h2>

            {generateAll ? (
              <div style={styles.resultsGrid}>
                {['realistic', 'funny', 'absurd', 'corporate'].map((t) => (
                  <div key={t} style={styles.resultCategory}>
                    <h3 style={styles.categoryTitle}>{toneLabels[t]}</h3>
                    <ul style={styles.resultsList}>
                      {results[t]?.map((title, idx) => (
                        <li key={idx} style={styles.resultItem}>
                          <span style={styles.bullet}>•</span>
                          <span>{title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h3 style={styles.categoryTitle}>{toneLabels[tone]}</h3>
                <ul style={styles.resultsList}>
                  {results[tone]?.map((title, idx) => (
                    <li key={idx} style={styles.resultItem}>
                      <span style={styles.bullet}>•</span>
                      <span>{title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e8f1ff 0%, #e6e8ff 100%)',
    padding: '2rem 1rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
  wrapper: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 0.5rem 0',
  },
  description: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  skillRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  deleteBtn: {
    padding: '0.75rem 1rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1.2rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  addSkillBtn: {
    padding: '0.5rem 0',
    backgroundColor: 'transparent',
    color: '#2563eb',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    textAlign: 'left',
  },
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#374151',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '2rem',
  },
  errorText: {
    color: '#991b1b',
    margin: 0,
  },
  resultsTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1.5rem',
    margin: '0 0 1.5rem 0',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
  },
  resultCategory: {
    marginBottom: '1.5rem',
  },
  categoryTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.75rem',
    margin: '0 0 0.75rem 0',
  },
  resultsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  resultItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
    color: '#4b5563',
    fontSize: '0.95rem',
  },
  bullet: {
    color: '#3b82f6',
    marginRight: '0.5rem',
    fontWeight: 'bold',
  },
};