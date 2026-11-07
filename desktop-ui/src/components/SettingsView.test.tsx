import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsView } from "./SettingsView";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const updateCheck = vi.hoisted(() => ({ run: vi.fn() }));
const installUpdate = vi.hoisted(() => ({ run: vi.fn() }));
const relaunch = vi.hoisted(() => ({ run: vi.fn() }));
const chooseFolder = vi.hoisted(() => ({ run: vi.fn() }));
const setDataRoot = vi.hoisted(() => ({ run: vi.fn() }));
const sourceRuntime = { mode: "tauri", pythonReady: true, ffmpegReady: true, ffmpegPath: "/usr/bin/ffmpeg", pythonPath: ".venv/bin/python3", dataRoot: ".", projectRoot: ".", gpuAvailable: false, gpuLabel: "CPU mode", packaged: false } as const;
vi.mock("../bridge", () => ({
  bridge: {
    checkUpdates: updateCheck.run,
    installUpdate: installUpdate.run,
    relaunch: relaunch.run,
    chooseFolder: chooseFolder.run,
    setDataRoot: setDataRoot.run,
    getChromiumCookiePolicy: vi.fn().mockResolvedValue(false),
    setChromiumCookiePolicy: vi.fn().mockImplementation(async (v) => v),
  },
}));

