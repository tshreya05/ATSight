import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { renderAsync } from "docx-preview"; 

// Standard PDF Worker Setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function ResultCard({ result: initialResult, file, jdText, onRerun }) {
  const docxContainerRef = useRef(null);
  const [result, setResult] = useState(initialResult);
  const [highlight, setHighlight] = useState(null);
  const [activeSuggestionId, setActiveSuggestionId] = useState(null);
  const isDocx = file.name.toLowerCase().endsWith('.docx');

  // --- 1. RENDER DOCX AS EDITABLE HTML ---
  useEffect(() => {
    if (isDocx && file && docxContainerRef.current) {
      docxContainerRef.current.innerHTML = ""; 
      renderAsync(file, docxContainerRef.current, null, {
        className: "docx-render",
        inWrapper: false,
      }).then(() => {
        const editableElements = docxContainerRef.current.querySelectorAll('div, p, span, section');
        editableElements.forEach(el => {
          el.contentEditable = "true";
          el.style.userSelect = "text"; 
          el.style.pointerEvents = "auto";
          el.style.outline = "none";
        });
      });
    }
  }, [file, isDocx]);

  // --- 2. LOGIC TO AUTOMATICALLY APPLY AI SUGGESTIONS ---
  const handleApplyAiFix = (suggestion, event) => {
    event.stopPropagation(); 
    if (!isDocx || !suggestion.target_text || !docxContainerRef.current) return;
    const parts = suggestion.message.split("'");
    if (parts.length < 4) return;
    const replacementWord = parts[3];
    const walker = document.createTreeWalker(docxContainerRef.current, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.toLowerCase().includes(suggestion.target_text.toLowerCase())) {
        const regex = new RegExp(suggestion.target_text, 'gi');
        node.textContent = node.textContent.replace(regex, replacementWord);
        const parent = node.parentElement;
        parent.style.backgroundColor = "rgba(34, 197, 94, 0.4)";
        parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { parent.style.backgroundColor = "transparent"; }, 1500);
        break;
      }
    }
  };

  // --- 3. SAVE EDITS & RE-ANALYZE ---
  const handleSaveAndRerun = async () => {
    if (!isDocx) return;
    const fd = new FormData();
    fd.append("html_content", docxContainerRef.current.innerHTML); 
    fd.append("jd_text", jdText);
    fd.append("filename", file.name);
    try {
      const response = await fetch("http://localhost:8000/save-and-rerun", {
        method: "POST",
        body: fd,
      });
      if (response.ok) {
        const newData = await response.json();
        setResult(newData); 
        alert("ATS Score & AI Coach Updated!");
      }
    } catch (e) {
      alert("Failed to rerun analysis.");
    }
  };

  // --- 4. DOWNLOAD LOGIC ---
  const handleDownload = async () => {
    if (!isDocx || !docxContainerRef.current) return;
    const fd = new FormData();
    fd.append("html_content", docxContainerRef.current.innerHTML); 
    fd.append("filename", file.name);
    try {
      const response = await fetch("http://localhost:8000/download-resume", {
        method: "POST",
        body: fd,
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Improved_${file.name}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      alert("Download failed.");
    }
  };

  const handleSuggestionClick = (suggestion, index) => {
    setActiveSuggestionId(index);
    if (!isDocx && suggestion.target_text && result.word_map) {
      const foundWord = result.word_map.find(w => w.text.toLowerCase().includes(suggestion.target_text.toLowerCase()));
      if (foundWord) setHighlight(foundWord);
    }
    if (isDocx && suggestion.target_text && docxContainerRef.current) {
      const walker = document.createTreeWalker(docxContainerRef.current, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes(suggestion.target_text.toLowerCase())) {
          const parent = node.parentElement;
          parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
          parent.style.backgroundColor = "rgba(99, 102, 241, 0.3)";
          parent.focus();
          setTimeout(() => { parent.style.backgroundColor = "transparent"; }, 2000);
          break;
        }
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3 style={{ marginBottom: '10px' }}>ATS Match Score</h3>
          <div className="score-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="circle" strokeDasharray={`${result.ats_score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="percentage">{Math.round(result.ats_score)}%</div>
          </div>
          <button className="primary-btn rerun-btn" onClick={onRerun}>Upload New</button>
        </div>

        <div className="sidebar-scroll-area">
          {result.ai_coach && (
            <section className="insight-section" style={{ borderLeft: '4px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.05)', padding: '15px', marginBottom: '20px', borderRadius: '0 12px 12px 0' }}>
              <h4 style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>✨ AI Strategic Coach</h4>
              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.4' }}>{result.ai_coach.summary}</p>
              <div style={{ marginTop: '15px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#8b5cf6', letterSpacing: '0.5px' }}>MISSING GAPS:</span>
                <ul style={{ fontSize: '0.8rem', paddingLeft: '18px', marginTop: '5px', color: '#cbd5e1' }}>
                  {result.ai_coach.missing_parts.map((gap, i) => (<li key={i} style={{ marginBottom: '4px' }}>{gap}</li>))}
                </ul>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '8px', marginTop: '15px' }}>
                 <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10b981' }}>STRATEGIC TIP:</span>
                 <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#ecfdf5', marginTop: '3px' }}>"{result.ai_coach.strategic_tip}"</p>
              </div>
            </section>
          )}

          <section className="insight-section">
            <h4>Keywords</h4>
            <div className="skill-tags">
              {result.matched_keywords?.map((s, i) => <span key={i} className="tag match">{s}</span>)}
              {result.missing_keywords?.map((s, i) => <span key={i} className="tag missing">{s}</span>)}
            </div>
          </section>

          <section className="insight-section">
            <h4>Improvement Plan</h4>
            <div className="suggestion-list">
              {result.detailed_suggestions?.map((s, i) => (
                <div key={i} className={`suggestion-item ${activeSuggestionId === i ? 'active' : ''}`} onClick={() => handleSuggestionClick(s, i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div className="sug-header" style={{ marginBottom: '8px', width: '100%' }}><span className="suggestion-label">{s.label}</span></div>
                  <p className="suggestion-text" style={{ marginBottom: '12px' }}>{s.message}</p>
                  {isDocx && s.target_text && (<button className="auto-fix-btn-bottom" onClick={(e) => handleApplyAiFix(s, e)}>✨ Apply AI Fix</button>)}
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>

      <main className="pdf-viewer">
        {/* --- NEW HEADER ACTION BAR ABOVE THE VIEWER --- */}
        <div className="viewer-action-bar" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '10px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
          {isDocx && (
            <>
              <button 
                className="primary-btn" 
                style={{ background: 'var(--accent-indigo)', color: 'white', padding: '8px 16px', borderRadius: '6px' }} 
                onClick={handleSaveAndRerun}
              >
                💾 Save & Rerun
              </button>
              <button 
                className="primary-btn" 
                style={{ background: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '6px' }} 
                onClick={handleDownload}
              >
                📥 Download .docx
              </button>
            </>
          )}
        </div>

        <div className="pdf-canvas-container">
          {isDocx ? (
            <div className="docx-render-wrapper">
              <div ref={docxContainerRef} className="docx-content-target"></div>
            </div>
          ) : (
             <div className="actual-pdf-doc">
                <Document file={file}>
                  <Page pageNumber={1} width={750} />
                  {highlight && (
                    <div className="pdf-highlight-box" style={{
                      top: `${highlight.y}px`, left: `${highlight.x}px`,
                      width: `${highlight.w}px`, height: `${highlight.h}px`,
                      position: 'absolute'
                    }} />
                  )}
                </Document>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}