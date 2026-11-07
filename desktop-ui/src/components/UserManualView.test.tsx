import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { UserManualView } from "./UserManualView";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("UserManualView", () => {
  it("renders the edition comparison matrix and desktop exclusive distinctions", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<UserManualView />);
    });

    expect(container.textContent).toContain("User Manual & Reference");
    expect(container.textContent).toContain("Web Lite vs. Desktop Edition Matrix");
    expect(container.textContent).toContain("JaneConverter Web Lite (This Edition)");
    expect(container.textContent).toContain("JaneConverter Desktop (Exclusive Features)");
    expect(container.textContent).toContain("Media Capturer Extension");
    expect(container.textContent).toContain("Story Capturer");
    expect(container.textContent).toContain("Studio DAW Utilities");

    await act(async () => { root.unmount(); });
    container.remove();
  });

  it("switches to the Story Capturer section and explains desktop requirement", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<UserManualView />);
    });

    const storyBtn = Array.from(container.querySelectorAll("button")).find((b) => b.textContent?.includes("Story Capturer"));
    expect(storyBtn).toBeDefined();

    await act(async () => {
      storyBtn?.click();
    });

    expect(container.textContent).toContain("The Story Capturer: Ephemeral Live Stories & Trays");
    expect(container.textContent).toContain("Desktop Application Only");
    expect(container.textContent).toContain("Why is Story Extraction Exclusive to Desktop?");

    await act(async () => { root.unmount(); });
    container.remove();
  });
});
