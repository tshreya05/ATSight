import { motion } from "framer-motion";

const rubricLabels = {
  skills_match: "Skill Match",
  experience_relevance: "Experience",
  education_certifications: "Education & Certs",
  projects_portfolio: "Projects",
  communication_quality: "Communication",
};

const badgeColor = {
  Hire: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
  Maybe: "bg-amber-500/20 text-amber-300 border-amber-400/40",
  Reject: "bg-rose-500/20 text-rose-300 border-rose-400/40",
};

function ScoreRing({ value }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <div className="relative h-28 w-28">
      <svg className="h-28 w-28 -rotate-90">
        <circle cx="56" cy="56" r={radius} stroke="rgba(148,163,184,.35)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="56"
          cy="56"
          r={radius}
          stroke="url(#grad)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.7 }}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xl font-bold text-cyan-200">{value.toFixed(1)}</div>
    </div>
  );
}

export default function CandidateView({ candidate, openOverride }) {
  if (!candidate) {
    return <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-8 text-slate-400">Select a resume from the right panel.</div>;
  }

  return (
    <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/50 p-5 backdrop-blur-xl shadow-neon">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-cyan-100">{candidate.profile.name}</h2>
            <p className="text-sm text-slate-400">{candidate.profile.source_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <ScoreRing value={candidate.total_score} />
            <div className="space-y-2">
              <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${badgeColor[candidate.recommendation]}`}>{candidate.recommendation}</span>
              <button className="block rounded-lg border border-slate-600 bg-slate-900 px-3 py-1 text-sm hover:border-cyan-300" onClick={() => openOverride(candidate)}>
                Override score
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-cyan-200">Strengths</h3>
          <div className="flex flex-wrap gap-2">
            {(candidate.strengths || []).map((s) => <span key={s} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">{s}</span>)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-cyan-200">Missing Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(candidate.missing_skills || []).map((s) => <span key={s} className="rounded-full border border-rose-400/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-300">{s}</span>)}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-cyan-200">AI Explanation</h3>
        <p className="text-sm leading-6 text-slate-300">{candidate.ai_explanation}</p>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-cyan-200">Rubric Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(candidate.rubric || {}).map(([key, value]) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{rubricLabels[key] || key}</span>
                <span>{value.score}/10</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.max(0, Math.min(100, (value.score / 10) * 100))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
