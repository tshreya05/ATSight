import { useState } from "react";
import { analyzeResume } from "../api";
import Loader from "./Loader";

export default function UploadStep({ onResult }) {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file || !jd) return alert("Upload a resume and paste JD");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("jd_text", jd);
    setLoading(true);
    try {
      const data = await analyzeResume(fd);
      onResult(data);
    } catch (err) {
      alert("Error analyzing resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="card">
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: '#fff' }}>Upload Resume</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Check your ATS compatibility instantly.</p>

          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>RESUME (PDF)</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} 
              style={{ width: '100%', marginTop: '8px', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '12px' }} 
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '32px' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>JOB DESCRIPTION</label>
            <textarea
              rows="6"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste job description here..."
              style={{ width: '100%', marginTop: '8px', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '15px', color: '#fff' }}
            />
          </div>

          <button className="primary-btn" style={{ width: '100%' }} onClick={handleAnalyze}>
            {loading ? "Analyzing..." : "Run ATS Analysis"}
          </button>
          
          {loading && <Loader />}
        </div>
      </div>
    </div>
  );
}