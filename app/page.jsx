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

  const addSkill = () => setSkills([...skills, '']);
  
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
      const response = await fetch('/api/generate', {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <h1 style={styles.title}>LinkedIn Title Generator</h1>
          <p style={styles.subtitle}>Gemini AI ile profesyonel LinkedIn başlıkları üretin</p>
        </header>

        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mevcut Başlık</label>
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="Örn: Frontend Developer"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Beceriler</label>
              {skills.map((skill, index) => (
                <div key={index} style={styles.skillRow}>
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    placeholder={`Beceri ${index + 1}`}
                    style={{ ...styles.input, flex: 1 }}
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
                style={styles.addBtn}
              >
                + Beceri Ekle
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Sektör</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Örn: Teknoloji"
                style={styles.input}
              />
            </div>

            <div style={styles.row}>
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
                  Tüm türleri oluştur
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Üretiliyor...' : 'Başlıklar Üret'}
            </button>
          </form>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.resultsTitle}>Sonuçlar</h2>
            {generateAll ? (
              <div style={styles.resultsGrid}>
                {Object.entries(results).map(([type, titles]) => (
                  <div key={type}>
                    <h3 style={styles.categoryTitle}>
                      {type === 'realistic' && 'Gerçekçi'}
                      {type === 'funny' && 'Komik'}
                      {type === 'absurd' && 'Saçma'}
                      {type === 'corporate' && 'Kurumsal'}
                    </h3>
                    <ul style={styles.titleList}>
                      {Array.isArray(titles) && titles.map((title, idx) => (
                        <li key={idx} style={styles.titleItem}>• {title}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <ul style={styles.titleList}>
                  {Array.isArray(results[tone]) && results[tone].map((title, idx) => (
                    <li key={idx} style={styles.titleItem}>• {title}</li>
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
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem 1rem',
  },
  wrapper: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: 'white',
  },
  title: {
    fontSize: '2.5rem',
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1rem',
    margin: 0,
    opacity: 0.9,
  },
  card: {
    background: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#333',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  skillRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  deleteBtn: {
    padding: '0.75rem 1rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  addBtn: {
    marginTop: '0.5rem',
    padding: 0,
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    textAlign: 'left',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  submitBtn: {
    padding: '0.75rem 1.5rem',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  errorBox: {
    background: '#fee2e2',
    border: '2px solid #fca5a5',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '2rem',
  },
  errorText: {
    color: '#991b1b',
    margin: 0,
    fontSize: '0.95rem',
  },
  resultsTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 1rem 0',
    color: '#333',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  categoryTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 0.75rem 0',
    color: '#667eea',
  },
  titleList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  titleItem: {
    padding: '0.5rem 0',
    color: '#555',
    fontSize: '0.95rem',
  },
};