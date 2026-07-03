import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  Sun,
  Moon,
  Image as ImageIcon,
  X,
  ChevronLeft,
  Check,
  ArrowRight,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import "../styles/main.css";

// -----------------------------------------------------------------------------
// 1. CONTEXT & HOOKS (Unchanged)
// -----------------------------------------------------------------------------

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  allWallpapers: [],
  currentAsset: null,
  handleThemeChange: () => {},
  handleWallpaperSelect: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// -----------------------------------------------------------------------------
// 2. CONSTANTS & UTILS (Unchanged)
// -----------------------------------------------------------------------------

const getBaseUrl = () => {
  try {
    const url = import.meta?.env?.BASE_URL ?? "/";
    return url.endsWith("/") ? url : `${url}/`;
  } catch (e) {
    return "/";
  }
};

const baseUrl = getBaseUrl();
const backgroundImageBasePath = "assets/images/backgrounds";
const backgroundVideoBasePath = "assets/videos/backgrounds";
const videoExtensions = ["mp4", "webm", "ogv", "ogg"];
const storageKey = "portfolio:lastBackground";
const themeStorageKey = "portfolio:manualTheme"; // Changed to ignore old wallpaper-forced theme storage

const withBase = (path) => {
  if (!path) return baseUrl;
  return `${baseUrl}${path.replace(/^\/+/, "")}`;
};

const sanitizePathValue = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const sanitizeBasePath = (value) => {
  const sanitized = sanitizePathValue(value);
  return sanitized ? sanitized.replace(/\/+$/, "") : "";
};

const getThemeFromFilename = (filename) => {
  const lower = filename.toLowerCase();
  if (lower.includes("-night") || lower.includes("-dark")) return "dark";
  if (lower.includes("-day") || lower.includes("-light")) return "light";
  return "neutral";
};

const createAssetConfig = (entry) => {
  if (!entry) return null;
  if (typeof entry === "string") {
    const sanitizedSrc = sanitizePathValue(entry);
    if (!sanitizedSrc) return null;
    const extension = sanitizedSrc.includes(".")
      ? sanitizedSrc.split(".").pop()
      : "";
    const type =
      extension && videoExtensions.includes(extension.toLowerCase())
        ? "video"
        : "image";
    const basePath =
      type === "video" ? backgroundVideoBasePath : backgroundImageBasePath;
    return {
      src: sanitizedSrc,
      type,
      srcBasePath: basePath,
      poster: null,
      posterBasePath: backgroundImageBasePath,
    };
  }
  if (typeof entry === "object") {
    const videoSrc = sanitizePathValue(entry.video);
    const imageSrc = sanitizePathValue(entry.image);
    const posterSrc = sanitizePathValue(entry.poster);
    const rawSrc = sanitizePathValue(entry.src);
    const declaredType = sanitizePathValue(entry.type).toLowerCase();

    if (videoSrc || declaredType === "video") {
      const resolvedVideoSrc = videoSrc || rawSrc;
      if (!resolvedVideoSrc) return null;
      const basePath =
        sanitizeBasePath(entry.videoBasePath) ||
        sanitizeBasePath(entry.basePath) ||
        backgroundVideoBasePath;
      const posterCandidate = posterSrc || imageSrc;
      const posterBase =
        sanitizeBasePath(entry.imageBasePath) ||
        sanitizeBasePath(entry.posterBasePath) ||
        backgroundImageBasePath;
      return {
        src: resolvedVideoSrc,
        type: "video",
        srcBasePath: basePath,
        poster: posterCandidate || null,
        posterBasePath: posterBase || backgroundImageBasePath,
      };
    }
    const resolvedImageSrc = rawSrc || imageSrc || posterSrc;
    if (!resolvedImageSrc) return null;
    const imageBase =
      sanitizeBasePath(entry.imageBasePath) ||
      sanitizeBasePath(entry.basePath) ||
      backgroundImageBasePath;
    return {
      src: resolvedImageSrc,
      type: "image",
      srcBasePath: imageBase || backgroundImageBasePath,
      poster: null,
      posterBasePath: backgroundImageBasePath,
    };
  }
  return null;
};

const normalizeBackgroundAssets = (assets) => {
  if (!Array.isArray(assets)) return [];
  return assets
    .map((asset) => createAssetConfig(asset))
    .filter((asset) => asset !== null);
};

