const badgeColor = {
  Hire: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
  Maybe: "bg-amber-500/20 text-amber-300 border-amber-400/40",
  Reject: "bg-rose-500/20 text-rose-300 border-rose-400/40",
};

export default function RankingTable({ candidates, selectedId, setSelectedId }) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-cyan-200">Ranking Table</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-2 py-2">Rank</th>
              <th className="px-2 py-2">Candidate</th>
              <th className="px-2 py-2">Score</th>
              <th className="px-2 py-2">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr
                key={candidate.candidate_id}
                className={`cursor-pointer border-t border-slate-800 hover:bg-slate-800/60 ${selectedId === candidate.candidate_id ? "bg-cyan-500/10" : ""}`}
                onClick={() => setSelectedId(candidate.candidate_id)}
              >
                <td className="px-2 py-2">{candidate.rank}</td>
                <td className="px-2 py-2">{candidate.profile.name}</td>
                <td className="px-2 py-2">{candidate.total_score.toFixed(2)}</td>
                <td className="px-2 py-2">
                  <span className={`rounded-full border px-2 py-1 text-xs ${badgeColor[candidate.recommendation]}`}>{candidate.recommendation}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
