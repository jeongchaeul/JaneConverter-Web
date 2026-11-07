export type UnlistenFn = () => void;

export type Category = "Audio" | "Music" | "Video" | "Image" | "Miscellaneous";
export type EventKind = "started" | "log" | "progress" | "status" | "finished" | "partial" | "failed" | "cancelled";

export interface RuntimeInfo {
  mode: "tauri" | "browser";
  pythonReady: boolean;
  ffmpegReady: boolean;
  ffmpegPath: string;
  pythonPath: string;
  dataRoot: string;
  projectRoot: string;
  gpuAvailable: boolean;
  gpuLabel: string;
  packaged: boolean;
}

export interface HardwareSnapshot {
  cpuName: string;
  logicalCores: number;
  cpuSystemPct: number;
  cpuAppPct: number;
  ramSystemPct: number;
  ramUsedGb: number;
  ramTotalGb: number;
  ramAppMb: number;
  gpuSystemPct: number;
  gpuVramUsedMb: number;
  gpuVramTotalMb: number;
  gpuAppVramMb: number;
  gpuTempC: number | null;
  gpuName: string;
  telemetrySource: string;
}

export interface ConverterSettings {
  outputDir: string;
  fetchedDir: string;
  tempDir?: string;
  category: Category;
  format: string;
  bitrate: string;
  sampleRate: number;
  resolution: string;
  normalize: boolean;
  useGpu: boolean;
  saveCover: boolean;
  saveMetadata: boolean;
  allowPngFallback?: boolean;
  reconstructFrequencyLoss?: boolean;
  openInBrowser?: boolean;
  readBrowserCookies?: boolean;
  browserSession?: string;
  retries: number;
  startTime?: string;
  endTime?: string;
  allowStoryExtraction?: boolean;
  archivalFallback?: boolean;
  playlistMode?: "linear" | "concurrent";
  concurrency?: number;
  audioBitrate?: string;
}

export interface UpdateCheckResult {
  message: string;
  engine?: {
    has_update?: boolean;
    online?: boolean;
    current_version?: string;
    latest_version?: string;
    error?: string | null;
  };
  ffmpeg?: {
    has_update?: boolean;
    installed?: boolean;
    online?: boolean;
    current_version?: string;
    latest_version?: string;
    release_url?: string;
    error?: string | null;
  };
  repo?: {
    has_update?: boolean;
    current_commit?: string;
    latest_commit?: string;
    current_version?: string;
    latest_version?: string;
    installer_available?: boolean;
    release_url?: string;
    commits_behind?: number;
    commits?: string[];
    notes?: string;
    error?: string | null;
  };
}

export interface ConversionRequest extends Omit<ConverterSettings, "fetchedDir"> {
  source: string;
  playlistIndexes?: string;
  browserSession?: string;
  browserCapturePath?: string;
  facebookCaptureId?: string;
  socialCaptureId?: string;
}

export interface FacebookCaptureResult {
  captureId: string;
  title: string;
  photoCount: number;
  mediaKind: "photo" | "video";
}

export interface SocialCaptureResult {
  captureId: string;
  title: string;
  photoCount: number;
  mediaKind?: "photo" | "video";
}

export interface ConverterEvent {
  jobId: string;
  kind: EventKind;
  message: string;
  progress?: number;
  output?: string;
}

export interface PlaylistItem {
  index: number;
  title: string;
  artist: string;
  duration: string;
  url: string;
}

export interface PlaylistCatalog {
  title: string;
  items: PlaylistItem[];
}

export interface FlpProjectInfo {
  filePath: string;
  fileName: string;
  fileSize: number;
  version: string;
  majorVersion: number;
  build?: number;
  title: string;
  bpm: number;
  ppq: number;
  channels: number;
  registered: boolean;
  registrationName: string;
  eventsCount: number;
}

export interface FlpDowngradeResult {
  success: boolean;
  sourcePath: string;
  outputPath: string;
  sourceVersion: string;
  sourceMajor: number;
  sourceBuild?: number;
  targetVersion: string;
  targetBuild?: number;
  targetMajor?: number;
  targetProfile: string;
  targetLabel: string;
  recordsAdjusted: number;
  eventsCount: number;
  outputSizeBytes: number;
  backupPath?: string | null;
}

