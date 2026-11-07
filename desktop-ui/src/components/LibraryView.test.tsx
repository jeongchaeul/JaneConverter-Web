import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { LibraryView } from "./LibraryView";
import type { ConversionHistoryItem } from "../bridge";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const sampleHistory: ConversionHistoryItem[] = [
  {
    id: "hist-1",
    timestamp: "2026-11-07T12:00:00Z",
    source: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    fileName: "Rick Astley - Never Gonna Give You Up.mp3",
    exportPath: "Rick Astley - Never Gonna Give You Up.mp3",
    presetName: "Universal Music",
    formatLabel: "MP3",
    qualityLabel: "320k",
    elapsedMs: 2450,
    status: "succeeded",
  },
  {
    id: "hist-2",
    timestamp: "2026-11-07T12:05:00Z",
    source: "https://twitter.com/user/status/123",
    fileName: "clip.mp4",
    exportPath: "clip.mp4",
    presetName: "Universal Video",
    formatLabel: "MP4",
    qualityLabel: "1080p",
    elapsedMs: 5120,
    status: "succeeded",
  },
];

describe("LibraryView", () => {
  it("renders conversion cache items and summary metrics", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <LibraryView
          history={sampleHistory}
          onClearHistory={vi.fn()}
          onRemoveHistoryItem={vi.fn()}
          onStatus={vi.fn()}
        />
      );
    });

    expect(container.textContent).toContain("Conversion Cache Library");
    expect(container.textContent).toContain("Rick Astley - Never Gonna Give You Up.mp3");
    expect(container.textContent).toContain("clip.mp4");
    expect(container.textContent).toContain("Cached Entries: 2");

    await act(async () => { root.unmount(); });
    container.remove();
  });

  it("filters items by search input and category", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <LibraryView
          history={sampleHistory}
          onClearHistory={vi.fn()}
          onRemoveHistoryItem={vi.fn()}
          onStatus={vi.fn()}
        />
      );
    });

    // Click Video filter pill
    const videoBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent?.trim() === "Video");
    expect(videoBtn).toBeDefined();

    await act(async () => {
      videoBtn?.click();
    });

    expect(container.textContent).toContain("clip.mp4");
    expect(container.textContent).not.toContain("Rick Astley - Never Gonna Give You Up.mp3");

    await act(async () => { root.unmount(); });
    container.remove();
  });
});
