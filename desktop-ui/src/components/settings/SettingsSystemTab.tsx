import {
  CheckCircle2,
  ExternalLink,
  HardDrive,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { RuntimeInfo } from "../../bridge";
import { bridge } from "../../bridge";

export function SettingsSystemTab({
  runtime,
}: {
  runtime: RuntimeInfo | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        <HardDrive className="size-3.5" style={{ color: "var(--accent-color, #c52b68)" }} />
        System Diagnostics &amp; Runtime
      </div>

      {/* Runtime Readiness */}
      <section className="panel p-5">
        <div className="flex items-center gap-2 text-sm text-zinc-200">
          <HardDrive size={16} className="text-zinc-500" /> Runtime Readiness
        </div>
        <div className="mt-3.5 grid gap-2 md:grid-cols-2">
          {[
            ["Python Engine", runtime?.pythonReady ?? true, runtime?.pythonPath || "Python 3.12 (Server)"],
            ["FFmpeg Transcoder", runtime?.ffmpegReady ?? true, runtime?.ffmpegPath || "System FFmpeg (Web Worker)"],
            ["Hardware Engine", true, "Cloud Container CPU"],
            ["Storage Environment", true, "Ephemeral Web Scratch Storage"],
          ].map(([label, ready, detail]) => (
            <div key={String(label)} className="rounded-xl border border-white/[0.06] bg-black/10 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                {ready ? (
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                ) : (
                  <span className="size-3.5 rounded-full border border-amber-400/50" />
                )}
                {label}
              </div>
              <div className="mt-1 truncate font-mono text-[10px] text-zinc-500">{String(detail ?? "Checking...")}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cloud Runtime & Continuous Auto-Updates */}
      <section className="panel space-y-3 p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <CheckCircle2 className="size-4 text-emerald-400" /> Continuous Auto-Updates
        </div>
        <p className="text-xs leading-relaxed text-zinc-400">
          JaneConverter Web Lite is continuously maintained and automatically updated with the latest media extractors, yt-dlp signatures, and FFmpeg codecs. No manual updates or installer downloads are required.
        </p>
        <div className="grid gap-2 pt-1 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-black/10 px-3 py-2 text-xs">
            <div className="text-zinc-400 font-medium">Max Duration</div>
            <div className="mt-1 font-mono text-[11px] text-emerald-400">3 Hours (10,800s)</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/10 px-3 py-2 text-xs">
            <div className="text-zinc-400 font-medium">Max Resolution</div>
            <div className="mt-1 font-mono text-[11px] text-emerald-400">1080p (FHD)</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/10 px-3 py-2 text-xs">
            <div className="text-zinc-400 font-medium">Playlist Limit</div>
            <div className="mt-1 font-mono text-[11px] text-emerald-400">50 Tracks / Batch</div>
          </div>
        </div>
      </section>

      {/* Personal Sovereign Creator Toolbox */}
      <section className="panel space-y-3 border-l-2 border-l-[var(--accent-color,#c52b68)] p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-100">
          <Sparkles className="size-4 text-[var(--accent-color,#d75b88)]" /> Sovereign Creator Toolbox
        </div>
        <p className="text-xs leading-relaxed text-zinc-300">
          <strong className="text-white">JaneConverter is Jane Cerys&apos;s personal creator toolbox.</strong> Built by and for creators, it bridges high-fidelity public media conversion, loudness normalization, and fast batch downloads with zero corporate bloat.
        </p>
      </section>

      {/* Desktop Exclusive Capabilities Matrix */}
      <section className="panel space-y-3 p-5 border-amber-500/20 bg-amber-500/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-300">
            <Sparkles className="size-4 text-amber-400" /> Desktop Application Capabilities
          </div>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/20">
            Desktop Exclusive
          </span>
        </div>
        <p className="text-xs leading-relaxed text-zinc-400">
          JaneConverter Web Lite runs in a secure cloud container. The following capabilities require native operating system or hardware access and run exclusively in the <strong>JaneConverter Desktop</strong> application:
        </p>
        <div className="grid gap-2 sm:grid-cols-2 pt-1 text-xs">
          <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3 space-y-1">
            <div className="font-semibold text-zinc-200">Media Capturer Extension</div>
            <p className="text-[11px] text-zinc-400">Companion browser bridge for authenticated stream recording and DRM playback capture.</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3 space-y-1">
            <div className="font-semibold text-zinc-200">Hardware GPU Acceleration</div>
            <p className="text-[11px] text-zinc-400">Direct NVIDIA NVENC, AMD AMF, and Intel QSV encoding at up to 10x real-time speed.</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3 space-y-1">
            <div className="font-semibold text-zinc-200">FL Studio Project Downgrader</div>
            <p className="text-[11px] text-zinc-400">Direct binary inspection and version patching for FL Studio (.flp) projects.</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3 space-y-1">
            <div className="font-semibold text-zinc-200">Browser Session Cookies</div>
            <p className="text-[11px] text-zinc-400">Zero-extension session memory reading for age-gated (Error 152) and private media.</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/10 p-3 space-y-1">
            <div className="font-semibold text-zinc-200">Local Folder Batch Queuing</div>
            <p className="text-[11px] text-zinc-400">Drag massive folders directly into custom drive directories with zero web upload limits.</p>
          </div>
        </div>
        <div className="pt-1">
          <button
            type="button"
            onClick={() => void bridge.openUrl("https://github.com/jeongchaeul/JaneConverter/releases")}
            className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-200 hover:text-white"
          >
            <ExternalLink className="size-3" /> Get JaneConverter Desktop on GitHub
          </button>
        </div>
      </section>

      {/* Legal & Privacy Safeguards */}
      <section className="panel space-y-3 p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <ShieldCheck className="size-4 text-emerald-400" /> Legal &amp; Privacy Safeguards
        </div>
        <p className="text-xs leading-relaxed text-zinc-400">
          JaneConverter Web Lite accesses only publicly available media and user-uploaded files with zero account tracking, zero telemetry, and zero cookie persistence. Ephemeral conversion artifacts are automatically purged every 10 minutes.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => void bridge.openUrl("https://github.com/jeongchaeul/JaneConverter/blob/main/DISCLAIMER.md")}
            className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            <ExternalLink className="size-3" /> Legal Disclaimer &amp; Terms
          </button>
          <button
            type="button"
            onClick={() => void bridge.openUrl("https://github.com/jeongchaeul/JaneConverter/blob/main/SECURITY.md")}
            className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            <ExternalLink className="size-3" /> Security Policy
          </button>
        </div>
      </section>
    </div>
  );
}
