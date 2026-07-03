import React, { useState, useRef, useEffect } from "react";
import { Github, ExternalLink } from "lucide-react";
import { useTheme } from "./HeaderBackground";

import { TECH_ICON_MAP } from "../constants/techIcons";

// --- Sub-Components ---
const TechBadge = React.memo(({ label, slug, color, iconColor, theme }) => {
  const mapped = TECH_ICON_MAP[label];

  const resolvedUrl = mapped?.url
    ?? (slug
      ? slug.startsWith("http") ? slug : `https://api.iconify.design/${slug}.svg`
      : null);

  const resolvedColor = mapped?.color ?? color ?? "888888";

  return (
    <div
      style={{
        backgroundColor: `#${resolvedColor}15`,
        borderColor: `#${resolvedColor}30`,
      }}
      className="flex items-center px-2.5 py-1 rounded-full border backdrop-blur-sm transition-transform hover:scale-105"
    >
      {resolvedUrl && (
        <img
          src={resolvedUrl}
          alt={label}
          decoding="async"
          className="w-4 h-4 min-[1265px]:w-5 min-[1265px]:h-5 mr-2 shrink-0"
        />
      )}
      <span
        style={{ color: `#${resolvedColor}` }}
        className="text-[11px] min-[1265px]:text-[13px] font-semibold"
      >
        {label}
      </span>
    </div>
  );
});

const handleLinkClick = (url) => (e) => {
  e.stopPropagation();
  e.preventDefault();
  window.open(url, "_blank", "noopener,noreferrer");
};