const resolveAssetUrl = (src, type, basePath) => {
  if (!src) return "";
  if (/^(?:https?:)?\/\//i.test(src)) return src;
  const normalizedSrc = src.replace(/^\/+/, "");
  if (normalizedSrc.startsWith("assets/")) return withBase(normalizedSrc);
  const normalizedBase = (
    basePath && basePath.length
      ? basePath
      : type === "video"
        ? backgroundVideoBasePath
        : backgroundImageBasePath
  ).replace(/\/+$/, "");
  return withBase(`${normalizedBase}/${normalizedSrc}`);
};

const serializeBackgroundConfig = (asset) => {
  if (!asset) return "";
  let payload;
  if (asset.type === "video") {
    payload = {
      video: asset.src,
      image: asset.poster || null,
      videoBasePath: asset.srcBasePath,
      imageBasePath: asset.posterBasePath,
    };
  } else {
    payload = { image: asset.src, imageBasePath: asset.srcBasePath };
  }
  return JSON.stringify(payload);
};

// -----------------------------------------------------------------------------
// 3. THEME CONTROLS COMPONENT (Unchanged)
// -----------------------------------------------------------------------------

export const ThemeControls = ({
  theme,
  onThemeChange,
  wallpapers,
  currentWallpaper,
  onWallpaperSelect,
}) => {
  const [showWallpaperSelector, setShowWallpaperSelector] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showWallpaperSelector &&
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowWallpaperSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showWallpaperSelector]);

  return (
    <>
      {/* Control Buttons Container */}
      <div className={`fixed top-5 left-5 z-[999] flex gap-2.5 `}>
        <button
          onClick={onThemeChange}
          className={`w-16 h-16 rounded-xl border-none backdrop-blur-sm cursor-pointer flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg ${
            theme === "dark"
              ? "bg-black/50 text-white hover:bg-black/70"
              : "bg-white/70 text-black hover:bg-white/90 border border-black/5"
          }`}
          title={
            theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
          }
        >
          {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          ref={buttonRef}
          onClick={() => setShowWallpaperSelector(!showWallpaperSelector)}
          className={`w-16 h-16 rounded-xl border-none backdrop-blur-sm cursor-pointer flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg ${
            theme === "dark"
              ? "bg-black/50 text-white hover:bg-black/70"
              : "bg-white/70 text-black hover:bg-white/90 border border-black/5"
          }`}
          title="Change Wallpaper"
        >
          <ImageIcon size={20} />
        </button>
      </div>

      {/* Wallpaper Selector Panel */}
      <div
        ref={panelRef}
        className={`fixed top-24 left-5 mr-5 z-[10000] backdrop-blur-md rounded-2xl p-5 max-w-[400px] max-h-[70vh] shadow-2xl overflow-y-auto transition-all duration-300 border
          ${
            showWallpaperSelector
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible"
              : "opacity-0 -translate-y-2 scale-95 pointer-events-none invisible"
          }
    ${
      theme === "dark"
        ? "bg-black/60 border-white/10 text-white"
        : "bg-white/90 border-black/10 text-black"
    }
    scrollbar-thin 
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-thumb]:rounded-full
    ${
      theme === "dark"
        ? "[&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-gray-400 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
        : "[&::-webkit-scrollbar-track]:bg-black/5 [&::-webkit-scrollbar-thumb]:bg-gray-600 hover:[&::-webkit-scrollbar-thumb]:bg-gray-800"
    }`}
      >
        <div className="flex justify-between items-center mb-[15px]">
          <h3
            className={`m-0 text-lg font-medium ${theme === "dark" ? "text-white" : "text-black"}`}
          >
            Select Wallpaper
          </h3>
          <button
            onClick={() => setShowWallpaperSelector(false)}
            className={`bg-transparent border-none cursor-pointer p-1 flex items-center transition-colors ${
              theme === "dark"
                ? "text-white hover:text-gray-300"
                : "text-black hover:text-gray-600"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {wallpapers && wallpapers.length > 0 ? (
            wallpapers.map((wallpaper, index) => {
              const wallpaperTheme = getThemeFromFilename(wallpaper.src);
              const isActive = currentWallpaper?.src === wallpaper.src;
              const posterUrl = wallpaper.poster
                ? withBase(`${wallpaper.posterBasePath}/${wallpaper.poster}`)
                : withBase(`${wallpaper.srcBasePath}/${wallpaper.src}`);

              return (
                <button
                  key={index}
                  onClick={() => {
                    onWallpaperSelect(wallpaper);
                    setShowWallpaperSelector(false);
                  }}
                  className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer bg-transparent p-0 transition-all duration-300 ease-in-out hover:scale-105
              ${
                isActive
                  ? theme === "dark"
                    ? "border-[3px] border-white"
                    : "border-[3px] border-purple-600 shadow-lg"
                  : theme === "dark"
                    ? "border-2 border-white/20 hover:border-white/50"
                    : "border-2 border-black/10 hover:border-black/30"
              }`}
                >
                  <img
                    src={posterUrl}
                    alt={`Wallpaper ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                    {wallpaperTheme === "dark"
                      ? "🌙"
                      : wallpaperTheme === "light"
                        ? "☀️"
                        : "⚪"}
                  </div>
                </button>
              );
            })
          ) : (
            <p
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} col-span-2 text-center`}
            >
              Loading wallpapers...
            </p>
          )}
        </div>
      </div>
    </>
  );
};

