import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import "../styles/main.css";
import TimelineCard from "../components/TimelineCard";
import { useTheme } from "../components/HeaderBackground";

const educationData = [
  {
    image: "../assets/images/journey/education.png",
    title: "B.Tech Honors in CS (AI & ML Specialization)",
    subtitle: "University of Mumbai",
    description:
      "Studying AI and ML with focus on deep learning and systems design. Specializing in neural networks, computer vision, and scalable AI infrastructure.",
    date: "2022 - 2026",
    tag: "Undergrad",
    type: "edu",
  },
];

const experienceData = [
  {
    image: "../assets/images/journey/liferythem.jpg",
    title: "Full-Stack AI Engineer",
    subtitle: "Liferythem Healthcare",
    description:
      "Building an end-to-end healthcare AI platform spanning AI Receptionists, Clinical Documentation, patient triage, Follow-Up automation, Medical LLMs, LangGraph workflows, FastAPI microservices, React Native, and Bluetooth-enabled medical device integrations.",
    date: "Jul 2025 - Present",
    tag: "Full-Time",
    type: "exp",
  },
  {
    image: "../assets/images/journey/tcs.jpg",
    title: "Project Intern",
    subtitle: "Tata Consultancy Services",
    description:
      "Worked in an exploratory engineering team evaluating emerging concepts through early POT efforts. Contributed to feasibility studies, architecture discussions, system integrations, and validation reviews.",
    date: "Nov 2025 - Jan 2026",
    tag: "Internship",
    type: "exp",
  },
  {
    image: "../assets/images/journey/myshadowlife.png",
    title: "Audio Data and AI/ML Engineer",
    subtitle: "MyShadowLife",
    description:
      "Engineered end-to-end audio data pipelines for long-form recordings, applied preprocessing for denoising and segmentation, and prepared structured datasets for downstream ML tasks.",
    date: "Oct 2025 - Nov 2025",
    tag: "Contract",
    type: "exp",
  },
  {
    image: "../assets/images/journey/creo.jpg",
    title: "Full-Stack AI Engineer Intern",
    subtitle: "Creo AI",
    description:
      "Built an STS chatbot using RAG, agentic AI, and voice pipelines for real-time reasoning. Designed scalable APIs and contributed to production-grade reliability.",
    date: "Mar 2025 - Aug 2025",
    tag: "Internship",
    type: "exp",
  },
  {
    image: "../assets/images/journey/web3galaxy.png",
    title: "Full-Stack AI Engineer Intern",
    subtitle: "Web3Galaxy",
    description:
      "Delivered a multimodal chatbot with STT, TTS, and document parsing. Implemented multilingual and location-aware support with secure, low-latency deployment.",
    date: "Dec 2024 - Feb 2025",
    tag: "Internship",
    type: "exp",
  },
  {
    image: "../assets/images/journey/chart_raiders.jpg",
    title: "Software Developer Intern",
    subtitle: "Chart Raiders",
    description:
      "Built an AI-powered trading assistant using LangChain and VectorDBs. Fine-tuned SLMs, created synthetic Q&A pipelines, and scaled RAG systems with CI/CD.",
    date: "Feb 2024 - Aug 2024",
    tag: "Internship",
    type: "exp",
  },
];

