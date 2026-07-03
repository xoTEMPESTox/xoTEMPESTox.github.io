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
import { useTheme } from "../components/HeaderBackground";

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

// --- Data ---
const rawPortfolioData = [
  {
    id: "liferythm-ai-doctor",
    title: "Healthcare AI Platform",
    tagline: "End-to-end AI platform for community healthcare and clinical automation",
    description: "End-to-end healthcare AI platform combining Medical LLMs, LangGraph workflows, React Native applications, FastAPI microservices, and Bluetooth-enabled medical device integrations. Designed to streamline community healthcare through patient triage, AI-assisted clinical documentation, intelligent reception, and proactive follow-up workflows.",
    image_url: "../assets/images/projects/liferythm/main.png",
    tag: "Healthcare AI",
    highlights: [
      "Built AI Receptionist, Clinical Documentation, patient triage, and Follow-Up workflows using Medical LLMs",
      "Developed FastAPI microservices and LangGraph orchestration powering production healthcare workflows",
      "Integrated Bluetooth medical device SDKs with React Native applications for connected diagnostics",
      "Contributed across architecture, deployment, model evaluation, and production AI workflows",
    ],
    techStack: [
      { name: "FastAPI", slug: "logos/fastapi", color: "009688", iconColor: "" },
      { name: "LangChain", slug: "logos/python", color: "3776AB", iconColor: "" },
      { name: "LangGraph", slug: "logos/python", color: "3776AB", iconColor: "" },
      { name: "Firebase", slug: "logos/firebase", color: "FFCA28", iconColor: "" },
    ],
    links: { github_link: "", live_link: "" },
    privateProject: {
      title: "🔒 Proprietary Healthcare System",
      description: "Built under internship agreement.\nSource code and deployment details are private.",
    },
  },
  {
    id: "pokedreamer-rl",
    title: "PokeDreamer",
    tagline: "Dreamer-style world models for model-based reinforcement learning",
    description: "Research project exploring Dreamer-style world models for model-based reinforcement learning. Focused on learning latent environment dynamics, improving long-horizon prediction, and reducing compounding errors during imagination rollouts.",
    image_url: "../assets/images/projects/pokedreamer/main.png",
    tag: "AI Research",
    highlights: [
      "Engineered a discrete native-resolution Recurrent State-Space Model (RSSM)",
      "Implemented a VAE+GRU dynamics baseline with continuous latent MPC planners",
      "Executed scheduled-sampling ablation studies to evaluate predictive accuracy",
      "Analyzed and mitigated latent imagination drift for stable RL environments",
    ],
    techStack: [
      { name: "PyTorch", slug: "logos/pytorch", color: "EE4C2C", iconColor: "" },
      { name: "Python", slug: "logos/python", color: "3776AB", iconColor: "" },
      { name: "NumPy", slug: "logos/numpy", color: "013243", iconColor: "" },
    ],
    links: {
      github_link: "https://github.com/xoTEMPESTox/PokeDreamer",
      live_link: "https://pokedreamer.priyanshusah.com/",
    },
  },
  {
    id: "navdp-robotics",
    title: "NavDP Sandbox",
    tagline: "Navigation Diffusion Policy extension for omni-directional robotics",
    description: "Academic research fork extending the official Navigation Diffusion Policy (NavDP) framework. Solves simulation-to-reality gaps through custom omni-directional hardware integration and physics optimization.",
    image_url: "../assets/images/projects/navdp/main.png",
    tag: "Sim-to-Real Robotics",
    highlights: [
      "Integrated a custom LeKiwi 3-wheeled omni-directional robot into the pipeline",
      "Programmatically re-engineered and fixed broken USD collision geometries",
      "Resolved NaN simulation explosions via actuator gain and physics tuning",
      "Developed custom multi-perspective tools (BEV/3rd-Person) for path evaluation",
    ],
    techStack: [
      { name: "Python", slug: "logos/python", color: "3776AB", iconColor: "" },
      { name: "Robotics", slug: "logos/ros", color: "22314E", iconColor: "" },
      { name: "Simulation", slug: "logos/nvidia", color: "76B900", iconColor: "" },
    ],
    links: {
      github_link: "https://github.com/xoTEMPESTox/NavDP",
      live_link: "https://navdp.priyanshusah.com/",
    },
  },
  {
    id: "enerzal",
    title: "Enerzal Enterprise Assistant",
    tagline: "Scalable RAG and tool-calling agent for IT/HR automation",
    description: "Secure, highly-customizable enterprise AI assistant designed to automate repetitive internal queries. Replaces traditional IT/HR support channels with a real-time, document-aware generative interface.",
    image_url: "../assets/images/projects/enerzal/main.png",
    tag: "Enterprise AI",
    highlights: [
      "Architected dynamic Graph-based RAG pipelines handling relationship-based data",
      "Automated PDF/DOCX parsing routines, achieving sub-8-second retrieval latency",
      "Engineered real-time tool calling integrations with personalized employee dashboards",
      "Secured localized deployments utilizing strict 2FA (TOTP) access management flows",
    ],
    techStack: [
      { name: "Python", slug: "logos/python", color: "3776AB", iconColor: "" },
      { name: "OpenAI", slug: "logos/openai-icon", color: "888888", iconColor: "invert" },
      { name: "React", slug: "logos/react", color: "61DAFB", iconColor: "" },
      { name: "PostgreSQL", slug: "logos/postgresql", color: "4169E1", iconColor: "" },
    ],
    links: {
      github_link: "https://github.com/xoTEMPESTox/Enerzal",
      live_link: "https://www.youtube.com/watch?v=azj_7OdSxcY",
    },
  },
  {
    id: "tv-plus",
    title: "TradingViewPlus",
    tagline: "TypeScript browser extension for 300+ active traders",
    description: "A major open-source enhancement suite for the TradingView ecosystem, actively used by 300+ traders. Contributing major feature releases, adapter-based support for TradingView-powered platforms, architectural improvements, and ongoing maintenance as a project maintainer.",
    image_url: "../assets/images/projects/tv-plus/main.jpg",
    tag: "Open Source",
    highlights: [
      "Contributed 20+ pull requests and resolved 30+ GitHub issues",
      "Designed an adapter-based architecture supporting multiple TradingView-powered platforms",
      "Shipped major feature releases and performance improvements as project maintainer",
      "Continue maintaining and evolving the project alongside the open-source community",
    ],
    techStack: [
      { name: "TypeScript", slug: "logos/typescript-icon", color: "3178C6", iconColor: "" },
      { name: "JavaScript", slug: "logos/javascript", color: "F7DF1E", iconColor: "" },
      { name: "Chrome", slug: "logos/chrome", color: "4285F4", iconColor: "" },
    ],
    links: {
      github_link: "https://github.com/xoTEMPESTox/TradingviewPlus",
      live_link: "https://chromewebstore.google.com/detail/tradingviewplus/pkcgjgllebhppgegpedlhjmabmnpcpec?hl=en&authuser=0",
    },
  },
  {
    id: "creo-sts-chatbot",
    title: "STS Chatbot",
    tagline: "Speech-to-speech AI architecture for real-time reasoning",
    description: "An end-to-end speech-to-speech (STS) conversational agent built to handle complex, real-time audio interactions with an emphasis on low-latency inference and high concurrency.",
    image_url: "../assets/images/projects/creo/main.jpg",
    tag: "Voice AI",
    highlights: [
      "Led end-to-end engineering of natural language processing and agentic AI reasoning loops",
      "Designed advanced Voice+LLM pipelines to minimize audio-to-text-to-audio latency",
      "Deployed scalable API endpoints engineered explicitly for high concurrency workloads",
      "Integrated live Retrieval-Augmented Generation (RAG) directly into the voice stream",
    ],
    techStack: [
      { name: "FastAPI", slug: "logos/fastapi", color: "009688", iconColor: "" },
      { name: "LangChain", slug: "logos/python", color: "3776AB", iconColor: "" },
      { name: "Python", slug: "logos/python", color: "3776AB", iconColor: "" },
    ],
    links: { github_link: "", live_link: "" },
    privateProject: {
      title: "🔒 Client Project",
      description: "Built during internship engagement.\nRepository and production environment are private.",
    },
  },
  {
    id: "eco-chain",
    title: "Eco Chain",
    tagline: "Full-stack Web3 marketplace for carbon credit tokenization",
    description: "A decentralized full-stack application (DApp) structured to bring transparency and automated trading to environmental assets. Designed specifically to reduce double-counting in carbon markets.",
    image_url: "../assets/images/projects/eco-chain/main.png",
    tag: "Web3 Ecosystem",
    highlights: [
      "Programmed Ethereum smart contracts via Solidity for secure ERC-20 tokenization",
      "Architected a responsive MERN-stack frontend bridging traditional UI with Web3 protocols",
      "Integrated MetaMask flows for secure, decentralized user authentication and signing",
      "Automated decentralized funding ledgers to drastically improve market transparency",
    ],
    techStack: [
      { name: "Solidity", slug: "skill-icons/solidity", color: "888888", iconColor: "" },
      { name: "Ethereum", slug: "logos/ethereum", color: "888888", iconColor: "" },
      { name: "Node.js", slug: "logos/nodejs-icon", color: "339933", iconColor: "" },
      { name: "MongoDB", slug: "logos/mongodb-icon", color: "47A248", iconColor: "" },
    ],
    links: {
      github_link: "https://github.com/xoTEMPESTox/EcoChain",
      live_link: "https://eco-chain-ashen.vercel.app/",
    },
  },
  {
    id: "wakebot32",
    title: "WakeBot32",
    tagline: "Low-power IoT automation tool with secure remote access",
    description: "A practical, lightweight C++ hardware application utilizing an ESP32 microcontroller. Circumvents the need for heavy local servers by acting as a dedicated, secure bridge for remote PC wake commands.",
    image_url: "../assets/images/projects/wakebot32/main.jpg",
    tag: "IoT & Hardware",
    highlights: [
      "Engineered robust, low-power ESP32 hardware memory interactions using C++",
      "Implemented a secure, user-authenticated polling bridge utilizing the Telegram API",
      "Constructed and deployed network-level Wake-on-LAN (WOL) magic packets",
      "Designed an automated hardware-reboot architecture to guarantee long-term stability",
    ],
    techStack: [
      { name: "C++", slug: "logos/c-plusplus", color: "00599C", iconColor: "" },
      { name: "ESP32", slug: "simple-icons/espressif", color: "888888", iconColor: "invert" },
      { name: "Telegram", slug: "logos/telegram", color: "26A5E4", iconColor: "" },
      { name: "Arduino", slug: "logos/arduino", color: "00979D", iconColor: "" },
    ],
    links: {
      github_link: "https://github.com/xoTEMPESTox/WakeBot32",
      live_link: "https://youtu.be/fOirqvQiiFo",
    },
  }
];

