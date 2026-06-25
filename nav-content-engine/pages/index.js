import { useState } from 'react';
import Head from 'next/head';
import '../styles/globals.css';

export default function Home() {
  const [ytUrl, setYtUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ ig: '', li: '', wa: '' });
  const [output, setOutput] = useState(null);
  const [activeTab, setActiveTab] = useState('ig');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [copied, setCopied] = useState('');

  async function handleExtract() {
    if (!ytUrl.trim()) { setErr('Paste a YouTube URL first.'); return; }
    setErr(''); setInfo('Fetching transcript…');
    setExtracting(true);
    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ytUrl.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTranscript(data.transcript);
      setInfo('✓ Transcript loaded — hit Generate to create your content.');
    } catch (e) {
      setErr(e.message || 'Could not fetch transcript. Paste talking points manually below.');
      setInfo('');
    }
    setExtracting(false);
  }

  async function handleGenerate() {
    if (!transcript.trim()) { setErr('Add a transcript or talking points first.'); return; }
    setErr(''); setInfo('');
    setGenerating(true);
    setOutput(null);
    setProgress({ ig: 'running', li: 'running', wa: 'running' });

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcript.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOutput(data);
      setProgress({ ig: 'done', li: 'done', wa: 'done' });
      setActiveTab('ig');
    } catch (e) {
      setErr(e.message || 'Generation failed. Try again.');
      setProgress({ ig: '', li: '', wa: '' });
    }
    setGenerating(false);
  }

  function copyText(text, key) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  function reset() {
    setYtUrl(''); setTranscript(''); setOutput(null);
    setErr(''); setInfo(''); setProgress({ ig: '', li: '', wa: '' });
  }

  const igPlain = output?.slides?.map((s, i) => `SLIDE ${i + 1}\n${s.h}\n\n${s.b}`).join('\n\n---\n\n') || '';

  return (
    <>
      <Head>
        <title>Nav's Content Engine</title>
        <meta name="description" content="Turn any Nav video into Instagram carousel, LinkedIn post & WhatsApp blast" />
      </Head>

      <div className="app">
        <div className="eye">Built for Nav · Content Engine</div>
        <h1>One video.<br /><span>Three platforms. Instantly.</span></h1>
        <p className="sub">
          Paste a YouTube link to pull the transcript automatically — or paste talking points manually.
          Get a full Instagram carousel, LinkedIn post & WhatsApp blast in Nav's voice.
        </p>

        <div className="card">
          <label className="field-label">YouTube Video URL</label>
          <div className="url-row">
            <input
              className="url-input"
              type="url"
              placeholder="https://youtube.com/watch?v=…  or  https://youtu.be/…"
              value={ytUrl}
              onChange={e => setYtUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleExtract()}
            />
            <button className="url-btn" onClick={handleExtract} disabled={extracting || generating}>
              {extracting ? 'Extracting…' : 'Extract ↗'}
            </button>
          </div>

          <div className="divider">or paste transcript / talking points directly</div>

          <label className="field-label">Transcript or talking points</label>
          <textarea
            placeholder="Paste the transcript here, or type your key talking points from the video…"
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
          />

          {err && <div className="err">{err}</div>}
          {info && <div className="info">{info}</div>}

          <div className="input-footer">
            <span className="char-hint">{transcript.length} characters</span>
            <button className="gen-btn" onClick={handleGenerate} disabled={generating || extracting}>
              {generating ? 'Generating…' : 'Generate all 3 platforms ↗'}
            </button>
          </div>
        </div>

        {/* Progress */}
        {generating && (
          <>
            <div className="prog-row">
              {['ig', 'li', 'wa'].map(p => (
                <div key={p} className={`prog-pill${progress[p] ? ' ' + progress[p] : ''}`}>
                  {p === 'ig' ? 'Instagram' : p === 'li' ? 'LinkedIn' : 'WhatsApp'}
                  {progress[p] === 'done' ? ' ✓' : progress[p] === 'running' ? ' …' : ''}
                </div>
              ))}
            </div>
            <div className="prog-bar"><div className="prog-bar-fill" /></div>
          </>
        )}

        {/* Output */}
        {output && (
          <div>
            <div className="ptabs">
              {[
                { key: 'ig', label: 'Instagram', color: '#e1306c', cls: 'ig' },
                { key: 'li', label: 'LinkedIn', color: '#4da3f5', cls: 'li' },
                { key: 'wa', label: 'WhatsApp', color: '#25d366', cls: 'wa' }
              ].map(t => (
                <button
                  key={t.key}
                  className={`ptab ${t.cls}${activeTab === t.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  <span className="dot" style={{ background: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'ig' && (
              <div className="out-card">
                <div className="ptag ig">📸 Instagram Carousel — {output.slides.length} Slides</div>
                {output.slides.map((s, i) => (
                  <div key={i} className="slide">
                    <div className="slide-num">Slide {i + 1}</div>
                    <div className="slide-hl">{s.h}</div>
                    <div className="slide-body">{s.b}</div>
                  </div>
                ))}
                <button
                  className={`copy-btn${copied === 'ig' ? ' copied' : ''}`}
                  onClick={() => copyText(igPlain, 'ig')}
                >
                  {copied === 'ig' ? '✓ Copied!' : 'Copy all slides ↗'}
                </button>
              </div>
            )}

            {activeTab === 'li' && (
              <div className="out-card">
                <div className="ptag li">💼 LinkedIn Post</div>
                <div className="out-text">{output.li}</div>
                <button
                  className={`copy-btn${copied === 'li' ? ' copied' : ''}`}
                  onClick={() => copyText(output.li, 'li')}
                >
                  {copied === 'li' ? '✓ Copied!' : 'Copy post ↗'}
                </button>
              </div>
            )}

            {activeTab === 'wa' && (
              <div className="out-card">
                <div className="ptag wa">💬 WhatsApp Blast</div>
                <div className="out-text">{output.wa}</div>
                <button
                  className={`copy-btn${copied === 'wa' ? ' copied' : ''}`}
                  onClick={() => copyText(output.wa, 'wa')}
                >
                  {copied === 'wa' ? '✓ Copied!' : 'Copy message ↗'}
                </button>
              </div>
            )}

            <div className="reset-row">
              <button className="reset-btn" onClick={reset}>← Try another video</button>
              <div className="built">Built by <strong>Harneet Singh</strong> · AI Automation</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
