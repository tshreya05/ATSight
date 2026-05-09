import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, SlidersHorizontal, Trash2 } from "lucide-react";

const badgeColor = {
  Hire: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
  Maybe: "bg-amber-500/20 text-amber-300 border-amber-400/40",
  Reject: "bg-rose-500/20 text-rose-300 border-rose-400/40",
};

function PanelContent({ items, selectedId, setSelectedId, removeFile, onView }) {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("score_desc");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    let next = items.filter((item) => item.fileName.toLowerCase().includes(query.toLowerCase()) || item.candidateName.toLowerCase().includes(query.toLowerCase()));
    if (filter !== "all") next = next.filter((item) => item.recommendation === filter);
    if (sortOrder === "score_desc") next = [...next].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    if (sortOrder === "score_asc") next = [...next].sort((a, b) => (a.score ?? 999) - (b.score ?? 999));
    if (sortOrder === "name") next = [...next].sort((a, b) => a.candidateName.localeCompare(b.candidateName));
    return next;
  }, [items, query, sortOrder, filter]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-cyan-300/20 bg-slate-950/40 p-4 backdrop-blur-xl">
      <h3 className="mb-3 text-lg font-semibold text-cyan-100">Uploaded Resumes</h3>
      <div className="relative mb-2">
        <Search size={16} className="absolute left-2 top-2.5 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files/candidates" className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-8 pr-2 py-2 text-sm" />
      </div>
      <div className="mb-3 flex gap-2">
        <select className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="score_desc">Score high to low</option>
          <option value="score_asc">Score low to high</option>
          <option value="name">Name A-Z</option>
        </select>
        <select className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="Hire">Hire</option>
          <option value="Maybe">Maybe</option>
          <option value="Reject">Reject</option>
        </select>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {filtered.map((item) => (
          <motion.button
            key={item.fileKey}
            whileHover={{ x: 2 }}
            className={`w-full rounded-xl border p-3 text-left ${selectedId === item.candidateId ? "border-cyan-300 bg-cyan-500/10" : "border-slate-700 bg-slate-900/50"}`}
            onClick={() => item.candidateId && setSelectedId(item.candidateId)}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-cyan-300" />
                <p className="truncate text-sm font-medium">{item.fileName}</p>
              </div>
              <button
                className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-300"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(item.fileName, item.fileSize);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-xs text-slate-400">{item.candidateName}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">{item.fileType.toUpperCase()}</span>
              <span>{item.status}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className={`rounded-full border px-2 py-0.5 text-xs ${badgeColor[item.recommendation] || "border-slate-700 text-slate-300"}`}>{item.recommendation || "Pending"}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-cyan-200">{item.score != null ? `${item.score.toFixed(1)}` : "-"}</span>
                {item.candidateId && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onView(item.candidateId); }}
                    className="rounded-md border border-cyan-300/40 bg-cyan-900/20 px-2 py-0.5 text-[11px] text-cyan-200 hover:bg-cyan-500/30 transition-colors"
                  >
                    View
                  </button>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function ResumeSidePanel({ items, selectedId, setSelectedId, removeFile, mobileOpen, setMobileOpen, onView }) {
  return (
    <>
      <aside className="hidden xl:block xl:w-[320px]">
        <PanelContent items={items} selectedId={selectedId} setSelectedId={setSelectedId} removeFile={removeFile} onView={onView} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 xl:hidden" onClick={() => setMobileOpen(false)}>
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            className="absolute right-0 top-0 h-full w-[88%] max-w-[360px] bg-slate-950 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <PanelContent items={items} selectedId={selectedId} setSelectedId={setSelectedId} removeFile={removeFile} onView={onView} />
          </motion.div>
        </div>
      )}
    </>
  );
}