const RopeBulb = ({ isOn, onClick, onHoverChange, onBulbHover }) => {
  const [isPulling, setIsPulling] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsPulling(true);
    onClick();
    setTimeout(() => setIsPulling(false), 300);
  };

  return (
    <div
      className="absolute left-8 top-0 z-50 origin-top transition-transform duration-300 hover:scale-110"
      onMouseEnter={(e) => {
        e.stopPropagation();
        onHoverChange && onHoverChange(true);
        onBulbHover && onBulbHover(false);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        onHoverChange && onHoverChange(false);
      }}
    >
      <div
        className="flex flex-col items-center cursor-pointer group"
        style={{
          transform: isPulling ? "translateY(12px)" : "translateY(0)",
          transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          pointerEvents: "auto",
        }}
        onClick={handleClick}
      >
        {/* The Mount Anchor - Making it look connected */}
        <div className="w-8 h-3 bg-zinc-950 rounded-b-lg border-x border-b border-white/10 shadow-lg relative">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-zinc-900 rounded-full blur-[1px]"></div>
        </div>

        {/* The Rope */}
        <div className="w-0.5 h-16 bg-gradient-to-b from-zinc-500 via-zinc-600 to-zinc-700 relative">
          {/* Decorative knots/textures on rope */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-1.5 bg-zinc-800 rounded-sm opacity-50"></div>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-1 h-1.5 bg-zinc-800 rounded-sm opacity-50"></div>
        </div>

        {/* Bulb Socket */}
        <div className="w-4 h-5 bg-zinc-800 border border-zinc-600 rounded-t-sm mt-[-2px] relative z-10 shadow-sm"></div>

        {/* The Bulb with Flickering logic */}
        <div
          className={`w-8 h-8 rounded-full border-2 -mt-1 relative z-0 transition-all duration-500 ${isOn
            ? "bg-yellow-200 border-yellow-100 shadow-[0_0_45px_15px_rgba(253,224,71,0.7)]"
            : "bg-orange-400/30 border-orange-300/40 shadow-none animate-bulb-flicker group-hover:bg-orange-400"
            }`}
        >
          {/* Reflection Highlight */}
          <div
            className={`absolute top-1.5 left-2 w-2 h-2 rounded-full rotate-45 transition-colors ${isOn ? "bg-white/60" : "bg-orange-100/30"}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

// --- Top Face Content Component ---
// Extracted to ensure the 3D face and the 2D overlay look identical
const TopFaceContent = ({ item, toggleLight, onViewDetails }) => {
  const listRef = useRef(null);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0, opacity: 0 });
  const { theme } = useTheme();

  const gradientHoverMove = (e) => {
    if (listRef.current) {
      const rect = listRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setGlowPosition({ x, y, opacity: 1 });
    }
  };

  const gradientHoverLeave = () => {
    setGlowPosition({ ...glowPosition, opacity: 0 });
  };

  const gradientHoverEnter = () => {
    setGlowPosition((prev) => ({ ...prev, opacity: 1 }));
  };

  return (
    <div
      className={`absolute inset-0 backdrop-blur-sm border rounded-4xl p-5 overflow-hidden flex flex-col backface-hidden transition-colors duration-300 ${theme === "dark"
        ? "bg-[#0a0a0a]/95 border-white/30"
        : "bg-white/90 border-black/10 shadow-sm"
        }`}
      ref={listRef}
      onMouseMove={gradientHoverMove}
      onMouseLeave={gradientHoverLeave}
      onMouseEnter={gradientHoverEnter}
    >
      <div className="relative z-10 flex flex-col h-full pointer-events-auto">
        <div className="mt-6 flex-1">
          <p
            className={`text-2xl min-[1265px]:text-4xl font-bold leading-tight mb-1 uppercase tracking-tight bg-clip-text text-transparent text-center bg-gradient-to-r ${theme === "dark"
              ? "from-gray-400 via-white to-gray-500"
              : "from-gray-500 via-gray-900 to-gray-600"
              }`}
          >
            {item.title}
          </p>
          <p
            className={`text-lg min-[1265px]:text-2xl leading-snug line-clamp-3 lg:line-clamp-none text-center ${theme === "dark" ? "text-[#c4c4c4]" : "text-zinc-600"
              }`}
          >
            {item.description}
          </p>
        </div>
        <div className="hidden xl:flex flex-wrap justify-center gap-2 mt-auto mb-4 px-2">
          {item.techStack &&
            item.techStack
              .slice(0, 6)
              .map((tech) => (
                <TechBadge
                  key={tech.name}
                  slug={tech.slug}
                  label={tech.name}
                  color={tech.color}
                  iconColor={tech.iconColor}
                  theme={theme}
                />
              ))}
        </div>
        <div className="flex items-center justify-between w-full mt-auto pt-4 ">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLight();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={`!text-xl transition-colors uppercase tracking-widest font-semibold cursor-pointer relative z-20 ${theme === "dark"
              ? "text-zinc-500 hover:text-zinc-300"
              : "text-zinc-400 hover:text-zinc-600"
              }`}
          >
            Close
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(item);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={`group relative font-black uppercase rounded-full overflow-hidden transition-all shadow-xl ${theme === "dark"
              ? "bg-white text-black hover:shadow-white/10"
              : "bg-black text-white hover:shadow-black/20"
              }`}
          >
            <span className="relative z-10 text-xl group-hover:text-white transition-colors rounded-full flex items-center gap-2 px-4 py-2">
              View Details
              <ExternalLink
                size={12}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </span>
            <div
              className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full ${theme === "dark"
                ? "group-hover:bg-black/70"
                : "group-hover:bg-zinc-800"
                }`}
            ></div>
          </button>
        </div>
      </div>

      <div
        className="cursor-glow-portfolio-card pointer-events-none"
        style={{
          left: `${glowPosition.x}px`,
          top: `${glowPosition.y}px`,
          opacity: glowPosition.opacity,
          background:
            theme === "dark"
              ? "radial-gradient(circle, rgba(30, 144, 255, 0.2) 0%, rgba(75, 0, 130, 0.1) 70%, transparent 100%)"
              : "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(30, 58, 138, 0.05) 70%, transparent 100%)",
        }}
      ></div>
    </div>
  );
};

