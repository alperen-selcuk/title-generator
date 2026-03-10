'use client';

import { useState, useEffect } from 'react';

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
        throw new Error(data.error || 'Failed to generate titles');
      }

      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">LinkedIn Title Generator</h1>
          <p className="text-lg text-gray-600">
            Gemini AI ile profesyonel LinkedIn başlıkları üretin
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mevcut Başlık (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: Frontend Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beceriler
              </label>
              {skills.map((skill, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Beceri ${index + 1}`}
                  />
                  {skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSkill}
                className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                + Beceri Ekle
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sektör (İsteğe Bağlı)
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn: Teknoloji, Finans, Sağlık"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık Türü
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="realistic">Gerçekçi</option>
                  <option value="funny">Komik</option>
                  <option value="absurd">Abur cubur</option>
                  <option value="corporate">Kurumsal</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={generateAll}
                    onChange={(e) => setGenerateAll(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Tüm başlıkları oluştur</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Başlıklar Üretiliyor...' : 'Başlıklar Üret'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Üretilen Başlıklar</h2>
            
            {generateAll ? (
              <div className="space-y-8">
                {['realistic', 'funny', 'absurd', 'corporate'].map((t) => (
                  <div key={t}>
                    <h3 className="text-lg font-semibold text-gray-800 capitalize mb-3">
                      {t === 'realistic' && 'Gerçekçi'}
                      {t === 'funny' && 'Komik'}
                      {t === 'absurd' && 'Abur Cubur'}
                      {t === 'corporate' && 'Kurumsal'}
                    </h3>
                    <ul className="space-y-2">
                      {results[t]?.map((title, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-gray-700">{title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 capitalize mb-3">
                  {tone === 'realistic' && 'Gerçekçi'}
                  {tone === 'funny' && 'Komik'}
                  {tone === 'absurd' && 'Abur Cubur'}
                  {tone === 'corporate' && 'Kurumsal'}
                </h3>
                <ul className="space-y-2">
                  {results[tone]?.map((title, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{title}</span>
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