const legacyPortfolioData = [
  {
    id: "supplyzal",
    title: "Supplyzal",
    tagline: "Blockchain-based supply tracking with verified sustainability",
    description: "Blockchain-based supply tracking with verified sustainability.",
    image_url: "../assets/images/projects/supplyzal/main.png",
    tag: "Web3 & Logistics",
    highlights: [
      "Designed and deployed smart contracts for tracking product history on-chain",
      "Created a web dashboard to verify product origin and sustainability claims",
    ],
    techStack: [
      { name: "Solidity", slug: "skill-icons/solidity", color: "888888", iconColor: "" },
      { name: "React", slug: "logos/react", color: "61DAFB", iconColor: "" },
    ],
    links: {
      github_link: "https://github.com/xoTEMPESTox/Supplyzal",
      live_link: "https://www.youtube.com/watch?v=CEGqZsqdnN8",
    }
  },
  {
    id: "ledgerplay",
    title: "LedgerPlay",
    tagline: "ERC20 based Staking Logic with Web socket based Multiplayer",
    description: "ERC20 based Staking Logic with Web socket based Multiplayer.",
    image_url: "../assets/images/projects/ledgerplay/main.png",
    tag: "WebSockets & DeFi",
    highlights: [
      "Implemented ERC20-based token staking smart contracts for multiplayer game wagering",
      "Built a real-time web socket server to handle multiplayer game sessions",
    ],
    techStack: [
      { name: "Node.js", slug: "logos/nodejs-icon", color: "339933", iconColor: "" },
      { name: "WebSockets", slug: "logos/websocket", color: "888888", iconColor: "" },
      { name: "Ethereum", slug: "logos/ethereum", color: "888888", iconColor: "" },
    ],
    links: {
      github_link: "https://github.com/xoTEMPESTox/LedgerPlay",
      live_link: "https://www.youtube.com/watch?v=w-SHifenCqE",
    }
  },
  {
    id: "kaggle-comp",
    title: "ML Kaggle Competition",
    tagline: "Hosted a Kaggle Competition under TCET ACM SIG AI 2025",
    description: "Hosted a Kaggle Competition under TCET ACM SIG AI 2025.",
    image_url: "../assets/images/projects/kaggle-comp/main.png",
    tag: "Machine Learning",
    highlights: [
      "Co-organized and hosted a machine learning competition for 100+ participants",
      "Designed clean evaluation datasets and competition baselines",
    ],
    techStack: [
      { name: "Kaggle", slug: "logos/kaggle", color: "20BEFF", iconColor: "" },
      { name: "Python", slug: "logos/python", color: "3776AB", iconColor: "" },
    ],
    links: {
      github_link: "https://github.com/xoTEMPESTox/TCET_ACM_SIGAI_KAGGLE_COMP",
      live_link: "https://www.kaggle.com/competitions/acm-sigai-tcet",
    }
  },
  {
    id: "portfolio-website",
    title: "Portfolio Website",
    tagline: "Personal portfolio website built with quality and performance in mind",
    description: "Personal portfolio website built with React, Vite, and Tailwind CSS. Designed to showcase projects, experience, skills, and interactive components like a 3D portfolio carousel.",
    image_url: "../assets/images/projects/portfolio-website/main.png",
    tag: "Frontend & Design",
    highlights: [
      "Implemented a custom 3D carousel using CSS 3D transforms",
      "Optimized assets and load times for high performance and clean SEO scores",
    ],
    techStack: [
      { name: "React", slug: "logos/react", color: "61DAFB", iconColor: "" },
      { name: "Vite", slug: "logos/vite", color: "646CFF", iconColor: "" },
    ],
    links: {
      github_link: "https://github.com/xoTEMPESTox/Portfolio",
      live_link: "https://priyanshusah.com",
    }
  }
];