// -----------------------------------------------------------------------------
// 3A. New Component for Wallpaper selector

// Hook to detect click outside (Same as your player)
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// --- MiniThemeWidget (Redesigned with Wallpaper Preview) ---
const MiniThemeWidget = ({
  onExpand,
  theme,
  wallpapers = [],
  currentWallpaper,
  onWallpaperSelect,
  onThemeChange,
}) => {
  const verticalTextStyle =
    "lg:[writing-mode:vertical-rl] lg:rotate-180 lg:white-space-nowrap";

  // Logic to find next wallpaper
  const currentIndex = wallpapers.findIndex(
    (w) => w.src === (currentWallpaper?.src || ""),
  );
  const nextIndex =
    currentIndex >= 0 && wallpapers.length > 0
      ? (currentIndex + 1) % wallpapers.length
      : 0;
  const nextWallpaper = wallpapers.length > 0 ? wallpapers[nextIndex] : null;

  const getPosterUrl = (wp) => {
    if (!wp) return "";
    const base = wp.posterBasePath || wp.srcBasePath || "";
    const file = wp.poster || wp.src || "";
    return base ? `${base}/${file}` : file;
  };

  return (
    <div
      className={`relative mini-theme rounded-br-[2.5rem] lg:rounded-[1.4rem]  h-full w-full ${
        theme === "dark" ? "bg-[#000000]" : "bg-slate-50"
      }`}
    >
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
          theme === "dark" ? "bg-[#000000]" : "bg-slate-50"
        }`}
        style={{
          filter:
            theme === "dark"
              ? "url(#nnnoise-filter)"
              : "url(#nnnoise-filter-black)",
        }}
      />

      <div className=" z-2  relative flex flex-row lg:flex-col items-center justify-between h-full w-full px-4 py-2 lg:py-10">
        {/* Top: Header/Icon Area (Clickable to Expand) */}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onThemeChange?.();
          }}
          className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl shadow-md flex items-center justify-center transition-all duration-300 z-20 ${
            theme === "dark"
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-white text-purple-600 shadow-gray-200 hover:bg-purple-100"
          }`}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 lg:w-6 lg:h-6 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 lg:w-6 lg:h-6 text-slate-700" />
          )}
        </button>
        {/* 2. Appearance Text (Now visible on mobile + even spacing) */}
        <div
          onClick={onExpand}
          className={`cursor-pointer group flex items-center justify-center ${verticalTextStyle}`}
        >
          <p
            className={`text-xs lg:text-xl font-bold tracking-[0.1em] ml-2 lg:ml-0 mb-0! uppercase transition-colors ${
              theme === "dark"
                ? "text-white/60 group-hover:text-white"
                : "text-black/60 group-hover:text-black"
            }`}
          >
            Appearance
          </p>
        </div>

        {/* Spacer to push wallpapers to bottom on desktop */}

        {/* Bottom: Wallpaper Previews (The "Next in Line" Logic) */}
        <div className="flex items-center lg:flex-col gap-3 lg:gap-3">
          {/* Current Wallpaper (Small Indicator) */}
          {currentWallpaper && (
            <div
              className={`hidden lg:block w-13 h-13 rounded-lg overflow-hidden border-2 opacity-100 grayscale hover:grayscale-0 transition-all ${
                theme === "dark" ? "border-white/20" : "border-black/10"
              }`}
              title="Current Wallpaper"
            >
              <img
                src={getPosterUrl(currentWallpaper)}
                alt="Current"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Next Wallpaper (Clickable Action) */}
          {nextWallpaper && (
            <div
              onClick={(e) => {
                e.stopPropagation(); // Prevent opening the expanded view
                onWallpaperSelect(nextWallpaper);
              }}
              className="relative w-10 h-10 lg:w-14 lg:h-14 ml-2 lg:ml-0 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 group"
              title="Switch to Next Wallpaper"
            >
              <div
                className={`absolute inset-0 border-2 z-10 rounded-xl pointer-events-none ${
                  theme === "dark" ? "border-white/10" : "border-white/40"
                }`}
              />
              <img
                src={getPosterUrl(nextWallpaper)}
                alt="Next"
                className="w-full h-full object-cover"
              />
              {/* Overlay Icon */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={16} className="text-white drop-shadow-md" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ExpandedThemeWidget = ({
  onCollapse,
  theme,
  onThemeChange,
  wallpapers,
  currentWallpaper,
  onWallpaperSelect,
}) => {
  const getPosterUrl = (wp) => {
    if (!wp) return "";
    const base = wp.posterBasePath || wp.srcBasePath || "";
    const file = wp.poster || wp.src || "";
    return base ? `${base}/${file}` : file;
  };

  return (
    <div
      className={`relative h-full w-full p-[1rem] ${
        theme === "dark" ? "bg-[#000000]" : "bg-slate-50"
      }`}
    >
      {/* Background with Noise */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
          theme === "dark" ? "bg-[#000000]" : "bg-slate-50"
        }`}
        style={{
          filter:
            theme === "dark"
              ? "url(#nnnoise-filter)"
              : "url(#nnnoise-filter-black)",
        }}
      />

      {/* Main Container "Phone Screen" */}
      <div className="relative w-full h-full flex flex-col z-10">
        {/* Header */}
        <div
          className={`flex items-center justify-between mb-4 p-2 rounded-2xl border transition-colors flex-shrink-0 ${
            theme === "dark"
              ? "bg-white/5 border-white/10"
              : "bg-white/60 border-black/5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div>
              <h2
                className={`text-lg font-bold leading-none ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                Theme
              </h2>
              <span
                className={`text-[10px] uppercase tracking-wider font-mono ${
                  theme === "dark" ? "text-white/50" : "text-gray-500"
                }`}
              >
                Controlls
              </span>
            </div>
          </div>
          <button
            onClick={onCollapse}
            className={`p-2 rounded-full border transition-all active:scale-95 ${
              theme === "dark"
                ? "bg-white/10 text-white hover:bg-white/20 border-white/10"
                : "bg-black/5 text-black hover:bg-black/10 border-black/10"
            }`}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Theme Toggle Section */}
        <div
          className={`mb-4 p-4 rounded-3xl border shadow-inner relative overflow-hidden group flex-shrink-0 ${
            theme === "dark"
              ? "bg-neutral-900 border-white/5"
              : "bg-gray-100 border-black/5"
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <span
              className={`font-mono text-xs uppercase tracking-widest ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              System Theme
            </span>
            <span
              className={`text-xs font-bold ${
                theme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}
            >
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
          </div>

          {/* Custom Toggle Switch UI */}
          <div
            onClick={onThemeChange}
            className={`relative h-14 w-full rounded-2xl cursor-pointer transition-all duration-500 border-2 ${
              theme === "dark"
                ? "bg-black border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,1)]"
                : "bg-white border-purple-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]"
            }`}
          >
            <div className="absolute inset-0 flex justify-between items-center px-4">
              <Sun
                className={`w-6 h-6 ${
                  theme === "dark" ? "text-gray-700" : "text-amber-500"
                }`}
              />
              <Moon
                className={`w-6 h-6 ${
                  theme === "dark" ? "text-purple-300" : "text-gray-300"
                }`}
              />
            </div>

            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-xl shadow-lg transition-transform duration-500 ease-out flex items-center justify-center border ${
                theme === "dark"
                  ? "translate-x-[96%] bg-gray-800 border-white/10"
                  : "translate-x-[2%] bg-purple-500 border-purple-400"
              }`}
            >
              {theme === "dark" ? (
                <Moon size={18} className="text-white drop-shadow-md" />
              ) : (
                <Sun size={18} className="text-white drop-shadow-md" />
              )}
            </div>
          </div>
        </div>

        {/* Wallpaper Grid Section */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1 flex-shrink-0">
            <span
              className={`font-mono text-xs uppercase tracking-widest ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Wallpapers
            </span>
            <ImageIcon
              size={14}
              className={theme === "dark" ? "text-gray-500" : "text-gray-400"}
            />
          </div>

          <div
            className={`flex-1 overflow-y-auto rounded-2xl p-2 border 
            scrollbar-thin 
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-thumb]:rounded-full
            ${
              theme === "dark"
                ? "bg-white/5 border-white/5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-gray-500 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
                : "bg-black/5 border-black/5 [&::-webkit-scrollbar-track]:bg-black/5 [&::-webkit-scrollbar-thumb]:bg-gray-400 hover:[&::-webkit-scrollbar-thumb]:bg-gray-600"
            }`}
          >
            <div className="grid grid-cols-2 gap-3 relative">
              {wallpapers && wallpapers.length > 0 ? (
                wallpapers.map((wallpaper, index) => {
                  const isActive = currentWallpaper?.src === wallpaper.src;
                  const posterUrl = getPosterUrl(wallpaper);
                  const wallpaperTheme = getThemeFromFilename(wallpaper.src);

                  return (
                    <button
                      key={index}
                      onClick={() => onWallpaperSelect(wallpaper)}
                      className={`relative group aspect-[9/16] rounded-xl overflow-hidden transition-transform duration-300 border-2 ${
                        isActive
                          ? "ring-2 ring-purple-500 ring-offset-1 ring-offset-transparent border-purple-500"
                          : theme === "dark"
                            ? "border-transparent hover:border-white/30 hover:scale-[1.02]"
                            : "border-transparent hover:border-black/20 hover:scale-[1.02]"
                      }`}
                    >
                      <img
                        src={posterUrl}
                        alt={`Wallpaper ${index}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Theme Icon Badge */}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shadow-sm z-10">
                        {wallpaperTheme === "dark"
                          ? "🌙"
                          : wallpaperTheme === "light"
                            ? "☀️"
                            : "⚪"}
                      </div>

                      {/* Active Badge (Removed backdrop-blur to fix shifting) */}
                      {isActive && (
                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center z-20">
                          <div className="bg-purple-600 rounded-full p-1 shadow-lg">
                            <Check size={16} className="text-white" />
                          </div>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute top-0 left-0 right-0 h-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </button>
                  );
                })
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-10 opacity-50">
                  <ImageIcon size={30} className="mb-2" />
                  <span className="text-xs">No Wallpapers</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Exported Component ---
export const ThemePlayer = ({
  theme,
  onThemeChange,
  wallpapers,
  currentWallpaper,
  onWallpaperSelect,
  shouldHideUI, // 1. Receive the prop
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useClickOutside(containerRef, () => {
    if (isExpanded) setIsExpanded(false);
  });

  // 2. Determine visibility directly inside component
  const location = useLocation();
  // Combine route-based hiding and scroll-based hiding
  const isRouteHidden =
    location.pathname === "/" || location.pathname === "/socials";
  const effectivelyHidden = isRouteHidden || shouldHideUI;

  // Responsive Positioning Classes
  let positionClasses;

  if (isExpanded) {
    // Mobile: Center-ish bottom/middle
    positionClasses =
      "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg h-[70vh]";

    // Desktop: Left side fixed (Symmetrical to Music Player)
    positionClasses += " lg:left-10 lg:translate-x-0 lg:w-90 lg:h-[70vh]";
  } else {
    // Mobile: Top-Left corner
    positionClasses = "fixed -top-[3px] -left-[3px] w-auto h-14";

    // Desktop: Left Center vertical strip
    positionClasses +=
      " lg:top-1/2 lg:-translate-y-1/2 lg:left-8 lg:w-22 lg:h-[30rem]";
  }

  // Animation & Container Classes
  const containerClasses = [
    "lg:transition-all lg:duration-500",
    "transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-[9999]", // Improved transition
    isExpanded
      ? "rounded-[2.5rem] shadow-2xl"
      : "rounded-br-[2.5rem] lg:rounded-[1.4rem] ",
    theme === "dark" ? "shadow-black/50" : "shadow-xl shadow-purple-900/10",
    "overflow-hidden",

    // 3. THE MAGIC FIX:
    // If hidden, force it off-screen to the left (-200%).
    // This overrides the 'x' variable but KEEPS the 'y' centering intact.
    effectivelyHidden ? "-translate-x-[250%]" : "",
  ].join(" ");

  return (
    <div
      ref={containerRef}
      className={`${positionClasses} ${containerClasses}`}
      // 3. THE MAGIC: Override Tailwind's X-translation variable directly
      style={{
        // If hidden, force X to -250% (slide far left).
        // If visible, set to undefined (let Tailwind classes controls it).
        "--tw-translate-x": effectivelyHidden ? "-250%" : undefined,
        border: "0px solid transparent",
      }}
    >
      {isExpanded ? (
        <ExpandedThemeWidget
          onCollapse={() => setIsExpanded(false)}
          theme={theme}
          onThemeChange={onThemeChange}
          wallpapers={wallpapers}
          currentWallpaper={currentWallpaper}
          onWallpaperSelect={onWallpaperSelect}
        />
      ) : (
        <MiniThemeWidget
          onExpand={() => setIsExpanded(true)}
          theme={theme}
          wallpapers={wallpapers}
          currentWallpaper={currentWallpaper}
          onWallpaperSelect={onWallpaperSelect}
          onThemeChange={onThemeChange}
        />
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// 4. THEME PROVIDER (Unchanged Logic)
// -----------------------------------------------------------------------------

// Helper function to automatically select day/night wallpaper based on user's current time
const getTimeBasedWallpaper = (asset, allAssets) => {
  if (!asset || !allAssets || !allAssets.length) return asset;

  const hour = new Date().getHours();
  // Morning / Day time: 6 AM to 6 PM (6 to 17)
  const isDayTime = hour >= 6 && hour < 18;

  const src = asset.src || "";
  const hasDay = src.includes("-day");
  const hasNight = src.includes("-night");

  // If the wallpaper does not have a day/night option (some wallpapers are standalone)
  if (!hasDay && !hasNight) {
    return asset;
  }

  const baseName = src.replace("-day", "").replace("-night", "");
  const extIndex = baseName.lastIndexOf(".");
  if (extIndex === -1) return asset;

  const targetSuffix = isDayTime ? "-day" : "-night";
  const targetSrc = baseName.substring(0, extIndex) + targetSuffix + baseName.substring(extIndex);

  const matchedAsset = allAssets.find((a) => a.src === targetSrc);
  return matchedAsset || asset;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      // 1. Check if user has a MANUALLY saved preference
      const stored = localStorage.getItem(themeStorageKey);
      if (stored) return stored;
    } catch (e) {}

    // 2. Otherwise, use system default
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  // Sync HTML Class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    // We REMOVED the localStorage.setItem from here because
    // we only want to save it when the user MANUALLY clicks.
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      // Only sync if the user hasn't locked in a preference manually
      const userHasManualPreference = localStorage.getItem(themeStorageKey);
      if (!userHasManualPreference) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    // Modern browsers use addEventListener, older use addListener
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // ... (Keep your existing handleThemeChange, handleWallpaperSelect, and asset loading logic)

  const [allWallpapers, setAllWallpapers] = useState([]);
  const [currentAsset, setCurrentAsset] = useState(null);

  const getStoredBackground = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  };
  const setStoredBackground = (value) => {
    try {
      localStorage.setItem(storageKey, value);
      localStorage.setItem("portfolio:lastBackgroundDate", new Date().toDateString());
    } catch (error) {
      console.error("Failed to store background:", error);
    }
  };
  const parseStoredBackground = (rawValue) => {
    if (!rawValue) return null;
    try {
      return createAssetConfig(JSON.parse(rawValue));
    } catch (error) {
      return createAssetConfig(rawValue);
    }
  };

  const handleThemeChange = () => {
    // 1. Calculate the new theme
    const newTheme = theme === "light" ? "dark" : "light";

    // 2. Update the React state
    setTheme(newTheme);

    // 3. Persist the choice to localStorage
    try {
      localStorage.setItem(themeStorageKey, newTheme);
    } catch (e) {
      console.error("Failed to save theme to storage", e);
    }

    // Logic for filtering and setting random wallpapers removed
    // This ensures the current wallpaper stays exactly as it is.
  };

  const handleWallpaperSelect = (wallpaper) => {
    setCurrentAsset(wallpaper);
    setStoredBackground(serializeBackgroundConfig(wallpaper));

    // Removed wallpaperTheme overriding setTheme so light/dark mode remains based on user default / system preference!
  };

  const location = useLocation();

  // Clear stored background when returning to Home page
  useEffect(() => {
    if (location.pathname === "/") {
      try {
        localStorage.removeItem(storageKey);
        localStorage.removeItem("portfolio:lastBackgroundDate");
      } catch (e) {}
    }
  }, [location.pathname]);

  useEffect(() => {
    // If we already have a wallpaper loaded and we are not navigating to home (/), do nothing.
    // This keeps the wallpaper persistent on inner page changes and works correctly in StrictMode.
    if (currentAsset && location.pathname !== "/") {
      return;
    }

    const manifestUrl = withBase("assets/images/backgrounds/backgrounds.json");
    let isMounted = true;

    fetch(manifestUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Manifest error");
        return res.json();
      })
      .then((assets) => {
        if (!isMounted) return;
        const normalizedAssets = normalizeBackgroundAssets(assets);
        setAllWallpapers(normalizedAssets);

        if (!normalizedAssets.length) return;

        const themeWallpapers = normalizedAssets.filter((w) => {
          const wTheme = getThemeFromFilename(w.src);
          return wTheme === theme || wTheme === "neutral";
        });

        // Exclude the current wallpaper from the pool when randomizing
        let availableWallpapers = themeWallpapers;
        if (currentAsset && currentAsset.src) {
          const currentBase = currentAsset.src.replace("-day", "").replace("-night", "");
          const filtered = themeWallpapers.filter((w) => {
            const wBase = w.src.replace("-day", "").replace("-night", "");
            return wBase !== currentBase;
          });
          if (filtered.length > 0) {
            availableWallpapers = filtered;
          }
        }

        const selectedAsset =
          availableWallpapers.length > 0
            ? availableWallpapers[
                Math.floor(Math.random() * availableWallpapers.length)
              ]
            : normalizedAssets[0];

        if (selectedAsset) {
          const timeBasedAsset = getTimeBasedWallpaper(selectedAsset, normalizedAssets);
          setCurrentAsset(timeBasedAsset);
          setStoredBackground(serializeBackgroundConfig(timeBasedAsset));
        }
      })
      .catch((err) => console.error(err));

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        allWallpapers,
        currentAsset,
        handleThemeChange,
        handleWallpaperSelect,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// -----------------------------------------------------------------------------
// 5. HEADER BACKGROUND (Updated with Parallax & Fallback Logic)
// -----------------------------------------------------------------------------

export const HeaderBackground = ({ loading }) => {
  const { currentAsset, theme } = useTheme();
  const mainRef = useRef(null);
  const containerRef = useRef(null); // Container for transform
  const videoRef = useRef(null);
  const cleanupRef = useRef(null);

  // Parallax Refs
  const requestRef = useRef();
  const targetPos = useRef({ x: 0, y: 0 }); // Target mouse position
  const currentPos = useRef({ x: 0, y: 0 }); // Current interpolated position

  // 1. Parallax Animation Loop
  const animateParallax = () => {
    // Linear Interpolation (Lerp) for smoothness: 0.05 is the speed/friction
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.12;
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.12;

    // Apply Transform
    if (containerRef.current) {
      // Limit movement range (e.g., +/- 20px)
      const xOffset = currentPos.current.x * 70;
      const yOffset = currentPos.current.y * 70;
      // Scale slightly to prevent edges showing during movement
      containerRef.current.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0) scale(1.1)`;
    }

    requestRef.current = requestAnimationFrame(animateParallax);
  };

  useEffect(() => {
    // Start Animation Loop
    requestRef.current = requestAnimationFrame(animateParallax);

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      // Normalize to range -1 to 1
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;

      targetPos.current = { x, y };
    };

    // NOTE: Requirement 2 - We do NOT add a mouseLeave listener that resets targetPos.
    // By omitting it, the background stays in its last calculated position until mouse enters again.

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const [readyToLoadVideo, setReadyToLoadVideo] = useState(false);

  useEffect(() => {
    // If the loader finishes, we are definitely ready to load the video!
    if (!loading) {
      setReadyToLoadVideo(true);
      return;
    }

    // Otherwise, wait until critical resources (JS/CSS/images) are fully downloaded:
    if (document.readyState === "complete") {
      setReadyToLoadVideo(true);
    } else {
      const handleLoad = () => setReadyToLoadVideo(true);
      window.addEventListener("load", handleLoad);

      // Fallback timer: start download after 1.5s anyway to catch up during preloader
      const timer = setTimeout(() => {
        setReadyToLoadVideo(true);
      }, 1500);

      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(timer);
      };
    }
  }, [loading]);

  // 3. Asset Loading Logic
  useEffect(() => {
    if (!currentAsset || !mainRef.current) return;
    const main = mainRef.current;

    // Clear previous video setup
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.style.backgroundImage = "none";
    }

    const assetUrl = resolveAssetUrl(
      currentAsset.src,
      currentAsset.type,
      currentAsset.srcBasePath,
    );

    // Apply Background Image (Backup for video, or primary for image type)
    let posterUrl = "";
    if (currentAsset.type === "video" && currentAsset.poster) {
      posterUrl = resolveAssetUrl(
        currentAsset.poster,
        "image",
        currentAsset.posterBasePath,
      );
    } else if (currentAsset.type === "image") {
      posterUrl = assetUrl;
    }

    // Always set the static background on the container initially
    // This aligns the image zoom (scale(1.1)) and parallax with the video.
    if (posterUrl && containerRef.current) {
      containerRef.current.style.backgroundImage = `url("${posterUrl}")`;
      containerRef.current.style.backgroundSize = "cover";
      containerRef.current.style.backgroundPosition = "center";
      containerRef.current.style.backgroundRepeat = "no-repeat";
      main.style.backgroundImage = "none";
    }

    // Hold off on loading the heavy video until critical assets (styles, code, background image) are ready.
    if (!readyToLoadVideo && currentAsset.type === "video") {
      return;
    }

    if (currentAsset.type === "video") {
      const video = document.createElement("video");
      video.className = "main__background-media";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.style.objectFit = "cover";
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.opacity = "0"; // Start hidden
      video.style.transition = "opacity 0.8s ease-in-out";

      // Video Fallback Logic
      video.onerror = () => {
        console.warn("Background video failed to load, falling back to image.");
        video.style.display = "none"; // Hide broken video element completely
        // The main.style.backgroundImage set above remains visible
      };

      if (posterUrl) video.setAttribute("poster", posterUrl);
      video.src = assetUrl;

      if (containerRef.current) containerRef.current.appendChild(video);

      // Only fade in video once it is actually playing data
      video.addEventListener("play", () => {
        video.style.opacity = "1";
        // Optional: We can clear the background image to save memory,
        // OR keep it for safety. Given Req 3, it's safer to keep it
        // behind the video in case the video freezes or crashes later.
      });

      videoRef.current = video;

      // Cleanup for this specific video instance
      cleanupRef.current = () => {
        video.pause();
        video.src = "";
        video.load();
        video.remove();
      };

      // Attempt play
      video.play().catch((e) => {
        console.warn("Autoplay failed/blocked", e);
        // Fallback image is already visible
      });
    }
  }, [currentAsset, readyToLoadVideo]);

  return (
    <div
      ref={mainRef}
      id="main"
      className="main"
      data-theme={theme}
      style={{
        position: "fixed",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        ref={containerRef}
        className="main__parallax-container"
        style={{
          position: "absolute",
          top: -50, // Slight negative top/left to allow for movement without showing edges
          left: -50,
          width: "calc(100% + 100px)", // Larger width/height for parallax movement
          height: "calc(100% + 100px)",
          willChange: "transform",
        }}
      />
    </div>
  );
};

export default HeaderBackground;
