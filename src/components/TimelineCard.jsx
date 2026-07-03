import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "./HeaderBackground";

const TimelineCard = ({
  id,
  item,
  isLeft,
  isActive,
  borderColor,
  cardHeight = "auto",
}) => {
  const cardRef = useRef(null);
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Monitor screen resizing to adapt alignments responsively
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty(
      "--mouse-x",
      `${e.clientX - rect.left}px`
    );
    cardRef.current.style.setProperty(
      "--mouse-y",
      `${e.clientY - rect.top}px`
    );
  };

  return (
    <div
      data-timeline-id={id}
      className="relative flex flex-row w-full py-8 px-4 md:px-0 z-20"
      style={{
        justifyContent: isMobile
          ? isLeft
            ? "flex-end" // Education: card to right, logo is left
            : "flex-start" // Experience: card to left, logo is right
          : "center", // Desktop: card is centered
      }}
    >
      {/* Circle Node Logo - Centered next to its corresponding card */}
      <div
        className={`absolute w-16 h-16 rounded-full border-2 transition-all duration-500 flex items-center justify-center bg-black overflow-hidden z-30
          ${isLeft ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"}
          top-1/2 -translate-y-1/2
          ${
            isActive
              ? isLeft
                ? "border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-110 opacity-100"
                : "border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.5)] scale-110 opacity-100"
              : "border-white/10 opacity-0 scale-50 pointer-events-none"
          }`}
      >
        <img
          src={item.image}
          alt="logo"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card Content */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className={`relative p-8 md:p-10 rounded-3xl border-2 transition-all duration-700 ease-out transform backdrop-blur-sm m-0 w-[100%] max-w-[85%] 
          ${
            isActive
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-16 scale-95 pointer-events-none"
          } 
          ${
            theme === "dark"
              ? `bg-black/90 border-white/5 ${borderColor}`
              : `bg-white/80 border-slate-200 shadow-xl ${borderColor.replace("white/10", "blue-200")}`
          }`}
        style={{
          height: cardHeight,
          backgroundImage:
            theme === "dark"
              ? `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.15), transparent 60%)`
              : `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.28), transparent 60%)`,
        }}
      >
        <div className="flex flex-col gap-2 text-left">
          <h3
            className={`font-bold text-xl md:text-2xl tracking-tight transition-colors ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            {item.title}
          </h3>

          <p
            className={`font-bold text-base md:text-xl transition-colors ${
              item.type === "edu"
                ? theme === "dark"
                  ? "text-blue-400"
                  : "text-blue-600"
                : theme === "dark"
                  ? "text-purple-400"
                  : "text-purple-600"
            }`}
          >
            {item.subtitle}
          </p>

          <p
            className={`text-xl mt-4 leading-relaxed font-normal transition-colors ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {item.description}
          </p>

          <div
            className={`mt-6 pt-6 flex justify-between items-center border-t ${
              theme === "dark" ? "border-white/10" : "border-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  item.type === "edu"
                    ? theme === "dark"
                      ? "bg-blue-500"
                      : "bg-blue-600"
                    : theme === "dark"
                      ? "bg-purple-500"
                      : "bg-purple-600"
                }`}
              ></div>
              <span
                className={`text-sm md:text-lg mb-0! font-mono tracking-widest uppercase font-bold transition-colors ${
                  theme === "dark" ? "text-gray-500" : "text-slate-600"
                }`}
              >
                {item.date}
              </span>
            </div>

            <span
              className={`text-[10px] md:text-xl font-mono uppercase px-4 py-1.5 rounded-md transition-all ${
                theme === "dark" ? "bg-white/5" : "bg-slate-100 shadow-sm"
              } ${
                item.type === "edu"
                  ? theme === "dark"
                    ? "text-blue-400"
                    : "text-blue-600"
                  : theme === "dark"
                    ? "text-purple-400"
                    : "text-purple-600"
              }`}
            >
              {item.tag || (item.type === "edu" ? "Undergrad" : "Internship")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;
