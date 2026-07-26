import React, { useEffect, useState } from "react";

const scannerSteps = [
  "Bypassing ATS filters...",
  "Extracting semantic keywords...",
  "Matching candidate skills...",
  "Computing final score..."
];

export default function Analyzing() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev < scannerSteps.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <div className="bg-glow">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <div className="workspace-wrapper">
        <div className="workspace-card" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Animated Scanning Line */}
          <div className="scanner-line"></div>
          
          <h2 className="hero-title" style={{ fontSize: '2rem', marginBottom: '30px' }}>
            System Scan In Progress
          </h2>
          
          <div style={{ width: '100%', textAlign: 'left' }}>
            {scannerSteps.map((step, i) => (
              <div key={i} style={{ 
                margin: '20px 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px',
                opacity: i <= current ? 1 : 0.2,
                transition: 'opacity 0.5s ease',
                color: i === current ? 'var(--accent-indigo)' : '#fff'
              }}>
                <span style={{ fontSize: '1.2rem' }}>
                    {i < current ? "✓" : i === current ? "⚡" : "○"}
                </span>
                <span style={{ fontWeight: i === current ? '700' : '400' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}