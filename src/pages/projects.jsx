import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

import "../styles/main.css";
import DetailCard from "../components/DetailedCard";
import Cube from "../components/Cube";
import { RotateCcw, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useTheme } from "../components/HeaderBackground";
import FullscreenZoomableImage from "../components/FullscreenZoomableImage";
import { createPortal } from "react-dom";

// --- Configuration Constants ---
// Base values (Mobile/Tablet)
const BASE_CUBE_WIDTH = 200;
const BASE_GAP_WIDTH = 64;

// Multiplier for Large Screens (lg)
const LG_MULTIPLIER = 1.5;

// --- Configuration Constants ---
const CUBE_WIDTH = 200;
const GAP_WIDTH = 64; // 4rem
const ITEM_WIDTH = CUBE_WIDTH + GAP_WIDTH;
const AUTO_SLIDE_DELAY = 2500;
const SWIPE_THRESHOLD = 50;
import rawPortfolioData from "../data/projectsData.json";
import legacyPortfolioData from "../data/legacyProjectsData.json";

const Projects = () => {
  const context = useOutletContext();
  const setIsDetailViewOpen = context?.setIsDetailViewOpen;

  const [selectedProject, setSelectedProject] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        let matched = rawPortfolioData.find((p) => p.id === hash);
        if (!matched) matched = legacyPortfolioData.find((p) => p.id === hash);
        return matched || null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (setIsDetailViewOpen) {
      setIsDetailViewOpen(selectedProject !== null);
    }
    return () => {
      if (setIsDetailViewOpen) {
        setIsDetailViewOpen(false);
      }
    };
  }, [selectedProject, setIsDetailViewOpen]);

  const [fullscreenImage, setFullscreenImage] = useState(null);
  const { theme } = useTheme();

  // --- Responsive Logic ---
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1000,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate dimensions based on screen size
  const isLg = windowWidth >= 1265; // Tailwind lg breakpoint
  const currentScale = isLg ? LG_MULTIPLIER : 1;
  const cubeWidth = BASE_CUBE_WIDTH * currentScale;
  const gapWidth = BASE_GAP_WIDTH * currentScale;
  const itemWidth = cubeWidth + gapWidth;

  // Visual Width for container
  const visibleContainerWidth = 3 * cubeWidth + 2 * gapWidth;

  const len = rawPortfolioData.length;
  // Start at a large index to allow left scrolling without negative quirks immediately,
  // though the logic handles negatives fine.
  
  // Initialize active index based on hash if present
  const [activeIndex, setActiveIndex] = useState(() => {
    let initialIndex = len * 100;
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        const matchedIndex = rawPortfolioData.findIndex((p) => p.id === hash);
        if (matchedIndex !== -1) {
          initialIndex = (len * 100) + matchedIndex;
        }
      }
    }
    return initialIndex;
  });

  const [isTransitioning, setIsTransitioning] = useState(true);

  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const startXRef = useRef(0);
  const currentTranslateRef = useRef(0);
  const draggingRef = useRef(false);
  const autoSlideRef = useRef(null);
  const isHoveringRef = useRef(false);

  // Buffer range: How many items to render on each side of the active index
  // 3 visible + 2 buffer on each side = 7 total should be safe usually.
  // User requested +/- 7 to ensure seamlessness even with aggressive scrolling.
  const BUFFER = 7;

  const getTranslation = useCallback(
    (index) => {
      // Center the active index within the visible container
      // The wrapper moves opposite to the index direction
      return visibleContainerWidth / 2 - (index * itemWidth + cubeWidth / 2);
    },
    [visibleContainerWidth, itemWidth, cubeWidth],
  );

  // Generate the window of virtual indices to render
  // range: [activeIndex - BUFFER, activeIndex + BUFFER]
  const visibleIndices = useMemo(() => {
    const indices = [];
    for (let i = -BUFFER; i <= BUFFER; i++) {
      indices.push(activeIndex + i);
    }
    return indices;
  }, [activeIndex]);

  const stopAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  }, []);

  const startAutoSlide = useCallback(() => {
    stopAutoSlide();
    if (isHoveringRef.current || selectedProject) return;
    autoSlideRef.current = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
      setIsTransitioning(true);
    }, AUTO_SLIDE_DELAY);
  }, [stopAutoSlide, selectedProject]);

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    startAutoSlide();
    return stopAutoSlide;
  }, [startAutoSlide, stopAutoSlide]);

  // Handle external hash changes (e.g. browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) {
        setSelectedProject(null);
        return;
      }

      let matchedProject = rawPortfolioData.find((p) => p.id === hash);
      let isActiveProject = true;

      if (!matchedProject) {
        matchedProject = legacyPortfolioData.find((p) => p.id === hash);
        isActiveProject = false;
      }

      if (matchedProject) {
        setSelectedProject(matchedProject);
        if (isActiveProject) {
          const matchedIndex = rawPortfolioData.findIndex((p) => p.id === hash);
          if (matchedIndex !== -1) {
            const currentActiveIndex = activeIndexRef.current;
            const currentVirtualBase = Math.floor(currentActiveIndex / len) * len;
            setActiveIndex(currentVirtualBase + matchedIndex);
          }
        }
      } else {
        setSelectedProject(null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [len]);

  const isFirstRenderRef = useRef(true);

  // Update browser hash/history when selectedProject changes
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (selectedProject) {
      if (window.location.hash !== `#${selectedProject.id}`) {
        window.location.hash = selectedProject.id;
      }
    } else {
      if (window.location.hash) {
        window.history.pushState(
          "",
          document.title,
          window.location.pathname + window.location.search
        );
      }
    }
  }, [selectedProject]);

  // We no longer need separate handleTransitionEnd for snapping
  // But we might want to ensure 'isTransitioning' is set back to true if it was false for dragging
  // actually existing logic just sets it to true on drag end.

  const handleDragStart = (clientX) => {
    stopAutoSlide();
    draggingRef.current = true;
    startXRef.current = clientX;
    setIsTransitioning(false);
    currentTranslateRef.current = getTranslation(activeIndex);
    if (wrapperRef.current) {
      wrapperRef.current.style.pointerEvents = "none";
    }
  };

  const handleDragMove = (clientX) => {
    if (!draggingRef.current) return;
    const delta = clientX - startXRef.current;
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translateX(${currentTranslateRef.current + delta}px)`;
    }
  };

  const handleDragEnd = (clientX) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    
    if (wrapperRef.current) {
      wrapperRef.current.style.pointerEvents = "auto";
    }

    const delta = clientX - startXRef.current;

    // Calculate move count.
    // Dragging left (negative delta) -> move forward (positive index increase)
    let moveCount = Math.round(-delta / itemWidth);

    // Threshold check for small drags
    if (moveCount === 0) {
      if (delta < -SWIPE_THRESHOLD) moveCount = 1;
      else if (delta > SWIPE_THRESHOLD) moveCount = -1;
    }

    setIsTransitioning(true);
    setActiveIndex((prev) => prev + moveCount);

    if (!isHoveringRef.current) startAutoSlide();
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden selection:bg-indigo-500/30">
      {/* 1. Header (Top) */}
      <header className="mt-26 md:my-6 text-center px-4 z-20 flex-none">
        <div
          className={`
          backdrop-blur-sm rounded-4xl inline-block p-4 md:p-6 border 
          ${theme === "dark"
              ? "bg-black/50 border-white/5"
              : "bg-white/50 border-black/5 shadow-xl"
            }
        `}
        >
          <p
            className={`
            text-8xl md:text-9xl font-black mb-0! tracking-tighter bg-clip-text text-transparent uppercase
            ${theme === "dark"
                ? "bg-gradient-to-b from-white to-white/50"
                : "bg-gradient-to-b from-gray-900 to-gray-500"
              }
          `}
          >
            Projects
          </p>
        </div>
      </header>

      {/* 2. Main Center Area (Carousel) */}
      <div className="flex-grow flex flex-col items-center justify-center relative pb-[12rem]">
        <div
          ref={containerRef}
          className="relative h-full touch-none select-none cursor-grab active:cursor-grabbing overflow-hidden"
          style={{
            perspective: "750px",
            width: `${visibleContainerWidth}px`,
            paddingTop: "2rem",
            paddingBottom: "2rem",
          }}
          onMouseEnter={() => {
            isHoveringRef.current = true;
            stopAutoSlide();
          }}
          onMouseLeave={(e) => {
            isHoveringRef.current = false;
            if (draggingRef.current) {
              handleDragEnd(e.clientX);
            } else {
              // Start rotating instantly on hover leave, unless details modal is open
              if (!selectedProject) {
                setActiveIndex((prev) => prev + 1);
                setIsTransitioning(true);
              }
              startAutoSlide();
            }
          }}
          onPointerDown={(e) => {
            if (e.target.closest("button") || e.target.closest("a")) return;
            handleDragStart(e.clientX);
          }}
          onPointerMove={(e) => handleDragMove(e.clientX)}
          onPointerUp={(e) => handleDragEnd(e.clientX)}
        >
          <div
            ref={wrapperRef}
            className="absolute h-full top-0 will-change-transform"
            style={{
              transform: `translateX(${getTranslation(activeIndex)}px)`,
              transition: isTransitioning
                ? "transform 1.5s cubic-bezier(0.23, 1, 0.32, 1)"
                : "none",
              transformStyle: "preserve-3d",
              width: "100%", // Wrapper width doesn't strictly matter as items are absolute, but good for context
            }}
          >
            {visibleIndices.map((virtualIndex) => {
              // Map virtual index to actual data index
              // Handling negative indices correctly: ((i % n) + n) % n
              const dataIndex = ((virtualIndex % len) + len) % len;
              const item = rawPortfolioData[dataIndex];

              return (
                <div
                  key={virtualIndex} // Unique key for virtual index ensures efficient React diffing
                  style={{
                    position: "absolute",
                    left: `${virtualIndex * itemWidth}px`,
                    width: `${cubeWidth}px`,
                    height: `${cubeWidth}px`, // Ensure container has height
                    // We remove gap logic from flex and bake it into position
                  }}
                  className="flex items-center justify-center top-1/2 -translate-y-1/2"
                >
                  <Cube
                    item={item}
                    onViewDetails={setSelectedProject}
                    isScrolling={isTransitioning}
                    width={cubeWidth}
                    height={cubeWidth}
                    onImageOpen={(project) => setFullscreenImage(project)}
                    isVisible={Math.abs(virtualIndex - activeIndex) <= 2}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RE-ENGINEERED ZOOMABLE MODAL */}
      {fullscreenImage &&
        createPortal(
          <FullscreenZoomableImage
            images={fullscreenImage.images || [fullscreenImage.image_url]}
            title={fullscreenImage.title}
            tag={fullscreenImage.tag}
            onClose={() => setFullscreenImage(null)}
          />,
          document.body
        )}
      <DetailCard
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

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
          background-image: ${
            theme === "dark"
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
            inset -${cubeWidth}px -${cubeWidth}px 0 ${theme === "dark" ? "#000" : "#1e293b"}, 
            inset ${cubeWidth}px -${cubeWidth}px 0 ${theme === "dark" ? "#4f46e5" : "#3b82f6"}, 
            inset -${cubeWidth}px ${cubeWidth}px 0 ${theme === "dark" ? "#0891b2" : "#06b6d4"}, 
            inset ${cubeWidth}px ${cubeWidth}px 0 ${theme === "dark" ? "#7c3aed" : "#8b5cf6"};
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

        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default Projects;