export interface InstalledFlStudio {
  name: string;
  fullVersion: string;
  version: string;
  build: number;
  executablePath: string;
}

export interface AccessStatus {
  active: boolean;
  link: string;
  browser: string;
  source?: string | null;
  bridgeConnected: boolean;
  captureCount?: number;
  capturedMediaKind?: "video" | "audio" | "image" | "stream" | "model";
}

export interface FetchedMedia {
  captureMethod?: string;
  sourceUrl?: string;
  capturedAt?: number;
  path: string;
  name: string;
  mediaKind: "video" | "audio" | "image" | "stream" | "model";
  mimeType: string;
  captureMode: "current" | "sequence" | "collect" | "network" | "saved";
  title: string;
  size: number;
}

export interface AccessDiagnostic {
  id: number;
  message: string;
}

export interface LibraryEntry {
  path: string;
  name: string;
  isDirectory: boolean;
  isPlaylist: boolean;
  mediaCount: number;
  totalBytes: number;
  extension: string;
  conversionMs?: number;
}

export interface MoveDirectoryResult {
  destination: string;
  cleanupWarning?: string | null;
}

export interface ConversionHistoryItem {
  id: string;
  timestamp: string;
  source: string;
  fileName: string;
  exportPath: string;
  presetName: string;
  formatLabel: string;
  qualityLabel: string;
  elapsedMs: number;
  totalBytes?: number;
  status: "succeeded" | "failed" | "partial";
  fallbackNote?: string | null;
  errorMessage?: string | null;
}

export interface JaneBridge {
  conversionHistory(legacy?: ConversionHistoryItem[], entry?: ConversionHistoryItem, remove?: string, clear?: boolean): Promise<{ history: ConversionHistoryItem[]; warning?: string | null }>;
  runtimeInfo(): Promise<RuntimeInfo>;
  hardwareSnapshot(): Promise<HardwareSnapshot>;
  settingsGet(): Promise<ConverterSettings>;
  settingsSave(settings: ConverterSettings): Promise<void>;
  setDataRoot(path: string): Promise<string>;
  chooseFile(): Promise<string | null>;
  chooseFiles(): Promise<string[]>;
  chooseFolder(): Promise<string | null>;
  openPath(path: string): Promise<void>;
  openFile(path: string): Promise<void>;
  openUrl(url: string): Promise<void>;
  startConversion(request: ConversionRequest): Promise<string>;
  requeueTrack(index: number, url?: string): Promise<boolean>;
  captureFacebookAlbum(source: string, captureId: string): Promise<FacebookCaptureResult>;
  cancelFacebookAlbum(captureId: string): Promise<void>;
  captureSocialPostPhotos(source: string, captureId: string): Promise<SocialCaptureResult>;
  cancelSocialPostPhotos(captureId: string): Promise<void>;
  pauseConversion(jobId?: string): Promise<void>;
  resumeConversion(jobId?: string): Promise<void>;
  cancelConversion(jobId: string): Promise<void>;
  loadPlaylist(source: string): Promise<PlaylistCatalog>;
  cancelPlaylist(): Promise<void>;
  subscribe(listener: (event: ConverterEvent) => void): Promise<UnlistenFn>;
  scanLibrary(path: string): Promise<LibraryEntry[]>;
  isConvertedLibraryPath(path: string): Promise<boolean>;
  recentConversions(path: string, limit: number): Promise<LibraryEntry[]>;
  clearConversionTimings(): Promise<void>;
  dragLibraryFile(path: string): Promise<void>;
  getThumbnail(root: string, path: string): Promise<string | null>;
  moveLibrary(source: string, destinationParent: string): Promise<MoveDirectoryResult>;
  moveFetchedFolder(source: string, destinationParent: string): Promise<MoveDirectoryResult>;
  deleteLibraryEntry(root: string, path: string): Promise<void>;
  createAccessLink(source: string): Promise<AccessStatus>;
  accessStatus(): Promise<AccessStatus>;
  fetchedMedia(): Promise<FetchedMedia[]>;
  accessDiagnostics(): Promise<AccessDiagnostic[]>;
  fetchedMediaThumbnail(path: string): Promise<string | null>;
  discardFetchedMedia(path: string): Promise<void>;
  clearAccessLink(): Promise<void>;
  relaunch(): Promise<void>;
  notifyAttention(): Promise<void>;
  checkUpdates(): Promise<UpdateCheckResult>;
  installUpdate(): Promise<void>;
  chooseFlpFile(): Promise<string | null>;
  chooseAlsFile(): Promise<string | null>;
  flpDetectInstalled(): Promise<InstalledFlStudio[]>;
  flpInspect(path: string): Promise<FlpProjectInfo>;
  flpDowngrade(source: string, targetVersion: string, targetBuild?: number, outputPath?: string, overwrite?: boolean): Promise<FlpDowngradeResult>;
  exportLogFile(content: string, defaultFilename?: string): Promise<string | null>;
  setTaskbarProgress(progress?: number, status?: "normal" | "paused" | "error" | "none" | "indeterminate"): Promise<void>;
  getChromiumCookiePolicy(): Promise<boolean>;
  setChromiumCookiePolicy(enabled: boolean): Promise<boolean>;
  pathSize(path: string): Promise<number>;
  windowMinimize(): Promise<void>;
  windowStartDragging(): Promise<void>;
  windowToggleMaximize(): Promise<boolean>;
  windowClose(): Promise<void>;
  windowIsMaximized(): Promise<boolean>;
}

