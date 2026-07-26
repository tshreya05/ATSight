import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { getPreviewUrl, getDownloadUrl } from "../api";
import axios from "axios";

export default function ResumePreviewModal({ candidate, isOpen, onClose }) {
  if (!isOpen || !candidate) return null;

  const [textContent, setTextContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filename = candidate.profile.source_name;
  const isPdf = filename.toLowerCase().endsWith(".pdf");

  useEffect(() => {
    if (!isPdf) {
      setLoading(true);
      axios.get(getPreviewUrl(candidate.candidate_id))
        .then(res => {
          setTextContent(typeof res.data === "object" ? JSON.stringify(res.data, null, 2) : res.data);
          setError("");
        })
        .catch(err => {
          setError("Failed to load preview.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [candidate.candidate_id, isPdf]);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-cyan-300/30 bg-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.1)]"
      >
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 p-4">
          <div>
            <h3 className="text-lg font-semibold text-cyan-100">{candidate.profile.name}</h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
              <span className="rounded bg-slate-800 px-2 py-0.5 uppercase">{filename.split('.').pop()}</span>
              <span>ATS Score: <strong className="text-cyan-300">{candidate.total_score.toFixed(1)}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href={getDownloadUrl(candidate.candidate_id)}
              download
              className="flex items-center gap-2 rounded-lg bg-cyan-500/20 px-3 py-1.5 text-sm font-medium text-cyan-200 hover:bg-cyan-500/30 transition-colors"
            >
              <Download size={16} /> Download
            </a>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-slate-950/80 p-4 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/50 backdrop-blur-sm">
              <Loader2 size={32} className="animate-spin text-cyan-400" />
            </div>
          )}
          {error && (
            <div className="grid h-full place-items-center text-rose-400">
              {error}
            </div>
          )}
          {!error && isPdf && (
             <iframe
               src={getPreviewUrl(candidate.candidate_id)}
               className="h-full w-full rounded-xl border border-slate-800 bg-white"
               title="Resume Preview"
               onLoad={() => setLoading(false)}
             />
          )}
          {!error && !isPdf && !loading && (
            <div className="h-full w-full overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-inner">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
                {textContent}
              </pre>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