describe("Settings updates", () => {
  beforeEach(() => {
    updateCheck.run.mockReset();
    installUpdate.run.mockReset();
    updateCheck.run.mockResolvedValue({ message: "Update check complete. JaneConverter is up to date." });
    relaunch.run.mockResolvedValue(undefined);
    chooseFolder.run.mockReset();
    setDataRoot.run.mockReset();
  });

  it("renders continuous auto-updates card and Web Lite quotas", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<SettingsView runtime={sourceRuntime} onStatus={vi.fn()} initialTab="system" />);
    });

    expect(container.textContent).toContain("Continuous Auto-Updates");
    expect(container.textContent).toContain("Max Duration");
    expect(container.textContent).toContain("3 Hours (10,800s)");
    expect(container.textContent).toContain("1080p (FHD)");
    expect(container.textContent).toContain("50 Tracks / Batch");

    await act(async () => { root.unmount(); });
    container.remove();
  });

  it("renders the desktop exclusive capabilities section in system settings", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => { root.render(<SettingsView runtime={sourceRuntime} onStatus={vi.fn()} initialTab="system" />); });

    expect(container.textContent).toContain("Desktop Application Capabilities");
    expect(container.textContent).toContain("Hardware GPU Acceleration");
    expect(container.textContent).toContain("FL Studio Project Downgrader");
    expect(container.textContent).toContain("Browser Session Cookies");

    await act(async () => { root.unmount(); });
    container.remove();
  });







  it("triggers accent and background color changes from pickers and reset button", async () => {
    const onAccentColorChange = vi.fn();
    const onBgColorChange = vi.fn();
    const onResetColors = vi.fn();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <SettingsView
          runtime={sourceRuntime}
          accentColor="#c52b68"
          bgColor="#02000a"
          onAccentColorChange={onAccentColorChange}
          onBgColorChange={onBgColorChange}
          onResetColors={onResetColors}
          onStatus={vi.fn()}
          initialTab="theme"
        />,
      );
    });

    const setNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

    const accentPicker = container.querySelector<HTMLInputElement>('input[aria-label="Accent color picker"]');
    expect(accentPicker).toBeDefined();
    await act(async () => {
      if (accentPicker) {
        setNativeValue?.call(accentPicker, "#06b6d4");
        accentPicker.dispatchEvent(new Event("change", { bubbles: true }));
      }
      await Promise.resolve();
    });
    expect(onAccentColorChange).toHaveBeenCalledWith("#06b6d4");

    const bgPicker = container.querySelector<HTMLInputElement>('input[aria-label="Theme background color picker"]');
    expect(bgPicker).toBeDefined();
    await act(async () => {
      if (bgPicker) {
        setNativeValue?.call(bgPicker, "#09090b");
        bgPicker.dispatchEvent(new Event("change", { bubbles: true }));
      }
      await Promise.resolve();
    });
    expect(onBgColorChange).toHaveBeenCalledWith("#09090b");

    // Also test swatch click
    const cyanSwatch = Array.from(container.querySelectorAll("button")).find((button) => button.getAttribute("title")?.includes("Cyber Cyan"));
    expect(cyanSwatch).toBeDefined();
    await act(async () => {
      cyanSwatch?.click();
      await Promise.resolve();
    });
    expect(onAccentColorChange).toHaveBeenCalledWith("#06b6d4");

    const saveButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Save Appearance"));
    expect(saveButton).toBeDefined();

    const resetButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("Reset Appearance"));
    expect(resetButton).toBeDefined();
    await act(async () => {
      resetButton?.click();
      await Promise.resolve();
    });
    expect(onResetColors).toHaveBeenCalled();

    await act(async () => { root.unmount(); });
    container.remove();
  });




  it('renders Appearance and System tabs and verifies User Manual is moved to sidebar', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<SettingsView runtime={sourceRuntime} onStatus={vi.fn()} initialTab="system" />);
      await Promise.resolve();
    });

    expect(container.textContent).toContain('System Diagnostics & Runtime');
    expect(container.textContent).toContain('Runtime Readiness');
    expect(container.textContent).toContain('Continuous Auto-Updates');
    expect(container.textContent).toContain('Appearance');
    expect(container.textContent).not.toContain('User Manual & Quick Reference');

    await act(async () => { root.unmount(); });
    container.remove();
  });

  it('manages custom wallpaper, blur slider, color mask, and mask opacity in appearance settings', async () => {
    const onBgModeChange = vi.fn();
    const onWallpaperChange = vi.fn();
    const onWallpaperBlurChange = vi.fn();
    const onWallpaperMaskColorChange = vi.fn();
    const onWallpaperMaskOpacityChange = vi.fn();
    const onSaveAppearance = vi.fn();
    const onResetAppearance = vi.fn();
    const onStatus = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <SettingsView
          runtime={sourceRuntime}
          accentColor="#c52b68"
          bgColor="#02000a"
          bgMode="wallpaper"
          wallpaper="data:image/svg+xml;utf8,<svg></svg>"
          wallpaperBlur={35}
          wallpaperMaskColor="#12071a"
          wallpaperMaskOpacity={65}
          onBgModeChange={onBgModeChange}
          onWallpaperChange={onWallpaperChange}
          onWallpaperBlurChange={onWallpaperBlurChange}
          onWallpaperMaskColorChange={onWallpaperMaskColorChange}
          onWallpaperMaskOpacityChange={onWallpaperMaskOpacityChange}
          onSaveAppearance={onSaveAppearance}
          onResetAppearance={onResetAppearance}
          onStatus={onStatus}
          initialTab="theme"
        />,
      );
      await Promise.resolve();
    });

    // 1. Verify Wallpaper mode is active and elements exist
    expect(container.textContent).toContain('Custom Wallpaper Image');
    expect(container.textContent).toContain('Blur Effect');
    expect(container.textContent).toContain('35%');
    expect(container.textContent).toContain('Color Mask Overlay');
    expect(container.textContent).toContain('Mask Opacity');
    expect(container.textContent).toContain('65%');

    // 2. Test switching to Solid Colors
    const solidButton = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Solid Colors'));
    expect(solidButton).toBeDefined();
    await act(async () => {
      solidButton?.click();
      await Promise.resolve();
    });
    expect(onBgModeChange).toHaveBeenCalledWith('color');

    // 3. Test Blur Slider
    const blurSlider = container.querySelector<HTMLInputElement>('input[aria-label="Wallpaper blur slider"]');
    expect(blurSlider).toBeDefined();
    const setNativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
      if (blurSlider) {
        setNativeValue?.call(blurSlider, '80');
        blurSlider.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await Promise.resolve();
    });
    expect(onWallpaperBlurChange).toHaveBeenCalledWith(80);

    // 4. Test Mask Opacity Slider
    const opacitySlider = container.querySelector<HTMLInputElement>('input[aria-label="Color mask opacity slider"]');
    expect(opacitySlider).toBeDefined();
    await act(async () => {
      if (opacitySlider) {
        setNativeValue?.call(opacitySlider, '40');
        opacitySlider.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await Promise.resolve();
    });
    expect(onWallpaperMaskOpacityChange).toHaveBeenCalledWith(40);

    // 5. Test Color Mask Picker
    const maskPicker = container.querySelector<HTMLInputElement>('input[aria-label="Color mask picker"]');
    expect(maskPicker).toBeDefined();
    await act(async () => {
      if (maskPicker) {
        setNativeValue?.call(maskPicker, '#070b19');
        maskPicker.dispatchEvent(new Event('change', { bubbles: true }));
      }
      await Promise.resolve();
    });
    expect(onWallpaperMaskColorChange).toHaveBeenCalledWith('#070b19');

    // 6. Test Preset Wallpaper selection
    const presetBtn = Array.from(container.querySelectorAll('button')).find((b) => b.getAttribute('title')?.includes('Deep Nebula'));
    expect(presetBtn).toBeDefined();
    await act(async () => {
      presetBtn?.click();
      await Promise.resolve();
    });
    expect(onWallpaperChange).toHaveBeenCalled();
    expect(onStatus).toHaveBeenCalledWith(expect.stringContaining('Applied preset wallpaper: Deep Nebula'));

    // 7. Test Save Appearance button
    const saveBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Save Appearance'));
    expect(saveBtn).toBeDefined();
    await act(async () => {
      saveBtn?.click();
      await Promise.resolve();
    });
    expect(onSaveAppearance).toHaveBeenCalled();
    expect(onStatus).toHaveBeenCalledWith(expect.stringContaining('Appearance settings saved'));

    // 8. Test Reset Appearance button
    const resetBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Reset Appearance'));
    expect(resetBtn).toBeDefined();
    await act(async () => {
      resetBtn?.click();
      await Promise.resolve();
    });
    expect(onResetAppearance).toHaveBeenCalled();

    // 9. Verify helper text is placed directly under accent swatches
    expect(container.textContent).toContain('Accent highlight applies to progress bars');

    await act(async () => { root.unmount(); });
    container.remove();
  });
});