const demoSettings: ConverterSettings = {
  outputDir: "Project-local/converted",
  fetchedDir: "Project-local/fetched",
  tempDir: "",
  category: "Music",
  format: "mp3",
  bitrate: "320k",
  sampleRate: 48000,
  resolution: "original",
  normalize: false,
  useGpu: false,
  saveCover: true,
  saveMetadata: true,
  allowPngFallback: false,
  openInBrowser: false,
  readBrowserCookies: true,
  retries: 2,
  startTime: "",
  endTime: "",
  allowStoryExtraction: false,
  archivalFallback: true,
  audioBitrate: "original",
};

const demoBridge: JaneBridge = {
  async conversionHistory(legacy = [], entry, remove, clear) {
    const saved: ConversionHistoryItem[] = JSON.parse(window.localStorage.getItem("janeconverter.preview-history") || "null") || legacy;
    const history = clear ? [] : entry ? [entry, ...saved.filter((item) => item.id !== entry.id)] : saved.filter((item) => item.id !== remove);
    window.localStorage.setItem("janeconverter.preview-history", JSON.stringify(history));
    return { history };
  },
  async runtimeInfo() {
    return { mode: "browser", pythonReady: false, ffmpegReady: false, ffmpegPath: "", pythonPath: "", dataRoot: "Project-local", projectRoot: "Project-local", gpuAvailable: false, gpuLabel: "Preview mode", packaged: false };
  },
  async hardwareSnapshot() {
    return { cpuName: "Preview mode", logicalCores: 0, cpuSystemPct: 0, cpuAppPct: 0, ramSystemPct: 0, ramUsedGb: 0, ramTotalGb: 0, ramAppMb: 0, gpuSystemPct: 0, gpuVramUsedMb: 0, gpuVramTotalMb: 0, gpuAppVramMb: 0, gpuTempC: null, gpuName: "Unavailable in browser preview", telemetrySource: "Unavailable" };
  },
  async settingsGet() { return { ...demoSettings }; },
  async settingsSave() {},
  async setDataRoot(path) { return path; },
  async chooseFile() { return null; },
  async chooseFiles() { return []; },
  async chooseFolder() { return null; },
  async openPath() {},
  async openFile() {},
  async openUrl(url: string) { if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer"); },
  async startConversion() { return "preview-job"; },
  async requeueTrack() { return true; },
  async captureFacebookAlbum() { throw new Error("Facebook album capture is available in the JaneConverter desktop app."); },
  async cancelFacebookAlbum() {},
  async captureSocialPostPhotos() { return { captureId: "", title: "", photoCount: 0 }; },
  async cancelSocialPostPhotos() {},
  async pauseConversion() {},
  async resumeConversion() {},
  async cancelConversion() {},
  async loadPlaylist() { return { title: "Preview playlist", items: [] }; },
  async cancelPlaylist() {},
  async subscribe() { return () => {}; },
  async scanLibrary() { return []; },
  async isConvertedLibraryPath() { return false; },
  async recentConversions() { return []; },
  async clearConversionTimings() {},
  async dragLibraryFile() { throw new Error("Drag files into other apps from the desktop build."); },
  async getThumbnail() { return null; },
  async moveLibrary(source) { return { destination: source }; },
  async moveFetchedFolder(source) { return { destination: source }; },
  async deleteLibraryEntry() {},
  async createAccessLink() { return { active: true, link: "Preview mode", browser: "", bridgeConnected: false }; },
  async accessStatus() { return { active: false, link: "", browser: "", bridgeConnected: false }; },
  async fetchedMedia() { return []; },
  async accessDiagnostics() { return []; },
  async fetchedMediaThumbnail() { return null; },
  async discardFetchedMedia() {},
  async clearAccessLink() {},
  async relaunch() {},
  async notifyAttention() {},
  async checkUpdates() { return { message: "Preview mode: update checks are available in the desktop build." }; },
  async installUpdate() {},
  async chooseFlpFile() { return null; },
  async chooseAlsFile() { return null; },
  async flpDetectInstalled() {
    return [
      {
        name: "FL Studio 21.2.3",
        fullVersion: "21.2.3.4004",
        version: "21.2.3",
        build: 4004,
        executablePath: "D:\\Programs\\FL Studio 21.2.3\\FL64.exe",
      },
    ];
  },
  async flpInspect(path: string) {
    return {
      filePath: path,
      fileName: "Preview_Project.flp",
      fileSize: 1048576,
      version: "26.1.4.5589",
      majorVersion: 26,
      build: 5589,
      title: "Preview Project",
      bpm: 140.0,
      ppq: 96,
      channels: 16,
      registered: true,
      registrationName: "Jane Cerys",
      eventsCount: 1250,
    };
  },
  async flpDowngrade(source: string, targetVersion: string, targetBuild?: number, outputPath?: string, overwrite?: boolean) {
    return {
      success: true,
      sourcePath: source,
      outputPath: overwrite ? source : (outputPath || source.replace(/\.flp$/i, `_downgraded_FL${targetVersion}.flp`)),
      sourceVersion: "26.1.4.5589",
      sourceMajor: 26,
      sourceBuild: 5589,
      targetVersion: targetVersion.includes(".") ? targetVersion : `${targetVersion}.0.0.${targetBuild ?? 0}`,
      targetBuild: targetBuild ?? 4004,
      targetMajor: parseInt(targetVersion, 10) || 21,
      targetProfile: targetVersion,
      targetLabel: `FL Studio ${targetVersion}`,
      recordsAdjusted: 16,
      eventsCount: 1250,
      outputSizeBytes: 1047500,
      backupPath: overwrite ? `${source}.bak` : null,
    };
  },
  async exportLogFile(content: string, defaultFilename = "janeconverter-logs.txt") {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return defaultFilename;
  },
  async setTaskbarProgress() {},
  async getChromiumCookiePolicy() { return false; },
  async setChromiumCookiePolicy(enabled: boolean) { return enabled; },
  async pathSize() { return 0; },
  async windowMinimize() {},
  async windowStartDragging() {},
  async windowToggleMaximize() { return false; },
  async windowClose() {},
  async windowIsMaximized() { return false; },
};

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname.includes("pages.dev")
    ? "https://janeconverter-web.onrender.com/api/v1"
    : "/api/v1");

