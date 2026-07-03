import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Globe, Github, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "./HeaderBackground";
import FullscreenZoomableImage from "./FullscreenZoomableImage";
import { createPortal } from "react-dom";

import { TECH_ICON_MAP } from "../constants/techIcons";

const TechBadge = ({ label, slug, color, iconColor }) => {
  const mapped = TECH_ICON_MAP[label];

  // Colorful URL from map takes priority; fall back to explicit slug prop
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
          className="w-5 h-5 mr-2 shrink-0"
        />
      )}
      <span
        style={{ color: `#${resolvedColor}` }}
        className="text-[13px] font-semibold"
      >
        {label}
      </span>
    </div>
  );
};



/**
 * Main Details Modal Card
 */
const DetailCard = ({ project, onClose }) => {
  if (!project) return null;
  const { theme } = useTheme();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const mainImgRef = useRef(null);

  const [imgStyle, setImgStyle] = useState({
    maxWidth: "100%",
    maxHeight: "42vh",
    width: "auto",
    height: "auto",
    objectFit: "contain",
  });

  const handleMainImageLoad = useCallback((e) => {
    const target = e.target || e;
    if (!target) return;
    const { naturalWidth, naturalHeight } = target;
    // Scale up if it is a small image/logo (dimensions under 400px)
    if (naturalWidth > 0 && naturalWidth < 400 && naturalHeight < 400) {
      const scale = Math.min(2.0, 350 / Math.max(naturalWidth, naturalHeight));
      setImgStyle({
        maxWidth: "100%",
        maxHeight: "42vh",
        width: `${Math.round(naturalWidth * scale)}px`,
        height: `${Math.round(naturalHeight * scale)}px`,
        objectFit: "contain",
      });
    } else {
      setImgStyle({
        maxWidth: "100%",
        maxHeight: "42vh",
        width: "auto",
        height: "auto",
        objectFit: "contain",
      });
    }
  }, []);

  // Reset active image index whenever a different project is loaded
  useEffect(() => {
    setActiveImageIndex(0);
  }, [project.id]);

  // Reset styles on image index/project change and immediately check cache (.complete)
  useEffect(() => {
    setImgStyle({
      maxWidth: "100%",
      maxHeight: "42vh",
      width: "auto",
      height: "auto",
      objectFit: "contain",
    });

    if (mainImgRef.current && mainImgRef.current.complete) {
      handleMainImageLoad(mainImgRef.current);
    }
  }, [activeImageIndex, project.id, handleMainImageLoad]);

  // Dynamic SEO Link Preview Metadata (Open Graph / Twitter Cards)
  useEffect(() => {
    const originalTitle = document.title;
    const getMeta = (selector) => document.querySelector(selector)?.getAttribute("content") || "";
    
    const originalDesc = getMeta('meta[name="description"]');
    const originalOgTitle = getMeta('meta[property="og:title"]');
    const originalOgDesc = getMeta('meta[property="og:description"]');
    const originalOgImg = getMeta('meta[property="og:image"]');
    const originalOgUrl = getMeta('meta[property="og:url"]');
    const originalTwTitle = getMeta('meta[name="twitter:title"]');
    const originalTwDesc = getMeta('meta[name="twitter:description"]');
    const originalTwImg = getMeta('meta[name="twitter:image"]');

    const setMeta = (nameOrProperty, content) => {
      const isProperty = nameOrProperty.startsWith("og:");
      const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) {
          el.setAttribute("property", nameOrProperty);
        } else {
          el.setAttribute("name", nameOrProperty);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content || "");
    };

    // Update tab title
    document.title = `${project.title} | Priyanshu Sah`;

    // Resolve absolute image path
    let absoluteImgUrl = "";
    const rawImg = project.image_url || project.images?.[0];
    if (rawImg) {
      const normalizedPath = rawImg.replace(/^\.\.\//, "/").replace(/^\.\//, "/");
      absoluteImgUrl = new URL(normalizedPath, window.location.origin).href;
    }

    const descContent = project.tagline || project.description;

    // Apply project specific tags
    setMeta("description", descContent);
    setMeta("og:title", project.title);
    setMeta("og:description", descContent);
    setMeta("og:url", window.location.href);
    if (absoluteImgUrl) setMeta("og:image", absoluteImgUrl);

    setMeta("twitter:title", project.title);
    setMeta("twitter:description", descContent);
    if (absoluteImgUrl) setMeta("twitter:image", absoluteImgUrl);

    return () => {
      document.title = originalTitle;
      setMeta("description", originalDesc);
      setMeta("og:title", originalOgTitle);
      setMeta("og:description", originalOgDesc);
      setMeta("og:url", originalOgUrl);
      setMeta("og:image", originalOgImg);
      setMeta("twitter:title", originalTwTitle);
      setMeta("twitter:description", originalTwDesc);
      setMeta("twitter:image", originalTwImg);
    };
  }, [project]);

  const photos = project.images || [project.image_url];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300 ${
        theme === "dark" ? "bg-black/80" : "bg-zinc-900/40"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-5xl h-[85vh] border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 transition-colors ${
          theme === "dark"
            ? "bg-zinc-950 border-zinc-800 text-zinc-200"
            : "bg-white border-zinc-200 text-zinc-800"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* FIXED HEADER */}
        <header
          className={`p-6 pb-4 border-b flex justify-between items-start transition-colors flex-shrink-0 ${
            theme === "dark"
              ? "border-zinc-800/50 bg-gradient-to-b from-zinc-900/20 to-transparent"
              : "border-zinc-200 bg-zinc-50/50"
          }`}
        >
          <div>
            <h1
              className={`text-2xl font-bold tracking-tight mb-1 ${
                theme === "dark" ? "text-white" : "text-zinc-900"
              }`}
            >
              {project.title}
            </h1>
            <p
              className={`text-[15px] font-medium max-w-3xl ${
                theme === "dark" ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              {project.tagline}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`transition-all p-2 rounded-xl flex-shrink-0 ${
              theme === "dark"
                ? "text-zinc-500 hover:text-white hover:bg-zinc-800"
                : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <X size={20} />
          </button>
        </header>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* SINGLE COLUMN LAYOUT FOR EXTENDED CONTENT FLOW */}
          <div className="space-y-8">
            {/* 1. SCREENSHOT GALLERY (Centered with max-width limit on desktop) */}
            <div className="max-w-3xl mx-auto space-y-4">
              <div
                className="w-full rounded-xl overflow-hidden relative cursor-pointer group flex items-center justify-center"
                onClick={() => setShowFullscreen(true)}
              >
                <img
                  key={activeImageIndex}
                  ref={mainImgRef}
                  src={photos[activeImageIndex]}
                  alt={`${project.title} preview`}
                  className="relative z-10 block mx-auto transition-transform duration-500 group-hover:scale-[1.02] select-none rounded-lg"
                  style={imgStyle}
                  onLoad={handleMainImageLoad}
                />

                {/* Hover Zoom Icon */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 rounded-lg">
                  <div className="bg-black/50 backdrop-blur-md border border-white/20 p-3 rounded-full text-white scale-90 group-hover:scale-100 transition-all duration-300">
                    <ZoomIn size={24} />
                  </div>
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-3 justify-center overflow-x-auto pb-2 scrollbar-thin">
                  {photos.map((photo, index) => {
                    const isActive = index === activeImageIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative w-20 aspect-video rounded-lg overflow-hidden border-2 shrink-0 transition-all duration-200 active:scale-95 ${
                          isActive
                            ? "border-purple-500 ring-2 ring-purple-500/20 scale-102 shadow-md"
                            : theme === "dark"
                              ? "border-zinc-800 opacity-60 hover:opacity-100"
                              : "border-zinc-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`View ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. DETAILS LAYOUT: PURE VERTICAL FLOW */}
            <div className="space-y-6 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/80">
              {/* Tech Stack section */}
              <div className="space-y-3">
                <h3
                  className={`text-xs font-bold uppercase tracking-widest ${
                    theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <TechBadge
                      key={tech.name}
                      slug={tech.slug}
                      label={tech.name}
                      iconColor={tech.iconColor}
                      color={tech.color}
                    />
                  ))}
                </div>
              </div>

              {/* Highlights section */}
              <div className="space-y-3">
                <h3
                  className={`text-xs font-bold uppercase tracking-widest ${
                    theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Key Highlights
                </h3>
                <ul className="space-y-3">
                  {project.highlights.map((item, index) => (
                    <li
                      key={index}
                      className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all ${
                        theme === "dark"
                          ? "bg-zinc-900/30 border-zinc-800/60 text-zinc-300 hover:border-zinc-700 hover:text-white"
                          : "bg-zinc-50/50 border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                          theme === "dark"
                            ? "bg-purple-400 shadow-[0_0_8px_#a855f7]"
                            : "bg-purple-600"
                        }`}
                      />
                      <span className="text-[14px] leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* BOTTOM COLUMN: DETAILED MARKDOWN DESCRIPTION */}
          <div
            className={`pt-6 border-t ${
              theme === "dark" ? "border-zinc-800/80" : "border-zinc-200"
            }`}
          >
            <h3
              className={`text-xs font-bold uppercase tracking-widest mb-4 ${
                theme === "dark" ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Detailed Case Study
            </h3>
            <div className="markdown-content" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ node, src, alt }) => {
                    // Convert absolute /assets/ paths to relative ../assets/ paths
                    // (same format used by the image carousel) and decode %20 spaces
                    const resolvedSrc = src?.startsWith("/assets/")
                      ? decodeURIComponent(src.replace("/assets/", "../assets/"))
                      : src;
                    return (
                      <img
                        src={resolvedSrc}
                        alt={alt || ""}
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          borderRadius: "0.5rem",
                          marginTop: "1rem",
                          marginBottom: "0.5rem",
                          border: `1px solid ${theme === "dark" ? "#27272a" : "#e4e4e7"}`,
                          display: "block",
                        }}
                      />
                    );
                  },
                }}
              >
                {project.markdown || project.description}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* FIXED FOOTER */}
        <footer
          className={`p-6 border-t flex gap-4 transition-colors flex-shrink-0 ${
            theme === "dark"
              ? "border-zinc-800/50 bg-zinc-950/60"
              : "border-zinc-200 bg-zinc-50/60"
          }`}
        >
          {project.links.github_link || project.links.live_link ? (
            <>
              {project.links.github_link && (
                <button
                  onClick={() =>
                    window.open(project.links.github_link, "_blank")
                  }
                  className={`flex-1 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 border active:scale-[0.98] cursor-pointer ${
                    theme === "dark"
                      ? "bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-800"
                      : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-sm"
                  }`}
                >
                  <Github size={18} />
                  <span>GitHub</span>
                </button>
              )}
              {project.links.live_link && (
                <button
                  onClick={() => window.open(project.links.live_link, "_blank")}
                  className={`flex-[2] font-semibold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer ${
                    theme === "dark"
                      ? "bg-white hover:bg-zinc-200 text-black shadow-white/5"
                      : "bg-zinc-900 hover:bg-black text-white shadow-zinc-200"
                  }`}
                >
                  <Globe size={18} />
                  <span>Visit Project</span>
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col justify-center text-center w-full space-y-1 py-1">
              <div
                className={`font-bold text-[16px] tracking-wide ${
                  theme === "dark" ? "text-zinc-300" : "text-zinc-700"
                }`}
              >
                {project.privateProject?.title || "🔒 Private Client Project"}
              </div>
              <div
                className={`text-[13px] whitespace-pre-line ${
                  theme === "dark" ? "text-zinc-500" : "text-zinc-500"
                }`}
              >
                {project.privateProject?.description ||
                  "Source code and deployment details are private."}
              </div>
            </div>
          )}
        </footer>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL - Portal to document.body to escape transform stacking context */}
      {showFullscreen &&
        createPortal(
          <FullscreenZoomableImage
            images={photos}
            initialIndex={activeImageIndex}
            title={project.title}
            onClose={() => setShowFullscreen(false)}
          />,
          document.body
        )}

      {/* CSS STYLING FOR CUSTOM SCROLLBAR & PROSE-LIKE MARKDOWN RENDERING */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === "dark" ? "#27272a" : "#e4e4e7"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === "dark" ? "#3f3f46" : "#d4d4d8"};
        }

        /* CUSTOM MARKDOWN STYLES */
        .markdown-content {
          line-height: 1.625;
          font-size: 15px;
        }
        .markdown-content h2 {
          font-size: 17px;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: ${theme === "dark" ? "#ffffff" : "#18181b"};
        }
        .markdown-content h2:first-child {
          margin-top: 0;
        }
        .markdown-content h3 {
          font-size: 16px;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: ${theme === "dark" ? "#ffffff" : "#18181b"};
        }
        .markdown-content h3:first-child {
          margin-top: 0;
        }
        .markdown-content hr {
          border: none;
          border-top: 1px solid ${theme === "dark" ? "#27272a" : "#e4e4e7"};
          margin: 1.75rem 0;
        }
        .markdown-content p {
          margin-bottom: 1rem;
          color: ${theme === "dark" ? "#d4d4d8" : "#4b5563"};
        }
        .markdown-content ul {
          list-style-type: disc !important;
          padding-left: 1.75rem !important;
          margin-bottom: 1.25rem;
          color: ${theme === "dark" ? "#d4d4d8" : "#4b5563"};
        }
        .markdown-content ol {
          list-style-type: decimal !important;
          padding-left: 1.75rem !important;
          margin-bottom: 1.25rem;
          color: ${theme === "dark" ? "#d4d4d8" : "#4b5563"};
        }
        .markdown-content li {
          margin-bottom: 0.375rem;
        }
        .markdown-content strong {
          font-weight: 600;
          color: ${theme === "dark" ? "#ffffff" : "#18181b"};
        }
        .markdown-content code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 13.5px;
          padding: 0.15rem 0.35rem;
          border-radius: 0.25rem;
          background: ${theme === "dark" ? "#18181b" : "#f4f4f5"};
          color: ${theme === "dark" ? "#d8b4fe" : "#7c3aed"};
          border: 1px solid ${theme === "dark" ? "#27272a" : "#e4e4e7"};
        }
        .markdown-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          border: 1px solid ${theme === "dark" ? "#27272a" : "#e4e4e7"};
          display: block;
        }
        .markdown-content em {
          display: block;
          font-size: 13px;
          font-style: italic;
          color: ${theme === "dark" ? "#71717a" : "#9ca3af"};
          margin-bottom: 1.5rem;
          text-align: center;
        }
      `,
        }}
      />
    </div>
  );
};

export default DetailCard;
