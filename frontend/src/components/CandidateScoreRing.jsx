import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CandidateScoreRing({ score, loading }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    if (!loading && score !== undefined && score !== null) {
      let current = 0;
      const target = Math.round(score);
      const step = Math.max(1, Math.floor(target / 50));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          setAnimatedScore(target);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      setAnimatedScore(0);
    }
  }, [score, loading]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  let colorClass = "text-rose-500";
  if (animatedScore >= 75) colorClass = "text-green-400";
  else if (animatedScore >= 50) colorClass = "text-yellow-400";

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-800"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: loading ? circumference : strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className={`${colorClass} drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`}
            style={{ 
              filter: `drop-shadow(0 0 10px ${animatedScore >= 75 ? '#4ade80' : animatedScore >= 50 ? '#facc15' : '#f43f5e'})`
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          {loading ? (
            <span className="text-xl font-bold text-slate-300 animate-pulse">...</span>
          ) : (
            <>
              <span className={`text-4xl font-bold ${colorClass}`}>{animatedScore}</span>
              <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">/ 100</span>
            </>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-300">ATS Match Score</p>
    </div>
  );
}
