import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileJson, FileText } from "lucide-react";
import { downloadJsonReport, downloadPdfReport } from "../api";

function saveBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function DownloadActions() {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingJson, setLoadingJson] = useState(false);

  const handlePdf = async () => {
    setLoadingPdf(true);
    try {
      const blob = await downloadPdfReport();
      saveBlob(blob, "ATSight_shortlist_report.pdf");
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleJson = async () => {
    setLoadingJson(true);
    try {
      const blob = await downloadJsonReport();
      saveBlob(blob, "ATSight_shortlist_report.json");
    } finally {
      setLoadingJson(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 shadow-neon disabled:opacity-70"
        onClick={handlePdf}
        disabled={loadingPdf}
      >
        <FileText size={18} />
        {loadingPdf ? "Preparing PDF..." : "Download PDF Report"}
        <Download size={16} />
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-slate-900/80 px-5 py-3 font-semibold text-cyan-100 shadow-neon disabled:opacity-70"
        onClick={handleJson}
        disabled={loadingJson}
      >
        <FileJson size={18} />
        {loadingJson ? "Preparing JSON..." : "Download JSON Report"}
        <Download size={16} />
      </motion.button>
    </div>
  );
}
