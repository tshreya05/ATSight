import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Download, CheckCircle, XCircle, AlertCircle, Sparkles, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CandidateScoreRing from './CandidateScoreRing';
import { analyzeCandidateResume } from '../api';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your resume.");
      return;
    }
    setError("");
    setLoading(true);
    
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd_text", jdText || "");
    
    try {
      const data = await analyzeCandidateResume(formData);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ATS_Report_${file?.name || 'resume'}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 overflow-x-hidden relative">
      {/* Background glowing effects */}
      <div className="absolute top-0 left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto z-10 relative">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-blue-500/20 bg-slate-900/40 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-blue-100 md:text-2xl flex items-center gap-2">
                <Sparkles className="text-blue-400" size={24} /> Candidate ATS Analyzer
              </h1>
              <p className="text-xs text-slate-400">Optimize your resume against ATS systems</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Input & Score */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-blue-500/20 bg-slate-900/50 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(59,130,246,0.1)]"
            >
              <h2 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                <FileText size={18} /> Upload Details
              </h2>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-300">Target Job Description (Optional but recommended)</label>
                <textarea 
                  rows={4} 
                  value={jdText} 
                  onChange={(e) => setJdText(e.target.value)} 
                  placeholder="Paste the job description here..." 
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 focus:border-blue-500/50 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-slate-300">Your Resume</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    accept=".pdf,.docx,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? 'border-blue-400 bg-blue-500/10' : 'border-slate-600 bg-slate-800/30 group-hover:border-blue-400/50 group-hover:bg-slate-800/60'}`}>
                    {file ? (
                      <div>
                        <FileText className="mx-auto mb-2 text-blue-400" size={32} />
                        <p className="text-sm font-medium text-blue-200 truncate px-2">{file.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto mb-2 text-slate-400 group-hover:text-blue-400 transition-colors" size={32} />
                        <p className="text-sm font-medium text-slate-300">Click or drag resume here</p>
                        <p className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && <p className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-sm text-rose-300">{error}</p>}

              <button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:shadow-none transition-all hover:scale-[1.02] active:scale-95"
              >
                {loading ? 'Analyzing with AI...' : 'Analyze My Resume'}
              </button>
            </motion.div>

            <AnimatePresence>
              {(result || loading) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-xl flex flex-col items-center"
                >
                  <CandidateScoreRing score={result?.ats_score} loading={loading} />
                  
                  {result && (
                    <div className="w-full mt-6 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Format Quality</span>
                        <span className="font-medium text-slate-200">Optimal</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Keyword Match</span>
                        <span className="font-medium text-slate-200">{result?.matched_keywords?.length || 0} Found</span>
                      </div>
                      
                      <button onClick={downloadJson} className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/20 transition-colors">
                        <Download size={16} /> Download JSON Report
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-8">
            {!result && !loading ? (
              <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/20 p-12 text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                  <Sparkles size={40} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-medium text-slate-300 mb-2">Awaiting Analysis</h3>
                <p className="text-slate-500 max-w-md">
                  Upload your resume and optional job description to receive a comprehensive AI-powered breakdown of your profile.
                </p>
              </div>
            ) : loading ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-2xl border border-blue-500/20 bg-slate-900/30">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-blue-300 animate-pulse">Running AI models on your resume...</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="space-y-6"
              >
                {/* AI Summary */}
                {result.ai_coach && (
                  <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900/80 to-purple-900/20 p-6 backdrop-blur-xl">
                    <h3 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                      <Sparkles size={20} /> AI Recruiter Feedback
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {result.ai_coach.summary || "Your resume has been analyzed successfully."}
                    </p>
                    {result.ai_coach.strategic_tip && (
                      <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-sm text-purple-200 inline-flex items-center gap-2">
                        <AlertCircle size={16} /> <strong>Pro Tip:</strong> {result.ai_coach.strategic_tip}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/50 p-6">
                    <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
                      <CheckCircle size={20} /> Resume Strengths
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_keywords?.length > 0 ? (
                        result.matched_keywords.map((kw, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">No specific strengths highlighted.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="rounded-2xl border border-rose-500/20 bg-slate-900/50 p-6">
                    <h3 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
                      <XCircle size={20} /> Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords?.length > 0 ? (
                        result.missing_keywords.map((kw, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">Great job! No major keywords missing.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="rounded-2xl border border-blue-500/20 bg-slate-900/50 p-6">
                  <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} /> Actionable Suggestions
                  </h3>
                  <div className="space-y-3">
                    {result.detailed_suggestions?.length > 0 ? (
                      result.detailed_suggestions.map((sug, idx) => (
                        <div key={idx} className="flex gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                          <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-blue-400"></div></div>
                          <div>
                            <span className="font-semibold text-slate-200">{sug.label}: </span>
                            <span className="text-slate-300">{sug.message}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No further suggestions. Your resume looks solid.</p>
                    )}
                  </div>
                </div>

              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
