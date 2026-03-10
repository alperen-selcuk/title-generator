'use client';

import { useState } from 'react';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e8f1ff 0%, #e6e8ff 100%)',
    padding: '3rem 1rem',
  },
  maxWidth: {
    maxWidth: '48rem',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#4b5563',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
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
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.25rem',
  },
  input: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    transition: 'box-shadow 0.2s',
  },
  inputFocus: {
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
  },
  button: {
    padding: '0.75rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  buttonHover: {
    backgroundColor: '#2563eb',
  },
  buttonDisabled: {
    opacity: '0.5',
    cursor: 'not-allowed',
  },
  buttonDelete: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0 0.5rem 0.5rem 0',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  buttonAdd: {
    marginTop: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: '#2563eb',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  skillsContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  skillInput: {
    flex: 1,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  checkbox: {
    marginRight: '0.5rem',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '0.75rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
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
  },
  resultsList: {
    marginTop: '1rem',
  },
  resultsTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1.5rem',
  },
  resultCategory: {
    marginBottom: '2rem',
  },
  categoryTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.75rem',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
    color: '#4b5563',
  },
  bullet: {
    color: '#3b82f6',
    marginRight: '0.5rem',
  },
};

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
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
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
          currentTitle,
          skills: skills.filter(skill => skill.trim() !== ''),
          industry,
          tone,
          generateAll,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Başlıklar üretilirken hata oluştu');
      }

      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        <div style={styles.header}>
          <h1 style={styles.title}>LinkedIn Title Generator</h1>
          <p style={styles.subtitle}>Gemini AI ile profesyonel LinkedIn başlıkları üretin</p>
        </div>

        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mevcut Başlık (İsteğe Bağlı)</label>
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                style={styles.input}
                placeholder="Örn: Frontend Developer"
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Beceriler</label>
              {skills.map((skill, index) => (
                <div key={index} style={styles.skillsContainer}>
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    style={{ ...styles.input, ...styles.skillInput }}
                    placeholder={`Beceri ${index + 1}`}
                    onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  />
                  {skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      style={styles.buttonDelete}
                      onHover={() => {}}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSkill}
                style={styles.buttonAdd}
              >
                + Beceri Ekle
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Sektör (İsteğe Bağlı)</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={styles.input}
                placeholder="Örn: Teknoloji, Finans, Sağlık"
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            <div style={styles.gridContainer}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Başlık Türü</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  style={styles.input}
                >
                  <option value="realistic">Gerçekçi</option>
                  <option value="funny">Komik</option>
                  <option value="absurd">Abur cubur</option>
                  <option value="corporate">Kurumsal</option>
                </select>
              </div>

              <div style={{ ...styles.formGroup, justifyContent: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={generateAll}
                    onChange={(e) => setGenerateAll(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>Tüm başlıkları oluştur</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
              }}
            >
              {loading ? 'Başlıklar Üretiliyor...' : 'Başlıklar Üret'}
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
            <h2 style={styles.resultsTitle}>Üretilen Başlıklar</h2>

            {generateAll ? (
              <div>
                {['realistic', 'funny', 'absurd', 'corporate'].map((t) => (
                  <div key={t} style={styles.resultCategory}>
                    <h3 style={styles.categoryTitle}>
                      {t === 'realistic' && 'Gerçekçi'}
                      {t === 'funny' && 'Komik'}
                      {t === 'absurd' && 'Abur Cubur'}
                      {t === 'corporate' && 'Kurumsal'}
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
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
                <h3 style={styles.categoryTitle}>
                  {tone === 'realistic' && 'Gerçekçi'}
                  {tone === 'funny' && 'Komik'}
                  {tone === 'absurd' && 'Abur Cubur'}
                  {tone === 'corporate' && 'Kurumsal'}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
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