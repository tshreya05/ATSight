import { motion } from "framer-motion";
import { FileUp, UploadCloud, X } from "lucide-react";

const MAX_FILES = 20;
const MAX_FILE_SIZE_MB = 10;

const formatSize = (size) => `${(size / (1024 * 1024)).toFixed(2)} MB`;

export default function UploadDropzone({ files, setFiles, setError, uploadProgress }) {
  const validateAndMerge = (incomingFiles) => {
    const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
    const merged = [...files];
    for (const file of incomingFiles) {
      const key = `${file.name}-${file.size}`;
      const isValidType = file.name.toLowerCase().endsWith(".pdf") || file.name.toLowerCase().endsWith(".docx");
      if (!isValidType) {
        setError(`Unsupported file type: ${file.name}`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File too large (>10MB): ${file.name}`);
        continue;
      }
      if (existingKeys.has(key)) {
        continue;
      }
      merged.push(file);
      existingKeys.add(key);
      if (merged.length >= MAX_FILES) break;
    }
    if (merged.length >= MAX_FILES && incomingFiles.length > 0) {
      setError("Maximum 20 resumes allowed.");
    }
    setFiles(merged.slice(0, MAX_FILES));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    validateAndMerge(Array.from(event.dataTransfer.files || []));
  };

  const removeFile = (name, size) => {
    setFiles((prev) => prev.filter((f) => !(f.name === name && f.size === size)));
  };

  return (
    <div className="space-y-4">
      <motion.div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        whileHover={{ scale: 1.005 }}
        className="rounded-2xl border border-cyan-400/30 bg-white/5 p-5 backdrop-blur-xl shadow-neon"
      >
        <div className="flex items-center gap-3 text-cyan-300">
          <UploadCloud size={20} />
          <p className="font-medium">Drag & drop resumes (PDF, DOCX)</p>
        </div>
        <p className="mt-1 text-xs text-slate-400">Up to 20 files, max 10MB each. Duplicate files are skipped.</p>
        <input
          type="file"
          multiple
          accept=".pdf,.docx"
          className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm"
          onChange={(e) => validateAndMerge(Array.from(e.target.files || []))}
        />
        <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            animate={{ width: `${uploadProgress}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 16 }}
          />
        </div>
      </motion.div>

      <div className="grid gap-2">
        {files.map((file) => (
          <motion.div
            key={`${file.name}-${file.size}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/50 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <FileUp size={16} className="text-cyan-400" />
              <div>
                <p className="text-sm">{file.name}</p>
                <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
              </div>
            </div>
            <button
              className="rounded-lg p-1 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => removeFile(file.name, file.size)}
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
