import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Shared Fullscreen Zoomable Image Lightbox Modal
 * Support: pinch-to-zoom, drag-to-pan, wheel-to-zoom, double-click scaling, and arrow keys.
 * Also handles dynamic upscaling of small/logo-like images to prevent tiny renders.
 */
const FullscreenZoomableImage = ({
  images = [],
  initialIndex = 0,
  title = "",
  tag = "",
  onClose,
  theme = "dark",
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialIndex);
  const [showOverlays, setShowOverlays] = useState(true);

  // Refs for gesture handling
  const startPos = useRef({ x: 0, y: 0 });
  const startPinchDist = useRef(null);
  const startScale = useRef(1);
  const idleTimeoutRef = useRef(null);
  const wheelTimeoutRef = useRef(null);
  const touchStartXRef = useRef(null);
  const mainImgRef = useRef(null);

  // Constants
  const minScale = 0.5;
  const maxScale = 2.0;

  // Normalized photos: support string array, object array ({url, alt}), or single image string
  const photos = Array.isArray(images)
    ? images.map((img) => (typeof img === "string" ? img : img.url))
    : [images];

  const captions = Array.isArray(images)
    ? images.map((img) => (typeof img === "string" ? "" : img.alt || ""))
    : [""];

  const [imgStyle, setImgStyle] = useState({
    maxWidth: "90vw",
    maxHeight: "72vh",
    width: "auto",
    height: "auto",
    objectFit: "contain",
  });

  const handleImageLoad = useCallback((e) => {
    const target = e.target || e;
    if (!target) return;
    const { naturalWidth, naturalHeight } = target;
    // Scale up if it is a small image/logo (dimensions under 400px)
    if (naturalWidth > 0 && naturalWidth < 400 && naturalHeight < 400) {
      const scaleFactor = Math.min(2.0, 350 / Math.max(naturalWidth, naturalHeight));
      setImgStyle({
        maxWidth: "90vw",
        maxHeight: "72vh",
        width: `${Math.round(naturalWidth * scaleFactor)}px`,
        height: `${Math.round(naturalHeight * scaleFactor)}px`,
        objectFit: "contain",
      });
    } else {
      setImgStyle({
        maxWidth: "90vw",
        maxHeight: "72vh",
        width: "auto",
        height: "auto",
        objectFit: "contain",
      });
    }
  }, []);

  const switchPhoto = useCallback((index) => {
    const newIndex = (index + photos.length) % photos.length;
    setCurrentPhotoIndex(newIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [photos.length]);

  const resetIdleTimer = useCallback(() => {
    setShowOverlays(true);
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = setTimeout(() => {
      setShowOverlays(false);
    }, 1500);
  }, []);

  // Sync index and check cached completed image
  useEffect(() => {
    setImgStyle({
      maxWidth: "90vw",
      maxHeight: "72vh",
      width: "auto",
      height: "auto",
      objectFit: "contain",
    });

    if (mainImgRef.current && mainImgRef.current.complete) {
      handleImageLoad(mainImgRef.current);
    }
  }, [currentPhotoIndex, handleImageLoad]);

  useEffect(() => {
    resetIdleTimer();

    const handleKeyDown = (e) => {
      if (scale > 1) return; // Only switch if not zoomed
      if (e.key === "ArrowLeft") {
        switchPhoto(currentPhotoIndex - 1);
      } else if (e.key === "ArrowRight") {
        switchPhoto(currentPhotoIndex + 1);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resetIdleTimer, currentPhotoIndex, scale, photos.length, switchPhoto, onClose]);

  const updateScale = (newScale) => {
    let targetScale = newScale;
    const isDecreasing = targetScale < scale;
    const isIncreasing = targetScale > scale;

    if (isDecreasing && targetScale < 1.2 && scale >= 1.2) {
      targetScale = 1.0;
    } else if (isIncreasing && targetScale > 0.8 && scale <= 0.8) {
      targetScale = 1.0;
    }

    const clampedScale = Math.min(Math.max(targetScale, minScale), maxScale);
    setScale(clampedScale);

    if (clampedScale <= 1.05) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (scale > 1.5) {
      updateScale(1);
    } else {
      updateScale(2.0);
    }
  };

  const handleWheel = (e) => {
    e.stopPropagation();
    const delta = -e.deltaY * 0.002;
    updateScale(scale + delta);

    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => {
      if (scale < 1.0 || (scale > 1.0 && scale < 1.2)) {
        updateScale(1.0);
      }
    }, 150);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (scale <= 1) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - startPos.current.x;
    const newY = e.clientY - startPos.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleRelease = () => {
    setIsDragging(false);
    startPinchDist.current = null;
    if (scale < 1.0 || (scale > 1.0 && scale < 1.2)) {
      updateScale(1.0);
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      startPinchDist.current = dist;
      startScale.current = scale;
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        setIsDragging(true);
        startPos.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      } else {
        touchStartXRef.current = e.touches[0].clientX;
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && startPinchDist.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / startPinchDist.current;
      updateScale(startScale.current * factor);
    } else if (e.touches.length === 1 && isDragging) {
      const newX = e.touches[0].clientX - startPos.current.x;
      const newY = e.touches[0].clientY - startPos.current.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = (e) => {
    if (scale === 1 && touchStartXRef.current !== null && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      if (Math.abs(deltaX) > 60) {
        if (deltaX > 0) {
          switchPhoto(currentPhotoIndex - 1);
        } else {
          switchPhoto(currentPhotoIndex + 1);
        }
      }
      touchStartXRef.current = null;
    }
    handleRelease();
  };

  const activeCaption = captions[currentPhotoIndex];

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseMove={resetIdleTimer}
    >
      <div 
        className="relative flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image area */}
        <div
          className="relative group"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <img
            key={currentPhotoIndex}
            ref={mainImgRef}
            src={photos[currentPhotoIndex]}
            alt={title}
            className="block rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 touch-none select-none"
            style={{
              ...imgStyle,
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: scale > 1 ? "grab" : "zoom-in",
              transition: isDragging
                ? "none"
                : "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              zIndex: 10,
            }}
            onLoad={handleImageLoad}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
            draggable={false}
          />

          {/* Left Arrow Button */}
          {photos.length > 1 && scale === 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                switchPhoto(currentPhotoIndex - 1);
              }}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 bg-black/40 hover:bg-black/60 border border-white/20 hover:border-white/40 text-white rounded-full backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 ${
                showOverlays ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
              }`}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Right Arrow Button */}
          {photos.length > 1 && scale === 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                switchPhoto(currentPhotoIndex + 1);
              }}
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 bg-black/40 hover:bg-black/60 border border-white/20 hover:border-white/40 text-white rounded-full backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 ${
                showOverlays ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
              }`}
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Bottom Thumbnail Carousel Overlay */}
          {photos.length > 1 && scale === 1 && (
            <div
              className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3 px-4 py-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${
                showOverlays ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => switchPhoto(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                    idx === currentPhotoIndex
                      ? "border-blue-500 ring-2 ring-blue-500/30 scale-105 shadow-md"
                      : "border-white/20 hover:border-white/50 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Caption below image */}
        {(title || activeCaption || tag) && (
          <div className="text-center max-w-2xl px-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold text-xl uppercase tracking-tight">
              {title}
            </h3>
            {activeCaption ? (
              <p className="text-zinc-300 text-sm mt-1 leading-relaxed">{activeCaption}</p>
            ) : (
              tag && <p className="text-zinc-400 text-xs mt-0.5 uppercase tracking-wider">{tag}</p>
            )}
          </div>
        )}
      </div>

      {/* Close Button — fixed, always visible */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-[10010] flex items-center gap-2 text-white/50 hover:text-white transition-colors group/btn"
      >
        <span className="text-[10px] text-white font-bold uppercase tracking-widest">
          Close Preview
        </span>
        <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full border border-white/20 group-hover/btn:bg-white/20 group-hover/btn:scale-110 transition-all backdrop-blur-md">
          <X size={20} />
        </div>
      </button>
    </div>
  );
};

export default FullscreenZoomableImage;