const Journey = () => {
  const eduRef = useRef(null);
  const expRef = useRef(null);
  const indicatorRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  const { setIsScrollingDown } = useOutletContext();
  const [isScrolled, setIsScrolled] = useState(false);

  // Dynamic Line Heights to end exactly at the center of the last card node
  const [eduLineHeight, setEduLineHeight] = useState("100%");
  const [expLineHeight, setExpLineHeight] = useState("100%");

  // Max active index reached during scrolling
  const [maxEduIndex, setMaxEduIndex] = useState(-1);
  const [maxExpIndex, setMaxExpIndex] = useState(-1);

  // Active heights of the drawing progress lines
  const [eduActiveHeight, setEduActiveHeight] = useState("0px");
  const [expActiveHeight, setExpActiveHeight] = useState("0px");

  // Synchronized height for side-by-side cards in Row 1 on Desktop
  const [firstRowHeight, setFirstRowHeight] = useState("auto");

  // Active Sequence State
  const [activeItemId, setActiveItemId] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Measures and syncs side-by-side card heights for Row 1 on desktop
  useEffect(() => {
    const measureHeights = () => {
      let eduCardH = 0;
      let expCardH = 0;

      if (eduRef.current) {
        const cards = eduRef.current.querySelectorAll(".relative.flex.flex-row");
        if (cards.length > 0) {
          const firstCard = cards[0];
          const content = firstCard.querySelector(".relative.rounded-3xl.border-2");
          if (content) {
            content.style.height = "auto";
            eduCardH = content.offsetHeight;
          }
        }
      }
      if (expRef.current) {
        const cards = expRef.current.querySelectorAll(".relative.flex.flex-row");
        if (cards.length > 0) {
          const firstCard = cards[0];
          const content = firstCard.querySelector(".relative.rounded-3xl.border-2");
          if (content) {
            content.style.height = "auto";
            expCardH = content.offsetHeight;
          }
        }
      }

      const width = window.innerWidth;
      if (width >= 768 && eduCardH > 0 && expCardH > 0) {
        setFirstRowHeight(`${Math.max(eduCardH, expCardH)}px`);
      } else {
        setFirstRowHeight("auto");
      }
    };

    const timer = setTimeout(measureHeights, 300);

    window.addEventListener("resize", measureHeights);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureHeights);
    };
  }, []);

  // Scroll handler monitoring overall scroll, active nodes, and total line heights dynamically
  useEffect(() => {
    const scrollContainer = document.querySelector(".page-overlay") || window;

    const handleScroll = () => {
      const scrollTop =
        scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;

      // Keep cards hidden initially until scroll past 20px
      if (scrollTop > 20) {
        setIsScrolled(true);
        setIsScrollingDown(true);
      } else {
        setIsScrolled(false);
        setIsScrollingDown(false);
      }

      const viewportHeight = window.innerHeight;
      const triggerY = viewportHeight * 0.55;

      // 1. Dynamic Active Sequence Selector (Closest card to viewport trigger point)
      let closestId = "";
      let minDistance = Infinity;

      // Scan Education Cards
      if (eduRef.current) {
        const eduCards = eduRef.current.querySelectorAll("[data-timeline-id]");
        eduCards.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const cardCenter = rect.top + rect.height / 2;
          const distance = Math.abs(cardCenter - triggerY);
          if (distance < minDistance) {
            minDistance = distance;
            closestId = el.getAttribute("data-timeline-id");
          }
        });
      }

      // Scan Experience Cards
      if (expRef.current) {
        const expCards = expRef.current.querySelectorAll("[data-timeline-id]");
        expCards.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const cardCenter = rect.top + rect.height / 2;
          const distance = Math.abs(cardCenter - triggerY);
          if (distance < minDistance) {
            minDistance = distance;
            closestId = el.getAttribute("data-timeline-id");
          }
        });
      }

      if (closestId) {
        setActiveItemId(closestId);
      }

      // 2. Continuous height measurement of background timelines (keeps lines updated with page resizing/scaling)
      if (eduRef.current) {
        const cards = eduRef.current.querySelectorAll(".relative.flex.flex-row");
        if (cards.length > 0) {
          const lastCard = cards[cards.length - 1];
          setEduLineHeight(`${lastCard.offsetTop + lastCard.offsetHeight / 2}px`);
        }
      }
      if (expRef.current) {
        const cards = expRef.current.querySelectorAll(".relative.flex.flex-row");
        if (cards.length > 0) {
          const lastCard = cards[cards.length - 1];
          setExpLineHeight(`${lastCard.offsetTop + lastCard.offsetHeight / 2}px`);
        }
      }
    };

    handleScroll();
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [setIsScrollingDown]);

  // Determine if a card is active. Symmetrically groups Row 1 (Edu + Exp 1) on Desktop.
  const isCardActive = (id) => {
    if (!isScrolled) return false;
    
    if (isMobile) {
      // Mobile: independent row-by-row sequence matching
      return activeItemId === id;
    } else {
      // Desktop: Row 0 contains both edu-0 and exp-0 (side-by-side)
      if (id === "edu-0" || id === "exp-0") {
        return activeItemId === "edu-0" || activeItemId === "exp-0";
      }
      return activeItemId === id;
    }
  };

  // Track the highest indexes reached to lock drawing heights
  useEffect(() => {
    if (!isScrolled) {
      setMaxEduIndex(-1);
      setMaxExpIndex(-1);
      return;
    }

    if (eduRef.current) {
      const cards = eduRef.current.querySelectorAll("[data-timeline-id]");
      cards.forEach((el, i) => {
        const cardId = el.getAttribute("data-timeline-id");
        if (isCardActive(cardId) && i > maxEduIndex) {
          setMaxEduIndex(i);
        }
      });
    }

    if (expRef.current) {
      const cards = expRef.current.querySelectorAll("[data-timeline-id]");
      cards.forEach((el, i) => {
        const cardId = el.getAttribute("data-timeline-id");
        if (isCardActive(cardId) && i > maxExpIndex) {
          setMaxExpIndex(i);
        }
      });
    }
  }, [activeItemId, isScrolled]);

  // Calculate drawing progress line heights directly from node center coordinates.
  // Triggers recalculations whenever firstRowHeight changes to handle layout shifts cleanly.
  useEffect(() => {
    // 1. Education Height calculation
    if (eduRef.current && maxEduIndex >= 0) {
      const cards = eduRef.current.querySelectorAll("[data-timeline-id]");
      if (cards.length > maxEduIndex) {
        const activeCard = cards[maxEduIndex];
        const center = activeCard.offsetTop + activeCard.offsetHeight / 2;
        setEduActiveHeight(`${center}px`);
      }
    } else {
      setEduActiveHeight("0px");
    }

    // 2. Experience Height calculation
    if (expRef.current && maxExpIndex >= 0) {
      const cards = expRef.current.querySelectorAll("[data-timeline-id]");
      if (cards.length > maxExpIndex) {
        const activeCard = cards[maxExpIndex];
        const center = activeCard.offsetTop + activeCard.offsetHeight / 2;
        setExpActiveHeight(`${center}px`);
      }
    } else {
      setExpActiveHeight("0px");
    }
  }, [maxEduIndex, maxExpIndex, firstRowHeight, isMobile]);

  const [footerVisible, setFooterVisible] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const navigate = useNavigate();

  return (
    <div className="page-section">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-32">
        {/* Header */}
        <div className="flex items-center justify-center mb-0 h-fit">
          <div
            className={`text-center mb-6 backdrop-blur-sm rounded-2xl m-0 w-[100%] p-12 w-fit transition-all duration-300 ${
              theme === "dark"
                ? "bg-black/50"
                : "bg-white/65 border border-slate-200 shadow-lg"
            }`}
          >
            <p
              className={`text-8xl md:text-9xl font-black mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r uppercase ${
                theme === "dark"
                  ? "from-sky-400 to-purple-400"
                  : "from-sky-600 to-purple-600"
              }`}
            >
              Journey
            </p>

            <div className="flex justify-center gap-16 md:gap-24 mt-8">
              {/* Education Tab Header */}
              <div className="flex flex-col items-center">
                <span
                  className={`font-mono font-bold text-lg md:text-3xl tracking-[0.2em] uppercase transition-colors ${
                    theme === "dark" ? "text-sky-400" : "text-sky-600"
                  }`}
                >
                  Education
                </span>
                <div
                  className={`h-[2px] w-20 md:w-40 mt-3 rounded-full transition-all ${
                    theme === "dark"
                      ? "bg-sky-500 shadow-[0_0_15px_#3b82f6]"
                      : "bg-sky-600 shadow-[0_2px_8px_rgba(2,132,199,0.4)]"
                  }`}
                ></div>
              </div>

              {/* Experience Tab Header */}
              <div className="flex flex-col items-center">
                <span
                  className={`font-mono font-bold text-lg md:text-3xl tracking-[0.2em] uppercase transition-colors ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  }`}
                >
                  Experience
                </span>
                <div
                  className={`h-[2px] w-20 md:w-40 mt-3 rounded-full transition-all ${
                    theme === "dark"
                      ? "bg-purple-500 shadow-[0_0_15px_#a855f7]"
                      : "bg-purple-600 shadow-[0_2px_8px_rgba(147,51,234,0.4)]"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator Box */}
        <div
          ref={indicatorRef}
          className={`relative z-10 w-full max-w-lg md:max-w-2xl mx-auto px-6 p-12 mb-44 text-center backdrop-blur-md rounded-2xl transition-all duration-1000 ease-in-out ${
            theme === "dark"
              ? "bg-black/50 border-white/5 shadow-2xl"
              : "bg-white/60 border border-slate-200 shadow-xl"
          } ${
            isScrolled
              ? "opacity-0 translate-y-20 pointer-events-none invisible"
              : "opacity-100 translate-y-0"
          }`}
        >
          <div className="inline-flex flex-col items-center group group-hover:cursor-pointer cursor-pointer">
            <p
              className={`font-mono font-bold text-xl md:text-2xl tracking-[0.3em] uppercase mb-12 transition-all duration-700 group-hover:tracking-[0.4em] ${
                theme === "dark"
                  ? "text-white opacity-90 group-hover:opacity-100"
                  : "text-slate-800 opacity-80 group-hover:opacity-100"
              }`}
            >
              The Journey Continues
            </p>

            <div className="relative flex flex-col items-center">
              <div
                className={`relative w-8 h-14 rounded-full border-2 backdrop-blur-sm flex justify-center p-1.5 transition-all duration-500 ${
                  theme === "dark"
                    ? "border-white/70 group-hover:border-white"
                    : "border-slate-400 group-hover:border-slate-900"
                }`}
              >
                <div
                  className={`w-1.5 h-3 rounded-full animate-scroll-dot ${
                    theme === "dark" ? "bg-white" : "bg-slate-700"
                  }`}
                ></div>
              </div>

              <div
                className={`relative w-px h-24 mt-2 overflow-hidden transition-colors ${
                  theme === "dark"
                    ? "bg-gradient-to-b from-white/70 via-white/35 to-transparent"
                    : "bg-gradient-to-b from-slate-400 via-slate-200 to-transparent"
                }`}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-transparent animate-path-flow ${
                    theme === "dark" ? "via-white/70" : "via-slate-500"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Timeline Wrapper (Natural Height Flow) */}
        <div className="relative h-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-0 relative">
            
            {/* LEFT COLUMN: Education (Line on left, node on left) */}
            <div
              className="relative ml-4 flex flex-col gap-6"
              ref={eduRef}
            >
              {/* Background Path Line */}
              <div 
                className="absolute left-0 top-0 w-[2px] bg-white/[0.05] z-0"
                style={{ height: eduLineHeight }}
              ></div>
              {/* Drawing Progress Line */}
              <div
                className="absolute left-0 top-0 w-[2px] bg-gradient-to-b from-blue-400 to-cyan-400 shadow-[0_0_20px_#3b82f6] transition-all duration-500 ease-out z-[2]"
                style={{
                  height: eduActiveHeight,
                }}
              ></div>

              {educationData.map((item, i) => (
                <TimelineCard
                  key={`edu-${i}`}
                  id={`edu-${i}`}
                  item={item}
                  isLeft={true}
                  isActive={isCardActive(`edu-${i}`)}
                  cardHeight={i === 0 ? firstRowHeight : "auto"}
                  borderColor={"hover:border-blue-400"}
                />
              ))}
            </div>

            {/* RIGHT COLUMN: Experience (Line on right, node on right) */}
            <div
              className="relative mr-4 flex flex-col gap-6"
              ref={expRef}
            >
              {/* Background Path Line */}
              <div 
                className="absolute right-0 top-0 w-[2px] bg-white/[0.05] z-0"
                style={{ height: expLineHeight }}
              ></div>
              {/* Drawing Progress Line */}
              <div
                className="absolute right-0 top-0 w-[2px] bg-gradient-to-b from-purple-400 to-fuchsia-400 shadow-[0_0_20px_#a855f7] transition-all duration-500 ease-out z-[2]"
                style={{
                  height: expActiveHeight,
                }}
              ></div>

              {experienceData.map((item, i) => (
                <TimelineCard
                  key={`exp-${i}`}
                  id={`exp-${i}`}
                  item={item}
                  isLeft={false}
                  isActive={isCardActive(`exp-${i}`)}
                  cardHeight={i === 0 ? firstRowHeight : "auto"}
                  borderColor={"hover:border-purple-400"}
                />
              ))}
            </div>

          </div>
        </div>

        {/* Bottom Footer */}
        <div
          ref={footerRef}
          className={`mt-44 text-center pb-40 transition-all duration-1000 transform ${
            footerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
          }`}
        >
          <div
            className={`relative p-[1px] rounded-3xl inline-block transition-all duration-500 ${
              theme === "dark"
                ? "bg-gradient-to-b from-white/10 to-transparent"
                : "bg-gradient-to-b from-slate-200 to-transparent shadow-2xl"
            }`}
          >
            <div
              className={`backdrop-blur-sm p-12 rounded-[calc(1.5rem-1px)] border max-w-2xl transition-all duration-500 ${
                theme === "dark"
                  ? "bg-black/50 border-white/5"
                  : "bg-white/50 border-slate-200"
              }`}
            >
              <p
                className={`text-3xl font-bold mb-4 transition-colors ${
                  theme === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                Ready for the Next Chapter?
              </p>

              <p
                className={`mb-10 leading-relaxed text-xl transition-colors ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                I'm currently available for full-stack AI roles and innovative
                engineering projects.
              </p>
              <button
                onClick={() => {
                  if (window.innerWidth > 768) {
                    navigate("/mail");
                  } else {
                    window.location.href = "mailto:priyanshu123sah@gmail.com";
                  }
                }}
                className={`group relative px-10 py-5 font-black uppercase rounded-full overflow-hidden transition-all shadow-xl ${
                  theme === "dark"
                    ? "bg-white text-black hover:shadow-white/10"
                    : "bg-slate-900 text-white hover:shadow-slate-300"
                }`}
              >
                <span
                  className={`relative z-10 text-xl transition-colors ${
                    theme === "dark" ? "group-hover:text-white" : "group-hover:text-slate-900"
                  }`}
                >
                  Contact for My Next Gig
                </span>

                <div
                  className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${
                    theme === "dark" ? "bg-zinc-800" : "bg-slate-100"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scroll-dot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(18px); opacity: 0; }
        }
        @keyframes path-flow {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scroll-dot {
          animation: scroll-dot 2.5s ease-in-out infinite;
        }
        .animate-path-flow {
          animation: path-flow 2.5s ease-in-out infinite;
        }
         @keyframes flow {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `,
        }}
      />
    </div>
  );
};

export default Journey;