const eventListeners = new Set<(event: ConverterEvent) => void>();
const activeEventSources = new Map<string, EventSource>();

export const webBridge: JaneBridge = {
  ...demoBridge,
  async runtimeInfo(): Promise<RuntimeInfo> {
    try {
      const res = await fetch(`${API_BASE}/runtime`);
      if (res.ok) {
        return {
          mode: "browser",
          pythonReady: true,
          ffmpegReady: true,
          ffmpegPath: "System FFmpeg (Web Worker)",
          pythonPath: "Python 3.12 (Server)",
          dataRoot: "Web Storage",
          projectRoot: "Web Server",
          gpuAvailable: false,
          gpuLabel: "Cloud CPU (Web Lite)",
          packaged: true,
        };
      }
    } catch {
      // Fallback
    }
    return demoBridge.runtimeInfo();
  },
  async loadPlaylist(source: string): Promise<PlaylistCatalog> {
    const res = await fetch(`${API_BASE}/playlist/inspect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: source }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to inspect playlist" }));
      throw new Error(err.detail || "Failed to inspect playlist");
    }
    const data = await res.json();
    return {
      title: data.playlist_title,
      items: (data.entries || []).map((e: any) => ({
        index: e.index,
        title: e.title,
        artist: e.artist,
        duration: e.duration_str,
        url: e.url,
        thumbnail: e.thumbnail,
      })),
    };
  },
  async startConversion(request: ConversionRequest): Promise<string> {
    const isPlaylist = request.source.includes("list=") || request.source.includes("/album/") || request.source.includes("/playlist/") || request.source.includes("/sets/");
    let cleanSource = request.source.trim();
    if (
      !cleanSource.startsWith("upload:") &&
      !cleanSource.startsWith("http://") &&
      !cleanSource.startsWith("https://") &&
      (cleanSource.includes(".") || cleanSource.includes("/"))
    ) {
      cleanSource = `https://${cleanSource}`;
    }
    const payload = {
      source_url: cleanSource.startsWith("http://") || cleanSource.startsWith("https://") ? cleanSource : null,
      upload_id: cleanSource.startsWith("upload:") ? cleanSource.slice(7) : null,
      target_format: request.format || "source",
      category: request.category || "Music",
      audio_bitrate: request.bitrate || request.audioBitrate || "320k",
      resolution: request.resolution || "1080p",
      normalize_audio: !!request.normalize,
      reconstruct_frequency_loss: !!request.reconstructFrequencyLoss,
      start_time: request.startTime || null,
      end_time: request.endTime || null,
      is_playlist: isPlaylist,
    };

    let res: Response | null = null;
    let lastErr: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        res = await fetch(`${API_BASE}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) break;
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          // Cloud server wake-up / redeploying in progress: retry after backoff
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        break;
      } catch (err) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (!res || !res.ok) {
      let errDetail = "";
      try {
        const errJson = await res?.json();
        if (typeof errJson?.detail === "string") {
          errDetail = errJson.detail;
        } else if (Array.isArray(errJson?.detail)) {
          errDetail = errJson.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
        }
      } catch {
        // non-JSON
      }
      throw new Error(errDetail || (lastErr instanceof Error ? lastErr.message : "Failed to create conversion job. The server may be waking up, please try again."));
    }

    const job = await res.json();
    const jobId = job.id;

    function triggerDownload(url: string, filename?: string) {
      if (typeof window === "undefined") return;
      const baseOrigin = API_BASE.startsWith("http") ? API_BASE.replace(/\/api\/v1\/?$/, "") : window.location.origin;
      const fullUrl = url.startsWith("http") ? url : `${baseOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
      try {
        const a = document.createElement("a");
        a.href = fullUrl;
        a.download = filename || "converted_media";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
        }, 2000);
      } catch {
        window.location.assign(fullUrl);
      }
    }

    let isCompleted = false;

    // Backup polling loop every 1.5s in case SSE cuts out or proxy disconnects
    const pollTimer = setInterval(async () => {
      if (isCompleted) {
        clearInterval(pollTimer);
        return;
      }
      try {
        const checkRes = await fetch(`${API_BASE}/jobs/${jobId}`);
        if (!checkRes.ok) return;
        const jobData = await checkRes.json();
        const statusMap: Record<string, EventKind> = {
          queued: "status",
          downloading: "progress",
          converting: "progress",
          completed: "finished",
          failed: "failed",
          cancelled: "cancelled",
        };
        const kind: EventKind = statusMap[jobData.status] || "status";
        if (jobData.thumbnail) {
          eventListeners.forEach((fn) =>
            fn({
              jobId,
              kind: "status",
              progress: typeof jobData.progress === "number" ? Math.max(0, Math.min(1, jobData.progress)) : 0,
              message: `[*] Media Thumbnail URL: ${jobData.thumbnail}`,
            })
          );
        }
        if (jobData.title) {
          eventListeners.forEach((fn) =>
            fn({
              jobId,
              kind: "status",
              progress: typeof jobData.progress === "number" ? Math.max(0, Math.min(1, jobData.progress)) : 0,
              message: `[*] Conversion: ${jobData.title}`,
            })
          );
        }

        const evt: ConverterEvent = {
          jobId,
          kind,
          progress: typeof jobData.progress === "number" ? Math.max(0, Math.min(1, jobData.progress)) : 0,
          message: jobData.step,
          output: jobData.filename || jobData.title || jobData.download_url || undefined,
        };
        eventListeners.forEach((fn) => fn(evt));

        if (jobData.status === "completed" || jobData.status === "failed" || jobData.status === "cancelled") {
          isCompleted = true;
          clearInterval(pollTimer);
          const s = activeEventSources.get(jobId);
          if (s) {
            s.close();
            activeEventSources.delete(jobId);
          }
          if (jobData.status === "completed" && jobData.download_url) {
            triggerDownload(jobData.download_url, jobData.filename);
          }
        }
      } catch {
        // network poll ignore
      }
    }, 1500);

    const sse = new EventSource(`${API_BASE}/jobs/${jobId}/events`);
    activeEventSources.set(jobId, sse);

    sse.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        const statusMap: Record<string, EventKind> = {
          queued: "status",
          downloading: "progress",
          converting: "progress",
          completed: "finished",
          failed: "failed",
          cancelled: "cancelled",
        };
        const kind: EventKind = statusMap[data.status] || "status";
        if (data.thumbnail) {
          eventListeners.forEach((fn) =>
            fn({
              jobId,
              kind: "status",
              progress: typeof data.progress === "number" ? Math.max(0, Math.min(1, data.progress)) : 0,
              message: `[*] Media Thumbnail URL: ${data.thumbnail}`,
            })
          );
        }
        if (data.title) {
          eventListeners.forEach((fn) =>
            fn({
              jobId,
              kind: "status",
              progress: typeof data.progress === "number" ? Math.max(0, Math.min(1, data.progress)) : 0,
              message: `[*] Conversion: ${data.title}`,
            })
          );
        }

        const evt: ConverterEvent = {
          jobId,
          kind,
          progress: typeof data.progress === "number" ? Math.max(0, Math.min(1, data.progress)) : 0,
          message: data.step,
          output: data.filename || data.title || data.download_url || undefined,
        };

        eventListeners.forEach((fn) => fn(evt));

        if (data.status === "completed") {
          isCompleted = true;
          clearInterval(pollTimer);
          sse.close();
          activeEventSources.delete(jobId);
          if (data.download_url) {
            triggerDownload(data.download_url, data.filename);
          }
        } else if (data.status === "failed" || data.status === "cancelled") {
          isCompleted = true;
          clearInterval(pollTimer);
          sse.close();
          activeEventSources.delete(jobId);
        }
      } catch (e) {
        console.error("SSE parse error", e);
      }
    };

    sse.onerror = () => {
      // Don't kill conversion tracking if SSE disconnects; let backup pollTimer complete it
      sse.close();
      activeEventSources.delete(jobId);
    };

    return jobId;
  },
  async cancelConversion(jobId: string): Promise<void> {
    const sse = activeEventSources.get(jobId);
    if (sse) {
      sse.close();
      activeEventSources.delete(jobId);
    }
    // Emit immediate cancelled event locally so UI resets instantly without hanging on 'Aborting conversion...'
    const evt: ConverterEvent = {
      jobId,
      kind: "cancelled",
      message: "Conversion cancelled by user.",
    };
    eventListeners.forEach((fn) => fn(evt));

    await fetch(`${API_BASE}/jobs/${jobId}`, { method: "DELETE" }).catch(() => {});
  },
  async subscribe(listener: (event: ConverterEvent) => void): Promise<UnlistenFn> {
    eventListeners.add(listener);
    return () => {
      eventListeners.delete(listener);
    };
  },
  async chooseFile(): Promise<string | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = async () => {
        if (!input.files || input.files.length === 0) {
          resolve(null);
          return;
        }
        const file = input.files[0];
        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await fetch(`${API_BASE}/uploads`, {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            resolve(`upload:${data.upload_id}`);
            return;
          }
        } catch (e) {
          console.error("Upload error", e);
        }
        resolve(null);
      };
      input.click();
    });
  },
  async chooseFiles(): Promise<string[]> {
    const f = await webBridge.chooseFile();
    return f ? [f] : [];
  },
};

export const bridge: JaneBridge = webBridge;
