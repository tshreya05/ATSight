import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { shortlistCandidates, submitOverride } from "../api";
import CandidateView from "./CandidateView";
import DownloadActions from "./DownloadActions";
import RankingTable from "./RankingTable";
import ResumeSidePanel from "./ResumeSidePanel";
import UploadDropzone from "./UploadDropzone";
import ResumePreviewModal from "./ResumePreviewModal";

export default function ShortlistDashboard() {
  const [jdText, setJdText] = useState("");
  const [resumeFiles, setResumeFiles] = useState([]);
  const [linkedinText, setLinkedinText] = useState("");
  const [linkedinJson, setLinkedinJson] = useState(null);
  const [linkedinName, setLinkedinName] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [overrideState, setOverrideState] = useState({ open: false, candidateId: "", score: "", recommendation: "Maybe", reason: "" });
  const [previewCandidate, setPreviewCandidate] = useState(null);

  const handleLinkedinJsonChange = (e) => {
    const file = (e.target.files || [])[0] || null;
    setLinkedinJson(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          setLinkedinName(parsed.name || "");
        } catch (err) {
          setLinkedinName("");
        }
      };
      reader.readAsText(file);
    } else {
      setLinkedinName("");
    }
  };

  const handleAnalyze = async () => {
    setError("");
    if (!jdText.trim()) {
      setError("Please paste a job description.");
      return;
    }
    if (resumeFiles.length === 0 && !linkedinText.trim() && !linkedinJson) {
      setError("Upload at least one resume or provide LinkedIn data.");
      return;
    }
    const fd = new FormData();
    fd.append("jd_text", jdText);
    resumeFiles.forEach((file) => fd.append("resumes", file));
    if (activeTab === "text" && linkedinText.trim()) fd.append("linkedin_text", linkedinText.trim());
    if (activeTab === "json" && linkedinJson) fd.append("linkedin_json", linkedinJson);

    setLoading(true);
    setUploadProgress(0);
    try {
      const data = await shortlistCandidates(fd, (evt) => {
        if (!evt.total) return;
        setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      setResult(data);
      if (data?.candidates?.length) {
        setSelectedCandidateId(data.candidates[0].candidate_id);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Shortlisting failed.");
    } finally {
      setLoading(false);
    }
  };

  const sortedCandidates = useMemo(() => result?.candidates || [], [result]);
  const selectedCandidate = useMemo(
    () => sortedCandidates.find((candidate) => candidate.candidate_id === selectedCandidateId) || sortedCandidates[0],
    [sortedCandidates, selectedCandidateId]
  );

  const resumePanelItems = useMemo(() => {
    const bySource = new Map(sortedCandidates.map((c) => [String(c.profile.source_name).toLowerCase(), c]));
    const items = resumeFiles.map((file) => {
      const candidate = bySource.get(file.name.toLowerCase());
      return {
        fileKey: `${file.name}-${file.size}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.name.split(".").pop()?.toLowerCase() || "file",
        status: candidate ? "Analyzed" : loading ? "Uploading..." : "Pending",
        score: candidate?.total_score,
        recommendation: candidate?.recommendation,
        candidateName: candidate?.profile?.name || "Awaiting parse",
        candidateId: candidate?.candidate_id || "",
      };
    });

    if (linkedinJson) {
      const candidate = bySource.get(linkedinJson.name.toLowerCase());
      items.push({
        fileKey: `${linkedinJson.name}-${linkedinJson.size}`,
        fileName: linkedinJson.name,
        fileSize: linkedinJson.size,
        fileType: "json",
        status: candidate ? "Analyzed" : loading ? "Uploading..." : "Pending",
        score: candidate?.total_score,
        recommendation: candidate?.recommendation,
        candidateName: candidate?.profile?.name || linkedinName || "LinkedIn Profile",
        candidateId: candidate?.candidate_id || "",
      });
    }

    return items;
  }, [resumeFiles, linkedinJson, linkedinName, sortedCandidates, loading]);

  const removeFile = (fileName, fileSize) => {
    if (linkedinJson && linkedinJson.name === fileName && linkedinJson.size === fileSize) {
      setLinkedinJson(null);
      setLinkedinName("");
      return;
    }
    setResumeFiles((prev) => prev.filter((f) => !(f.name === fileName && f.size === fileSize)));
  };

  const handleOverrideSave = async () => {
    if (!overrideState.candidateId || !overrideState.reason.trim()) {
      setError("Override requires reason.");
      return;
    }
    try {
      await submitOverride({
        candidate_id: overrideState.candidateId,
        total_score: overrideState.score ? Number(overrideState.score) : null,
        recommendation: overrideState.recommendation,
        reason: overrideState.reason,
        category_updates: {},
      });
      setOverrideState({ open: false, candidateId: "", score: "", recommendation: "Maybe", reason: "" });
      setError("");
    } catch {
      setError("Failed to save override.");
    }
  };

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6">
        <header className="mb-4 flex items-center justify-between rounded-2xl border border-cyan-300/20 bg-slate-900/40 px-4 py-3 backdrop-blur-xl">
          <div>
            <h1 className="text-xl font-semibold text-cyan-100 md:text-2xl">ATSight AI Recruiter Dashboard</h1>
            <p className="text-xs text-slate-400">Multi-resume shortlisting with LinkedIn + ATS scoring</p>
          </div>
          <button className="xl:hidden rounded-lg border border-slate-700 bg-slate-900/70 p-2" onClick={() => setMobilePanelOpen(true)}>
            <Menu size={18} />
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)_320px]">
          <aside className="space-y-4">
            <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-cyan-300/20 bg-slate-900/50 p-4 backdrop-blur-xl shadow-neon">
              <label className="mb-2 block text-sm font-semibold text-cyan-100">Job Description</label>
              <textarea rows={7} value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste JD..." className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm" />

              <div className="mt-4">
                <UploadDropzone files={resumeFiles} setFiles={setResumeFiles} setError={setError} uploadProgress={uploadProgress} />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/50 p-3">
                <p className="mb-2 text-xs text-slate-400">You can upload a resume, LinkedIn JSON, or both.</p>
                <div className="mb-2 flex gap-2">
                  <button className={`flex-1 rounded-lg px-2 py-2 text-xs ${activeTab === "text" ? "bg-cyan-500/20 text-cyan-200" : "bg-slate-800 text-slate-300"}`} onClick={() => setActiveTab("text")}>LinkedIn Text</button>
                  <button className={`flex-1 rounded-lg px-2 py-2 text-xs ${activeTab === "json" ? "bg-cyan-500/20 text-cyan-200" : "bg-slate-800 text-slate-300"}`} onClick={() => setActiveTab("json")}>LinkedIn JSON</button>
                </div>
                {activeTab === "text" ? (
                  <textarea rows={5} value={linkedinText} onChange={(e) => setLinkedinText(e.target.value)} placeholder="Paste LinkedIn profile text..." className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" />
                ) : (
                  <div>
                    <input type="file" accept=".json" className="hidden" id="linkedin-upload" onChange={handleLinkedinJsonChange} />
                    <label htmlFor="linkedin-upload" className="block w-full cursor-pointer rounded-lg border border-dashed border-slate-700 bg-slate-900 px-3 py-4 text-center text-sm text-slate-400 hover:bg-slate-800">
                      {linkedinJson ? "Change LinkedIn JSON file" : "Click to select LinkedIn JSON"}
                    </label>
                    {linkedinJson && (
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white">in</span>
                          <div>
                            <p className="text-sm font-medium text-cyan-100">{linkedinJson.name}</p>
                            {linkedinName && <p className="text-xs text-slate-400">Candidate: {linkedinName}</p>}
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-white" onClick={() => { setLinkedinJson(null); setLinkedinName(""); }}>
                          &times;
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && <p className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
              <button disabled={loading} onClick={handleAnalyze} className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 font-semibold text-slate-950 shadow-neon disabled:opacity-60">
                {loading ? `Analyzing... ${uploadProgress}%` : "Run ATS Shortlisting"}
              </button>
            </motion.section>
          </aside>

          <main className="space-y-4">
            {result && <DownloadActions />}
            {result && <RankingTable candidates={sortedCandidates} selectedId={selectedCandidate?.candidate_id} setSelectedId={setSelectedCandidateId} />}
            {result && <CandidateView candidate={selectedCandidate} openOverride={(candidate) => setOverrideState({ ...overrideState, open: true, candidateId: candidate.candidate_id, recommendation: candidate.recommendation, score: String(candidate.total_score ?? "") })} />}
          </main>

          <ResumeSidePanel
            items={resumePanelItems}
            selectedId={selectedCandidate?.candidate_id}
            setSelectedId={setSelectedCandidateId}
            removeFile={removeFile}
            mobileOpen={mobilePanelOpen}
            setMobileOpen={setMobilePanelOpen}
            onView={(candidateId) => {
              const cand = sortedCandidates.find((c) => c.candidate_id === candidateId);
              if (cand) setPreviewCandidate(cand);
            }}
          />
        </div>
      </div>

      {overrideState.open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-cyan-300/30 bg-slate-950 p-5">
            <h3 className="mb-3 text-lg font-semibold text-cyan-100">Manual Override</h3>
            <input className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" placeholder="New total score (optional)" value={overrideState.score} onChange={(e) => setOverrideState({ ...overrideState, score: e.target.value })} />
            <select className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" value={overrideState.recommendation} onChange={(e) => setOverrideState({ ...overrideState, recommendation: e.target.value })}>
              <option>Hire</option>
              <option>Maybe</option>
              <option>Reject</option>
            </select>
            <textarea className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" rows={4} placeholder="Reason" value={overrideState.reason} onChange={(e) => setOverrideState({ ...overrideState, reason: e.target.value })} />
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" onClick={() => setOverrideState({ open: false, candidateId: "", score: "", recommendation: "Maybe", reason: "" })}>Cancel</button>
              <button className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-2 font-semibold text-slate-900" onClick={handleOverrideSave}>Save Override</button>
            </div>
          </div>
        </div>
      )}

      <ResumePreviewModal 
        candidate={previewCandidate} 
        isOpen={!!previewCandidate} 
        onClose={() => setPreviewCandidate(null)} 
      />
    </div>
  );
}