/**
 * Enhanced Fullscreen Image Modal
 * Features: Pinch-to-zoom, Drag-to-pan, Wheel-to-zoom
 * Layout: Strictly adheres to user request
 */
const FullscreenZoomableImage = ({ image, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showOverlays, setShowOverlays] = useState(true);

  // Refs for gesture handling
  const startPos = useRef({ x: 0, y: 0 });
  const startPinchDist = useRef(null);
  const startScale = useRef(1);
  const idleTimeoutRef = useRef(null);
  const wheelTimeoutRef = useRef(null);
  const touchStartXRef = useRef(null);

  // Constants
  const minScale = 0.5;
  const maxScale = 2.0;

  const photos = image.images && image.images.length > 0
    ? image.images
    : [image.image_url];

  const switchPhoto = (index) => {
    const newIndex = (index + photos.length) % photos.length;
    setCurrentPhotoIndex(newIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const resetIdleTimer = useCallback(() => {
    setShowOverlays(true);
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = setTimeout(() => {
      setShowOverlays(false);
    }, 1500);
  }, []);

  useEffect(() => {
    resetIdleTimer();

    const handleKeyDown = (e) => {
      if (scale > 1) return; // Only switch if not zoomed
      if (e.key === "ArrowLeft") {
        switchPhoto(currentPhotoIndex - 1);
      } else if (e.key === "ArrowRight") {
        switchPhoto(currentPhotoIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resetIdleTimer, currentPhotoIndex, scale, photos.length]);

  const updateScale = (newScale) => {
    let targetScale = newScale;
    
    // Check direction of scaling relative to current scale
    const isDecreasing = targetScale < scale;
    const isIncreasing = targetScale > scale;

    // Apply snap rules:
    // 1. Zooming out (decreasing) snaps from 1.2 to 1.0
    if (isDecreasing && targetScale < 1.2 && scale >= 1.2) {
      targetScale = 1.0;
    }
    // 2. Zooming back in (increasing) from a zoomed-out state snaps from 0.8 to 1.0
    else if (isIncreasing && targetScale > 0.8 && scale <= 0.8) {
      targetScale = 1.0;
    }

    const clampedScale = Math.min(Math.max(targetScale, minScale), maxScale);
    setScale(clampedScale);

    // If returning to 1 or below 1.05, recenter position
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

  // --- MOUSE EVENTS ---
  const handleWheel = (e) => {
    e.stopPropagation();
    const delta = -e.deltaY * 0.002;
    updateScale(scale + delta);

    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current);
    }
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

  const handleMouseUp = () => {
    handleRelease();
  };

  // --- TOUCH EVENTS (Pinch & Pan) ---
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch Start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      startPinchDist.current = dist;
      startScale.current = scale;
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        // Pan Start
        setIsDragging(true);
        startPos.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      } else {
        // Track start X for swipe gestures at scale === 1
        touchStartXRef.current = e.touches[0].clientX;
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && startPinchDist.current) {
      // Pinch Move
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const zoomFactor = dist / startPinchDist.current;
      updateScale(startScale.current * zoomFactor);
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Pan Move
      const newX = e.touches[0].clientX - startPos.current.x;
      const newY = e.touches[0].clientY - startPos.current.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = (e) => {
    // Swipe detection when scale is 1
    if (scale === 1.0 && touchStartXRef.current !== null && e.changedTouches && e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const SWIPE_THRESHOLD = 50; // px
      if (deltaX > SWIPE_THRESHOLD) {
        // Swipe Right -> Previous photo
        switchPhoto(currentPhotoIndex - 1);
      } else if (deltaX < -SWIPE_THRESHOLD) {
        // Swipe Left -> Next photo
        switchPhoto(currentPhotoIndex + 1);
      }
    }
    touchStartXRef.current = null;
    handleRelease();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
      onMouseMove={resetIdleTimer}
    >
      <div
        className="relative flex flex-col items-center justify-center max-w-[95vw] max-h-[60vh] animate-in zoom-in-95 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* The Image - Scaled to 80% screen height */}
        <div className="relative group">
          <img
            src={photos[currentPhotoIndex]}
            alt={image.title}
            className="md:h-[60vh] h-auto w-auto max-w-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 touch-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: scale > 1 ? "grab" : "zoom-in",
              transition: isDragging
                ? "none"
                : "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              zIndex: 10,
            }}
            // Handlers
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
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
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

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

        {/* Bottom Caption Area */}
        <div className="mt-6 text-center">
          <h3 className="text-white font-bold text-2xl uppercase tracking-tight">
            {image.title}
          </h3>
          <p className="text-zinc-400 text-lg mt-1">{image.tag}</p>
        </div>
      </div>
    </div>
  );
};

const Portfolio = () => {
  const [selectedProject, setSelectedProject] = useState(null);
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
  const [activeIndex, setActiveIndex] = useState(len * 100);

  const [isDragging, setIsDragging] = useState(false);
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
    if (isHoveringRef.current) return;
    autoSlideRef.current = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
      setIsTransitioning(true);
    }, AUTO_SLIDE_DELAY);
  }, [stopAutoSlide]);

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    startAutoSlide();
    return stopAutoSlide;
  }, [startAutoSlide, stopAutoSlide]);

  // Handle initial hash check on mount and browser back/forward navigation
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) {
        setSelectedProject(null);
        return;
      }

      // Check rawPortfolioData first (active projects)
      let matchedProject = rawPortfolioData.find((p) => p.id === hash);
      let isActiveProject = true;

      // If not found in active, check legacyPortfolioData
      if (!matchedProject) {
        matchedProject = legacyPortfolioData.find((p) => p.id === hash);
        isActiveProject = false;
      }

      if (matchedProject) {
        setSelectedProject(matchedProject);

        // Snap active carousel index if it's an active project in the carousel
        if (isActiveProject) {
          const matchedIndex = rawPortfolioData.findIndex((p) => p.id === hash);
          if (matchedIndex !== -1) {
            const currentActiveIndex = activeIndexRef.current;
            const currentVirtualBase = Math.floor(currentActiveIndex / len) * len;
            const targetActiveIndex = currentVirtualBase + matchedIndex;
            setActiveIndex(targetActiveIndex);
          }
        }
      } else {
        setSelectedProject(null);
      }
    };

    // Check on mount
    handleHashCheck();

    // Listen for history/hash changes
    window.addEventListener("hashchange", handleHashCheck);
    return () => {
      window.removeEventListener("hashchange", handleHashCheck);
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
    setIsDragging(true);
    startXRef.current = clientX;
    setIsTransitioning(false);
    currentTranslateRef.current = getTranslation(activeIndex);
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
    setIsDragging(false);

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
            Portfolio
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
            if (draggingRef.current) handleDragEnd(e.clientX);
            else startAutoSlide();
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
                    isDragging={isDragging}
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
      {fullscreenImage && (
        <FullscreenZoomableImage
          image={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
      <DetailCard
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <style>{`
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default Portfolio;
