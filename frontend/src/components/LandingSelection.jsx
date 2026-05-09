import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, User, ArrowRight } from 'lucide-react';

export default function LandingSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Welcome to ATSight
        </h1>
        <p className="text-lg text-slate-400 max-w-lg mx-auto">
          AI-Powered ATS Analysis. Choose your portal to get started.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-6 z-10">
        
        {/* Recruiter Card */}
        <motion.div
          whileHover={{ scale: 1.02, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/recruiter')}
          className="cursor-pointer relative group rounded-2xl border border-cyan-500/30 bg-slate-900/50 p-8 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-300">
              <Users size={32} />
            </div>
            <ArrowRight className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
          </div>
          <h2 className="text-2xl font-bold text-cyan-100 mb-2">Recruiter / HR</h2>
          <p className="text-slate-400 mb-4 h-20">
            Upload multiple resumes, compare candidates, view ATS shortlisting, and get hiring recommendations.
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">Batch Upload</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">Candidate Ranking</span>
          </div>
        </motion.div>

        {/* Candidate Card */}
        <motion.div
          whileHover={{ scale: 1.02, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/candidate')}
          className="cursor-pointer relative group rounded-2xl border border-blue-500/30 bg-slate-900/50 p-8 backdrop-blur-xl shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-300">
              <User size={32} />
            </div>
            <ArrowRight className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
          </div>
          <h2 className="text-2xl font-bold text-blue-100 mb-2">Candidate Analyzer</h2>
          <p className="text-slate-400 mb-4 h-20">
            Upload your resume, get an ATS score, discover missing skills, and receive AI-driven improvement feedback.
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">ATS Score</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">Resume Feedback</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
