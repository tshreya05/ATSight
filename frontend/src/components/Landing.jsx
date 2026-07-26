import React from 'react';

export default function Landing({ onStart }) {
  return (
    <div className="app-container">
      {/* BACKGROUND ELEMENTS */}
      <div className="bg-glow">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <header className="navbar" style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '30px 40px',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}>
        <div className="logo" style={{ fontWeight: 800, fontSize: '1.6rem', color: '#fff' }}>
          <span style={{ color: 'var(--accent-indigo)' }}>●</span> STORM
        </div>
        <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer' }}>Features</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer' }}>Pricing</span>
          <button className="primary-btn" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>Get Started</button>
        </nav>
      </header>

      <main className="hero-section" style={{
        textAlign: 'center',
        padding: '100px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '900px'
      }}>
        <div className="hero-badge" style={{
          border: '1px solid var(--border-subtle)',
          padding: '10px 24px',
          borderRadius: '999px',
          fontSize: '0.9rem',
          color: '#fff',
          marginBottom: '32px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)'
        }}>
          ✨ AI-Powered ATS Analysis
        </div>

        <h1 className="hero-title">
          Beat the ATS and land <br /> 
          your dream interview
        </h1>

        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '1.3rem', 
          marginBottom: '54px', 
          maxWidth: '700px', 
          lineHeight: '1.6'
        }}>
          Don't let a robot reject your hard work. Our AI matches your resume keywords 
          to job descriptions, giving you the edge you need to get hired.
        </p>

        <div style={{ display: 'flex', gap: '24px' }}>
          <button className="primary-btn" onClick={onStart}>
            Analyze Resume Now
          </button>
        </div>
      </main>
    </div>
  );
}