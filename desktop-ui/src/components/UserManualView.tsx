import { useState } from "react";
import {
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ExternalLink,
  Film,
  Globe,
  HelpCircle,
  Inbox,
  Laptop,
  Lock,
  Music,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { bridge } from "../bridge";

export type GuideSection =
  | "quickstart"
  | "audio"
  | "video"
  | "stories"
  | "flp"
  | "capturer"
  | "gpu"
  | "faq";

export const GUIDE_SECTIONS: Array<{
  id: GuideSection;
  label: string;
  icon: typeof Sparkles;
  desc: string;
  badge?: string;
  exclusive?: boolean;
}> = [
  { id: "quickstart", label: "Getting Started", icon: Sparkles, desc: "3 steps & platform support" },
  { id: "audio", label: "Music & Audio", icon: Radio, desc: "DSP, Spotify match & lossless" },
  { id: "video", label: "Video & Photos", icon: Film, desc: "Web 1080p, carousels & pins" },
  { id: "stories", label: "Story Capturer", icon: Camera, desc: "Live stories & trays", exclusive: true },
  { id: "flp", label: "FL Studio Downgrader", icon: Music, desc: "FLP project version patcher", exclusive: true },
  { id: "capturer", label: "Media Capturer", icon: Inbox, desc: "Browser extension recording", exclusive: true },
  { id: "gpu", label: "Hardware & GPU", icon: Cpu, desc: "Native NVENC/AMF encoding", exclusive: true },
  { id: "faq", label: "Presets & FAQ", icon: HelpCircle, desc: "Cheat sheet & troubleshooting" },
];

export function UserManualView() {
  const [guideSection, setGuideSection] = useState<GuideSection>("quickstart");

  return (
    <div className="space-y-6">
      {/* Top Banner: Edition Comparison Matrix */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03]">
            <BookOpen className="size-5" style={{ color: "var(--accent-color, #c52b68)" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">User Manual &amp; Reference</h1>
            <p className="text-xs text-zinc-400">
              Complete operating guide for JaneConverter Web Lite and JaneConverter Desktop.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void bridge.openUrl("https://github.com/jeongchaeul/JaneConverter/releases")}
          className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
        >
          <ExternalLink className="size-3" /> Download Desktop App on GitHub
        </button>
      </div>

      {/* Feature Matrix Callout Card */}
      <section className="panel p-4 space-y-3 border-white/10 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            <Sparkles className="size-4 text-[var(--accent-color,#c52b68)]" />
            Web Lite vs. Desktop Edition Matrix
          </div>
          <span className="mono-label text-[10px] text-zinc-400">Feature Availability</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 space-y-1.5">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" /> JaneConverter Web Lite (This Edition)
            </div>
            <ul className="text-[11px] text-zinc-300 space-y-1 leading-relaxed list-disc list-inside">
              <li>Public video &amp; audio extraction (YouTube, SoundCloud, TikTok, Reddit, X)</li>
              <li>Spotify &amp; Apple Music metadata matching to high-fidelity public audio</li>
              <li>Loudness normalization (EBU R128 -14 LUFS mastering) &amp; tag writing</li>
              <li>Public playlists up to 50 tracks (auto-zipped archive download)</li>
              <li>Instagram reels/posts and Pinterest high-res master photos</li>
              <li>Direct file uploads up to 500 MiB with browser cache library</li>
            </ul>
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-3 space-y-1.5">
            <div className="font-semibold text-rose-300 flex items-center gap-1.5">
              <Laptop className="size-3.5 text-rose-400" /> JaneConverter Desktop (Exclusive Features)
            </div>
            <ul className="text-[11px] text-zinc-300 space-y-1 leading-relaxed list-disc list-inside">
              <li><strong>Media Capturer Extension</strong>: Records authenticated browser playback &amp; DRM streams</li>
              <li><strong>Story Capturer</strong>: Ingests 24-hr live Instagram &amp; Facebook story trays</li>
              <li><strong>Studio DAW Utilities</strong>: FL Studio (.flp) bit-level project downgrader &amp; Ableton migrator</li>
              <li><strong>Zero-Extension Browser Cookies</strong>: Decrypts local sessions for age-gated/private videos</li>
              <li><strong>Native Hardware GPU Acceleration</strong>: NVIDIA NVENC, AMD AMF, Intel QSV 10x encoding</li>
              <li><strong>Uncapped 4K/8K &amp; Direct Folder Export</strong>: Direct local drive output with no time limits</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sub-page Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {GUIDE_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isSelected = guideSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setGuideSection(sec.id)}
              className={`flex flex-col items-start gap-1 rounded-xl p-3 text-left transition-all border ${
                isSelected
                  ? "border-[var(--accent-color,#c52b68)]/60 bg-[var(--accent-color,#c52b68)]/15 text-white shadow-sm ring-1 ring-[var(--accent-color,#c52b68)]/20"
                  : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/15 hover:bg-white/[0.05] hover:text-zinc-200"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <Icon
                  className="size-4"
                  style={{ color: isSelected ? "var(--accent-color, #c52b68)" : undefined }}
                />
                {sec.exclusive && (
                  <span className="rounded bg-rose-500/20 px-1 py-0.5 text-[8px] font-semibold text-rose-300 border border-rose-500/30">
                    Desktop
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-zinc-200 mt-1 line-clamp-1">{sec.label}</span>
              <span className="text-[10px] text-zinc-400 leading-tight line-clamp-1">{sec.desc}</span>
            </button>
          );
        })}
      </div>

      {/* PAGE 1: GETTING STARTED */}
      {guideSection === "quickstart" && (
        <div className="space-y-4">
          <section className="panel space-y-4 p-5" aria-labelledby="guide-quickstart-heading">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                <Sparkles size={16} style={{ color: "var(--accent-color, #c52b68)" }} />
                <span id="guide-quickstart-heading">Quick Start: Convert in 3 Steps</span>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Web &amp; Desktop Available
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              JaneConverter is ready to use immediately with zero mandatory accounts or software installation:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/[0.1] text-[11px] font-mono text-[var(--accent-color,#c52b68)]">1</span>
                  Input Media URL or File
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  Paste any public link (YouTube, SoundCloud, TikTok, Reddit, Pinterest, Twitter/X) or click <strong>Browse</strong> to upload a local audio, video, or image file up to 500 MiB.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/[0.1] text-[11px] font-mono text-[var(--accent-color,#c52b68)]">2</span>
                  Select Intent Preset
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  Choose a Quick Preset like <em>Universal Music</em> (-14 LUFS 320k MP3), <em>Lossless FLAC</em>, <em>Universal Video</em> (1080p MP4), or <em>Lossless Image</em> (PNG).
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/[0.1] text-[11px] font-mono text-[var(--accent-color,#c52b68)]">3</span>
                  Convert &amp; Download
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  Click <strong>Convert media</strong>. Real-time FFmpeg processing converts your file, and your browser automatically initiates the download when complete.
                </p>
              </div>
            </div>
          </section>

          {/* Supported Platforms */}
          <section className="panel space-y-4 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Globe size={16} style={{ color: "var(--accent-color, #c52b68)" }} />
              <span>Supported Public Sources &amp; Platforms</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1">
                <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <span className="text-red-400 font-bold">●</span> YouTube &amp; YouTube Music
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Extracts Full HD 1080p video or 320k MP3/Opus audio. Supports standard videos, Shorts (<code className="text-zinc-300">/shorts/</code>), and public playlists (zipped download).
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">●</span> Spotify &amp; Apple Music Matching
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Queries public catalog APIs for track metadata and matches studio masters across YouTube Music and SoundCloud with duration validation and ID3 cover art.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1">
                <div className="font-semibold text-pink-400 flex items-center gap-1.5">
                  <span className="text-pink-400 font-bold">●</span> Instagram (Reels &amp; Carousels)
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Downloads public posts, Reels, audio tracks, and multi-photo slide carousels at original CDN dimensions.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1">
                <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">●</span> TikTok, SoundCloud &amp; Reddit
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Watermark-free TikTok video and sound audio. SoundCloud sets and high-bitrate tracks. Reddit galleries and video feeds.
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={() => setGuideSection("audio")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              <span>Next: Music &amp; Audio</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PAGE 2: MUSIC & AUDIO */}
      {guideSection === "audio" && (
        <div className="space-y-4">
          <section className="panel space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                <Music size={16} style={{ color: "var(--accent-color, #c52b68)" }} />
                <span>Audio Engine &amp; Loudness Mastering</span>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Web &amp; Desktop Available
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              JaneConverter includes professional audio engineering DSP designed for creators and music producers:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1.5">
                <div className="font-semibold text-zinc-200">EBU R128 Loudness Leveling (-14 LUFS)</div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  The <em>Universal Music</em> preset runs two-pass EBU R128 loudnorm filtering to normalize dynamic range to -14 LUFS and -1.0 dB True Peak ceiling, ensuring consistent studio playback across car audio and headphones.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1.5">
                <div className="font-semibold text-zinc-200">Lossless Audio Archives (FLAC / WAV)</div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Extract pure bit-perfect PCM or lossless FLAC audio with zero generational compression loss. Ideal for sampling, DJ sets, and audio production in your favorite DAW.
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setGuideSection("quickstart")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              <ChevronLeft className="size-3.5" />
              <span>Back: Getting Started</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideSection("video")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              <span>Next: Video &amp; Photos</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PAGE 3: VIDEO & PHOTOS */}
      {guideSection === "video" && (
        <div className="space-y-4">
          <section className="panel space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                <Film size={16} style={{ color: "var(--accent-color, #c52b68)" }} />
                <span>Video &amp; Social Photos Transcoding</span>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Web &amp; Desktop Available
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              JaneConverter Web Lite processes Full HD video and high-resolution photo galleries:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1.5">
                <div className="font-semibold text-zinc-200">Web Lite Resolution &amp; Duration Quotas</div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Web Lite supports resolutions up to <strong>1080p (Full HD)</strong> and durations up to <strong>3 hours (10,800s)</strong>. For 4K/8K resolution and unlimited video length, use the JaneConverter Desktop application.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1.5">
                <div className="font-semibold text-zinc-200">Social Carousels &amp; Master Pins</div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Pinterest pins bypass thumbnail downsampling to fetch uncompressed CDN master images. Multi-slide Instagram posts (up to 10 slides) are packaged into high-quality archives.
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setGuideSection("audio")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              <ChevronLeft className="size-3.5" />
              <span>Back: Music &amp; Audio</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideSection("stories")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              <span>Next: Story Capturer</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PAGE 4: STORY CAPTURER (DESKTOP EXCLUSIVE) */}
      {guideSection === "stories" && (
        <div className="space-y-4">
          <section className="panel space-y-4 p-5 border-rose-500/30 bg-rose-950/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-300">
                <Camera size={16} className="text-rose-400" />
                <span>The Story Capturer: Ephemeral Live Stories &amp; Trays</span>
              </div>
              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">
                Desktop Application Only 🔒
              </span>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-black/40 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-200 font-semibold">
                <ShieldAlert className="size-4 text-rose-400" />
                Why is Story Extraction Exclusive to Desktop?
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Ephemeral 24-hour stories on Instagram and Facebook are private, authenticated user feeds. To extract them, JaneConverter must read active session tokens from your local desktop browser (Firefox, Vivaldi, Chrome, Edge) into volatile RAM.
              </p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Because JaneConverter Web Lite runs in a shared public cloud container with zero access to your personal devices or private accounts, story capture is architecturally restricted to the standalone <strong>JaneConverter Desktop</strong> application.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-zinc-200">Desktop Story Capabilities:</div>
              <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                <li>One-click extraction of complete live story trays (1 to 40+ cards in an active user feed)</li>
                <li>Full-resolution uncompressed master photos and high-bitrate HD video clips</li>
                <li>Direct support for permanent Instagram Highlights (<code className="text-zinc-300">/highlights/ID/</code>)</li>
                <li>Volatile RAM security: session cookies are decrypted in memory and immediately discarded</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => void bridge.openUrl("https://github.com/jeongchaeul/JaneConverter/releases")}
                className="action-button inline-flex items-center gap-2 px-3.5 py-2 text-xs text-white"
              >
                <ExternalLink className="size-3.5" /> Get JaneConverter Desktop for Story Capturing
              </button>
            </div>
          </section>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setGuideSection("video")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              <ChevronLeft className="size-3.5" />
              <span>Back: Video &amp; Photos</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideSection("flp")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              <span>Next: FL Studio Downgrader</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PAGE 5: FL STUDIO DOWNGRADER (DESKTOP EXCLUSIVE) */}
      {guideSection === "flp" && (
        <div className="space-y-4">
          <section className="panel space-y-4 p-5 border-rose-500/30 bg-rose-950/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-300">
                <Music size={16} className="text-rose-400" />
                <span>FL Studio (.flp) Project Downgrader &amp; DAW Suite</span>
              </div>
              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">
                Desktop Application Only 🔒
              </span>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-black/40 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-200 font-semibold">
                <ShieldAlert className="size-4 text-rose-400" />
                Why are Studio DAW Tools Exclusive to Desktop?
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                The FL Studio downgrader performs low-level binary manipulation, chunk alignment, and tempo/PPQ inspection on proprietary <code className="text-zinc-200">.flp</code> and <code className="text-zinc-200">.als</code> DAW project files.
              </p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                To guarantee zero project corruption and protect creative assets, DAW binary manipulation runs exclusively on your local workstation with native filesystem access in the <strong>JaneConverter Desktop</strong> application.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-zinc-200">Desktop DAW Features:</div>
              <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                <li>Downgrades newer FL Studio 21/24 projects to load in FL Studio 20.8.4, 21.0.3, or 21.2.3</li>
                <li>Inspects project BPM, PPQ resolution, channel count, and original FL build tags</li>
                <li>Creates safe copies (<code className="text-zinc-300">&lt;Project&gt;_downgraded.flp</code>) leaving originals 100% untouched</li>
                <li>Ableton Live project (<code className="text-zinc-300">.als</code>) migration utilities</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => void bridge.openUrl("https://github.com/jeongchaeul/JaneConverter/releases")}
                className="action-button inline-flex items-center gap-2 px-3.5 py-2 text-xs text-white"
              >
                <ExternalLink className="size-3.5" /> Download JaneConverter Desktop for FL Studio Downgrading
              </button>
            </div>
          </section>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setGuideSection("stories")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              <ChevronLeft className="size-3.5" />
              <span>Back: Story Capturer</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideSection("capturer")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              <span>Next: Media Capturer</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PAGE 6: MEDIA CAPTURER EXTENSION (DESKTOP EXCLUSIVE) */}
      {guideSection === "capturer" && (
        <div className="space-y-4">
          <section className="panel space-y-4 p-5 border-rose-500/30 bg-rose-950/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-300">
                <Inbox size={16} className="text-rose-400" />
                <span>Media Capturer &amp; Companion Browser Bridge</span>
              </div>
              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">
                Desktop Application Only 🔒
              </span>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-black/40 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-200 font-semibold">
                <ShieldAlert className="size-4 text-rose-400" />
                Why is the Media Capturer Exclusive to Desktop?
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                The Media Capturer is a companion browser extension for Chrome, Edge, and Firefox. It intercepts authenticated media streams, canvas frames, and proprietary web players directly as you watch them, sending the audio/video bits to a local native WebSocket bridge on your computer.
              </p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Because Web Lite is a hosted web server and cannot establish a local native bridge with your personal browser extensions, Media Capturer stream recording runs exclusively in the <strong>JaneConverter Desktop</strong> application.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-zinc-200">When to Use Media Capturer (Desktop):</div>
              <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                <li>Websites with complex anti-bot protection or non-standard custom players</li>
                <li>Protected audio streams where direct URLs are hidden or chunked dynamically</li>
                <li>Immediate one-click &quot;Send to JaneConverter&quot; stream capture from any active browser tab</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => void bridge.openUrl("https://github.com/jeongchaeul/JaneConverter/releases")}
                className="action-button inline-flex items-center gap-2 px-3.5 py-2 text-xs text-white"
              >
                <ExternalLink className="size-3.5" /> Download JaneConverter Desktop &amp; Extension
              </button>
            </div>
          </section>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setGuideSection("flp")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              <ChevronLeft className="size-3.5" />
              <span>Back: FL Studio Downgrader</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideSection("gpu")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              <span>Next: Hardware &amp; GPU</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PAGE 7: HARDWARE & GPU (DESKTOP EXCLUSIVE) */}
      {guideSection === "gpu" && (
        <div className="space-y-4">
          <section className="panel space-y-4 p-5 border-rose-500/30 bg-rose-950/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-300">
                <Cpu size={16} className="text-rose-400" />
                <span>Native Hardware GPU Acceleration &amp; Local Folders</span>
              </div>
              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">
                Desktop Application Only 🔒
              </span>
            </div>

            <div className="rounded-xl border border-rose-500/30 bg-black/40 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-200 font-semibold">
                <ShieldAlert className="size-4 text-rose-400" />
                Desktop Hardware vs. Cloud Transcoding
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                JaneConverter Desktop connects directly to your physical graphics card—including NVIDIA NVENC, AMD AMF, Intel QuickSync (QSV), and Apple Silicon VideoToolbox—for up to 10x real-time video transcoding speed.
              </p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                JaneConverter Web Lite runs on multi-core cloud container CPUs. It encodes reliably with high fidelity, but heavy hardware acceleration and local folder drag-and-drop batch ingestion are exclusive to the desktop application.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-zinc-200">Desktop Hardware Capabilities:</div>
              <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                <li>Automatic GPU device detection with CUDA VRAM monitoring</li>
                <li>Zero-freeze CPU fallback guarantee if your GPU encounters driver or memory constraints</li>
                <li>Batch folder queuing: drag entire music libraries or video folders directly into the app</li>
                <li>Direct output folder selection on local hard drives and SSDs (<code className="text-zinc-300">D:\Music\Converted</code>)</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => void bridge.openUrl("https://github.com/jeongchaeul/JaneConverter/releases")}
                className="action-button inline-flex items-center gap-2 px-3.5 py-2 text-xs text-white"
              >
                <ExternalLink className="size-3.5" /> Download JaneConverter Desktop for GPU Encoding
              </button>
            </div>
          </section>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setGuideSection("capturer")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              <ChevronLeft className="size-3.5" />
              <span>Back: Media Capturer</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideSection("faq")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              <span>Next: Presets &amp; FAQ</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PAGE 8: PRESETS & FAQ */}
      {guideSection === "faq" && (
        <div className="space-y-4">
          <section className="panel space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                <Zap size={16} style={{ color: "var(--accent-color, #c52b68)" }} />
                <span>Presets &amp; Format Cheat Sheet</span>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                Web &amp; Desktop Available
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-1">
                <div className="font-semibold text-zinc-200 flex items-center justify-between">
                  <span>Universal Music</span>
                  <span className="mono-label text-[10px]">-14 LUFS</span>
                </div>
                <p className="text-[11px] text-zinc-400">320kbps MP3 with EBU R128 loudness leveling, cover art, and clean track tags.</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-1">
                <div className="font-semibold text-zinc-200 flex items-center justify-between">
                  <span>Fast MP3</span>
                  <span className="mono-label text-[10px]">320k</span>
                </div>
                <p className="text-[11px] text-zinc-400">Fastest audio extraction without volume normalization. Great for samples and quick listens.</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-1">
                <div className="font-semibold text-zinc-200 flex items-center justify-between">
                  <span>Lossless Audio</span>
                  <span className="mono-label text-[10px]">FLAC / WAV</span>
                </div>
                <p className="text-[11px] text-zinc-400">Bit-perfect uncompressed audio for music production and master archives.</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-1">
                <div className="font-semibold text-zinc-200 flex items-center justify-between">
                  <span>Universal Video</span>
                  <span className="mono-label text-[10px]">1080p MP4</span>
                </div>
                <p className="text-[11px] text-zinc-400">Standard Full HD MP4 compatible with phones, TVs, Discord, and editors.</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-1">
                <div className="font-semibold text-zinc-200 flex items-center justify-between">
                  <span>Lossless Image</span>
                  <span className="mono-label text-[10px]">PNG</span>
                </div>
                <p className="text-[11px] text-zinc-400">Full uncompressed original resolution for social photos, artwork, and wallpapers.</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-1">
                <div className="font-semibold text-zinc-200 flex items-center justify-between">
                  <span>Compact Image</span>
                  <span className="mono-label text-[10px]">JPG / WebP</span>
                </div>
                <p className="text-[11px] text-zinc-400">High-efficiency compression for fast web sharing and minimal disk footprint.</p>
              </div>
            </div>
          </section>

          <section className="panel space-y-3 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <HelpCircle size={16} style={{ color: "var(--accent-color, #c52b68)" }} />
              <span>Frequently Asked Questions</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-1">
                <div className="font-medium text-zinc-200">Where do my converted files download?</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  In JaneConverter Web Lite, conversions trigger direct file downloads in your browser (typically your computer&apos;s <code className="text-zinc-300">Downloads</code> folder). You can also view recent conversions in the <strong>Library</strong> tab.
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-1">
                <div className="font-medium text-zinc-200">Why can&apos;t I download private or age-gated videos on Web Lite?</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Web Lite does not accept or store user credentials or cookies. For age-gated media (YouTube Error 152) or private friends-only posts, use the <strong>JaneConverter Desktop</strong> application, which authenticates via your local browser session.
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-1">
                <div className="font-medium text-zinc-200">How long do conversion files stay available?</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Server-side ephemeral conversion artifacts are automatically purged every 10 minutes to protect user privacy. Download your file promptly after conversion.
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setGuideSection("gpu")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              <ChevronLeft className="size-3.5" />
              <span>Back: Hardware &amp; GPU</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideSection("quickstart")}
              className="subtle-button flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              <span>Restart Guide ↺</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
