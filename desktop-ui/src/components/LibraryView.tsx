import { useState } from "react";
import {
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileAudio,
  FileQuestion,
  FileVideo,
  Filter,
  FolderOpen,
  HardDrive,
  ImageIcon,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ConversionHistoryItem } from "../bridge";
import { detectCategoryFromPath, formatBytes, formatElapsedMs } from "../options";

export function LibraryView({
  history,
  onClearHistory,
  onRemoveHistoryItem,
  onStatus,
  onNavigateToConverter,
}: {
  history: ConversionHistoryItem[];
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: string) => void;
  onStatus: (message: string) => void;
  onNavigateToConverter?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "Audio" | "Video" | "Image">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "succeeded" | "failed">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = history.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    const cat = detectCategoryFromPath(item.fileName || item.source);
    if (filterCategory !== "all" && cat !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.fileName.toLowerCase().includes(q);
      const matchSource = item.source.toLowerCase().includes(q);
      const matchPreset = (item.presetName || "").toLowerCase().includes(q);
      const matchFormat = (item.formatLabel || "").toLowerCase().includes(q);
      if (!matchName && !matchSource && !matchPreset && !matchFormat) return false;
    }
    return true;
  });

  function copySource(id: string, source: string) {
    if (!source) return;
    void navigator.clipboard.writeText(source);
    setCopiedId(id);
    onStatus("Source URL copied to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function renderMediaIcon(fileName: string) {
    const cat = detectCategoryFromPath(fileName);
    if (cat === "Audio") return <FileAudio className="size-4 text-pink-400" />;
    if (cat === "Video") return <FileVideo className="size-4 text-sky-400" />;
    if (cat === "Image") return <ImageIcon className="size-4 text-emerald-400" />;
    return <FileQuestion className="size-4 text-zinc-400" />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03]">
              <FolderOpen className="size-5" style={{ color: "var(--accent-color, #c52b68)" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Conversion Cache Library</h1>
              <p className="text-xs text-zinc-400">
                Browse and manage conversions saved in your browser&apos;s local cache.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-rose-200 border-rose-500/20 bg-rose-500/[0.04]"
              title="Clear all cached conversion entries from browser memory"
            >
              <Trash2 className="size-3.5" /> Clear Cache
            </button>
          )}
          {onNavigateToConverter && (
            <button
              type="button"
              onClick={onNavigateToConverter}
              className="action-button flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white"
            >
              Convert Media
            </button>
          )}
        </div>
      </div>

      {/* Info Card: Browser Cache Privacy */}
      <section className="panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-200">Local Browser Cache Storage</div>
            <div className="text-[11px] text-zinc-400">
              Your conversion history and timings are stored 100% locally on your device with zero server tracking.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <div>
            <span className="text-zinc-500">Cached Entries:</span>{" "}
            <span className="text-white font-semibold">{history.length}</span>
          </div>
          <div>
            <span className="text-zinc-500">Successful:</span>{" "}
            <span className="text-emerald-400 font-semibold">
              {history.filter((i) => i.status === "succeeded").length}
            </span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {(["all", "Audio", "Video", "Image"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
                filterCategory === cat
                  ? "border-[var(--accent-color,#c52b68)]/60 bg-[var(--accent-color,#c52b68)]/15 text-white"
                  : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
              }`}
            >
              {cat === "all" ? "All Media" : cat}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/10" />
          {(["all", "succeeded", "failed"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border ${
                filterStatus === st
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {st === "all" ? "All Statuses" : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search cached conversions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field h-8 w-full pl-8 pr-3 text-xs placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Conversion Items List */}
      {filtered.length === 0 ? (
        <div className="panel flex flex-col items-center justify-center p-12 text-center">
          <FolderOpen className="size-10 text-zinc-600 mb-3" />
          <div className="text-sm font-medium text-zinc-300">
            {history.length === 0 ? "No cached conversions yet" : "No matching conversions found"}
          </div>
          <p className="mt-1 max-w-sm text-xs text-zinc-500 leading-relaxed">
            {history.length === 0
              ? "When you convert public media or local files, your conversion logs, timings, and download references are saved locally in this library."
              : "Try adjusting your search query or media category filters above."}
          </p>
          {history.length === 0 && onNavigateToConverter && (
            <button
              type="button"
              onClick={onNavigateToConverter}
              className="action-button mt-4 px-4 py-2 text-xs text-white"
            >
              Start Converting
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="panel flex flex-wrap items-center justify-between gap-3 p-3.5 transition-colors hover:border-white/15"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-black/20">
                  {renderMediaIcon(item.fileName)}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-semibold text-zinc-100" title={item.fileName}>
                      {item.fileName || "Converted Media"}
                    </span>
                    {item.formatLabel && (
                      <span className="mono-label text-[10px] uppercase shrink-0">
                        {item.formatLabel}
                      </span>
                    )}
                    {item.presetName && (
                      <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-zinc-400 border border-white/[0.06] shrink-0">
                        {item.presetName}
                      </span>
                    )}
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-medium shrink-0 ${
                        item.status === "succeeded"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.status === "failed"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                    <span className="truncate max-w-[280px]" title={item.source}>
                      {item.source}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="size-3" />
                      {formatElapsedMs(item.elapsedMs)}
                    </span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.source && item.source.startsWith("http") && (
                  <button
                    type="button"
                    onClick={() => copySource(item.id, item.source)}
                    className="subtle-button flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white"
                    title="Copy source URL to clipboard"
                    aria-label="Copy source URL"
                  >
                    <Copy className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveHistoryItem(item.id)}
                  className="subtle-button flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:text-rose-400 hover:border-rose-500/30"
                  title="Remove this item from cache"
                  aria-label="Remove item"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