const Cube = React.memo(
  ({
    item,
    onViewDetails,
    isDragging,
    isScrolling,
    width,
    height,
    onImageOpen,
    isVisible = true,
  }) => {
    const [isLightOn, setIsLightOn] = useState(false);
    const [isBulbHovered, setIsBulbHovered] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { theme } = useTheme();

    // Detect if device supports hover (desktop) - disable hover animations on touch devices
    const [canHover, setCanHover] = useState(true);
    useEffect(() => {
      const mediaQuery = window.matchMedia("(hover: hover)");
      setCanHover(mediaQuery.matches);
      const handler = (e) => setCanHover(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    const [showImageModal, setShowImageModal] = useState(false);
    // interactionReady determines if the 2D overlay should be shown
    const [interactionReady, setInteractionReady] = useState(false);

    // Reset state when not visible
    useEffect(() => {
      if (!isVisible && isLightOn) {
        setIsLightOn(false);
      }
    }, [isVisible, isLightOn]);

    const toggleLight = () => {
      setIsLightOn(!isLightOn);
    };

    // Manage interaction readiness based on animation timing
    useEffect(() => {
      let timer;
      if (isLightOn) {
        // Wait for the 700ms transition to finish before enabling the 2D overlay
        // This ensures the user sees the 3D rotation, then gets the stable 2D interface
        timer = setTimeout(() => {
          setInteractionReady(true);
        }, 550); // slightly less than duration to feel responsive
      } else {
        // Immediately disable overlay when closing to allow 3D rotation back
        setInteractionReady(false);
      }
      return () => clearTimeout(timer);
    }, [isLightOn]);

    const handleImageClick = (e) => {
      e.stopPropagation();
      setShowImageModal(true);
    };

    const translateZ = width / 2;

    // Optimize: Disable pointer events during scroll/drag to prevent expensive hover calcs
    const isInteracting = isDragging || isScrolling;

    return (
      <>
        <div
          // Note: Removed preserve-3d from here to allow simple 2D stacking for the overlay
          className={`relative transition-all duration-500 ${isHovered ? "shutter-active" : ""}`}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            perspective: "1200px",
            pointerEvents: isInteracting ? "none" : "auto",
            willChange: "transform", // Hint browser for optimization
          }}
        >
          {/* The 3D Pivot Container */}
          <div
            className="w-full h-full relative transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              transformStyle: "preserve-3d",
              transform: `translateZ(-${translateZ}px) rotateX(${isLightOn ? -90 : 0}deg)`,
              pointerEvents: "none",
            }}
          >
            {/* Shutter Animation Styles */}
            <style>{`
            @keyframes rotate {
              100% {
                transform: rotate(1turn);
              }
            }

            .rainbow-border {
              position: relative;
              isolation: isolate;
            }

            .rainbow-border::before {
              content: '';
              position: absolute;
              z-index: -1;
              inset: -6px;
              background-repeat: no-repeat;
              background-size: 50% 50%, 50% 50%;
              background-position: 0 0, 100% 0, 100% 100%, 0 100%;
              background-image: ${theme === "dark"
                ? "linear-gradient(#6366f1, #6366f1), linear-gradient(#8b5cf6, #8b5cf6), linear-gradient(#06b6d4, #06b6d4), linear-gradient(#4f46e5, #4f46e5)"
                : "linear-gradient(#3b82f6, #3b82f6), linear-gradient(#8b5cf6, #8b5cf6), linear-gradient(#06b6d4, #06b6d4), linear-gradient(#4f46e5, #4f46e5)"
              };
              border-radius: calc(2rem + 6px);
              opacity: 0;
              transition: opacity 0.3s ease;
              pointer-events: none;
            }

            .rainbow-border-active::before {
             animation: rotate 2s ease-out 1 forwards;
              opacity: 1;
            }

            .shutter-overlay {
              box-shadow: 
                inset 0 0 0 transparent, 
                inset 0 0 0 transparent, 
                inset 0 0 0 transparent, 
                inset 0 0 0 transparent;
              transition: box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
              pointer-events: none;
              opacity: 0;
            }

            /* Trigger shutter on hover (when isHovered is true) */
            .shutter-active .shutter-overlay {
              box-shadow: 
                inset -${width}px -${width}px 0 ${theme === "dark" ? "#000" : "#1e293b"}, 
                inset ${width}px -${width}px 0 ${theme === "dark" ? "#4f46e5" : "#3b82f6"}, 
                inset -${width}px ${width}px 0 ${theme === "dark" ? "#0891b2" : "#06b6d4"}, 
                inset ${width}px ${width}px 0 ${theme === "dark" ? "#7c3aed" : "#8b5cf6"};
              opacity: 1;
            }

            .shutter-content {
              opacity: 0;
              transform: scale(0.9) translateY(10px);
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .shutter-active .shutter-content {
              opacity: 1;
              transform: scale(1) translateY(0);
              transition-delay: 0.15s;
            }
          `}</style>

            {/* FRONT FACE (Links) */}
            <div
              className={`rainbow-border h-[100%] ${isHovered ? "rainbow-border-active" : ""} absolute inset-0 border-2 rounded-4xl flex items-end justify-between gap-4 backface-hidden backdrop-blur-sm transition-colors duration-300 ${theme === "dark"
                ? "bg-[#0f172a] border-black/90"
                : "bg-[#0f172a] border-zinc-300 shadow-inner"
                }`}
              style={{
                transform: `rotateX(0deg) translateZ(${translateZ}px)`,
                visibility: isLightOn ? "hidden" : "visible",
                pointerEvents: isLightOn ? "none" : "auto",
                backfaceVisibility: "hidden",
                overflow: "hidden",
              }}
              onMouseEnter={() => canHover && setIsHovered(true)}
              onMouseLeave={() => canHover && setIsHovered(false)}
            >
              <div
                className={`absolute -inset-[1px] bg-cover bg-center cursor-pointer transition-all duration-300 z-10 ${isBulbHovered ? "scale-105 opacity-100" : "opacity-50"}`}
                style={{ backgroundImage: `url(${item.image_url})` }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLight();
                }}
              />

              {/* Shutter Overlay - Reveals on Hover */}
              <div className="shutter-overlay absolute inset-0 flex items-center justify-center p-8 text-center z-20">
                <div className="shutter-content text-white">
                  <h3 className="text-3xl min-[1265px]:text-4xl font-black uppercase tracking-tighter mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs min-[1265px]:text-sm font-bold uppercase tracking-[0.2em] opacity-80">
                    Click for More
                  </p>
                </div>
              </div>

              {/* Top Right Tag */}
              <div
                className="absolute top-4 right-4 z-30"
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setIsHovered(false);
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                }}
              >
                <span
                  className={`px-3 py-1 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest border rounded-full transition-colors ${theme === "dark"
                    ? "bg-black/60 text-white border-white/10"
                    : "bg-white/80 text-zinc-900 border-black/10"
                    }`}
                >
                  {item.tag}
                </span>
              </div>

              {/* Button Container (Bottom Left) or Private Badge */}
              {item.links.github_link || item.links.live_link ? (
                <div
                  className={`relative z-40 flex gap-3 px-4 pt-4 pb-3 rounded-tr-3xl border-t border-r transition-colors ${theme === "dark"
                    ? "bg-zinc-900 border-white/10"
                    : "bg-white border-zinc-200 shadow-lg"
                    }`}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setIsHovered(false);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {/* Github Button */}
                  {item.links.github_link && (
                    <button
                      onClick={handleLinkClick(item.links.github_link)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      className={`w-14 h-14 flex items-center justify-center rounded-full transition-all transform hover:scale-110 border cursor-pointer ${theme === "dark"
                        ? "bg-black hover:bg-zinc-800 text-white border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                        : "bg-zinc-900 hover:bg-black text-white border-transparent shadow-md"
                        }`}
                      style={{ pointerEvents: "auto" }}
                    >
                      <Github size={18} />
                    </button>
                  )}

                  {/* Live Link Button */}
                  {item.links.live_link && (
                    <button
                      onClick={handleLinkClick(item.links.live_link)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      className={`w-14 h-14 flex items-center justify-center rounded-full transition-all transform hover:scale-110 border cursor-pointer ${theme === "dark"
                        ? "bg-white hover:bg-zinc-200 text-black border-black/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-md"
                        }`}
                      style={{ pointerEvents: "auto" }}
                    >
                      <ExternalLink size={15} />
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`relative z-40 flex items-center px-4 pt-4 pb-3 rounded-tr-3xl border-t border-r transition-colors ${theme === "dark"
                    ? "bg-zinc-900 border-white/10"
                    : "bg-white border-zinc-200 shadow-lg"
                    }`}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setIsHovered(false);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="h-14 flex items-center justify-center px-1">
                    <span className={`font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                      {/* Mobile text */}
                      <span className="text-[10px] min-[1265px]:hidden">🔒 CLIENT WORK</span>
                      {/* Desktop text */}
                      <span className="hidden min-[1265px]:inline text-xs">🔒 PRIVATE CLIENT WORK</span>
                    </span>
                  </div>
                </div>
              )}

              <RopeBulb
                isOn={isLightOn}
                onClick={() => onImageOpen(item)}
                onHoverChange={setIsBulbHovered}
                onBulbHover={setIsHovered}
              />
            </div>

            {/* TOP FACE (3D Animation Version) */}
            <div
              className="absolute inset-0 backface-hidden"
              style={{
                transform: `rotateX(90deg) translateZ(${translateZ}px)`,
                // Hide this face once the 2D overlay takes over to prevent double-rendering/z-fighting
                visibility:
                  isLightOn && !interactionReady ? "visible" : "hidden",
                pointerEvents: "none", // This version is purely for animation
                backfaceVisibility: "hidden",
              }}
            >
              <TopFaceContent
                item={item}
                toggleLight={toggleLight}
                onViewDetails={onViewDetails}
              />
            </div>
          </div>

          {/* 2D INTERACTION OVERLAY (Stable Click Target) */}
          {interactionReady && (
            <div
              className="absolute inset-0 z-50 animate-in fade-in duration-200"
              style={{ pointerEvents: "auto" }}
            >
              <TopFaceContent
                item={item}
                toggleLight={toggleLight}
                onViewDetails={onViewDetails}
              />
            </div>
          )}
        </div>
      </>
    );
  },
);

export default Cube;