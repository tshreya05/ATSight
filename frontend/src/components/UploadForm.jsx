import React, { useState } from "react";
import { analyzeResume } from "../api";

export default function UploadForm({ onAnalyze, onResult }) {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");

  const handleAnalyze = async () => {
    if (!file || !jd) return alert("Upload a resume and paste JD");
    
    const fd = new FormData();
    fd.append("file", file);
    fd.append("jd_text", jd);

    onAnalyze();

    try {
      const data = await analyzeResume(fd);
      onResult(data, file, jd); // Passing jd back to App.jsx
    } catch (error) {
      alert("Analysis failed.");
      window.location.reload();
    }
  };

  return (
    <div className="app-container">
      <div className="bg-glow">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      <div className="workspace-wrapper">
        <div className="workspace-card">
          <h2 className="hero-title" style={{ fontSize: '2.5rem' }}>Workspace</h2>
          <div className="input-section">
            <label className="section-label">Resume (PDF or DOCX)</label>
            <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} className="modern-input" />
          </div>
          <div className="input-section">
            <label className="section-label">Job Description</label>
            <textarea rows="8" value={jd} onChange={(e) => setJd(e.target.value)} className="modern-textarea" placeholder="Paste JD here..." />
          </div>
          <button className="primary-btn full-width-btn" onClick={handleAnalyze}>Run ATS Analysis</button>
        </div>
      </div>
    </div>
  );
}