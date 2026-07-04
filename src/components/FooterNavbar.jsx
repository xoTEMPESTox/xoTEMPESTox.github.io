import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../styles/main.css"; // We'll put the complex CSS/Animations here
import { useTheme } from "./HeaderBackground";

const navItems = [
  { to: "/", label: "Home", icon: "homeicon-" },
  { to: "/about", label: "About", icon: "help-circledicon-" },
  { to: "/journey", label: "Journey", icon: "chart-baricon-" },
  { to: "/skills", label: "Skills", icon: "toolsicon-" },
  { to: "/services", label: "Services", icon: "clipboardicon-" },
  { to: "/projects", label: "Projects", icon: "briefcaseicon-" },
  { to: "/socials", label: "Socials", icon: "linkicon-" },
];

const FooterNavbar = ({ onNavigate, shouldHide }) => {
  const listRef = useRef(null);
  const { theme } = useTheme();

  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0, opacity: 0 });

    // ... inside your component
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  handleResize(); // Check on mount
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  // Handle mouse movement to update the grey glow position
  const handleMouseMove = (e) => {
    if (listRef.current) {
      const rect = listRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setGlowPosition({ x, y, opacity: 1 });
    }
  };

  // 2. Get current route to determine visibility
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Hide the glow when the mouse leaves
  const handleMouseLeave = () => {
    setGlowPosition({ ...glowPosition, opacity: 0 });
  };

  // Show the glow when the mouse enters (for initial visibility if moved quickly)
  const handleMouseEnter = () => {
    setGlowPosition((prev) => ({ ...prev, opacity: 1 }));
  };

  // Tailwind classes define the main layout and basic styling
  const listClasses = `
    padding-zero
    list 
    flex justify-evenly items-center 
    w-[80%] md:w-[64%] max-w-9xl 
    min-h-[5rem] rounded-[1.4rem] 
    text-[2.2rem] sm:text-[2.1rem] 
    isolation-isolate z-[999999] 
    overflow-hidden transition-all duration-300
    max-lg:w-[93%] max-lg:bottom-6
    ${theme === "light" ? "bg-white" : "bg-black"}
  `;

  return (
    <div
      ref={listRef}
      className={listClasses}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      data-theme={theme}
      style={{
        position: "fixed",
        left: "50%", // Move to center
        bottom: "20px", // Spacing from bottom

        // This handles both Centering (-50% X) AND Hiding (200% Y)
        transform: (isHome || shouldHide)
          ? "translate(-50%, 200%)" // Move DOWN off-screen
          : "translate(-50%, 0)", // Move UP to normal position

        transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth animation
      }}
    >
      <div className="media-object flex justify-evenly items-center w-full relative z-10 p-0 m-0">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="relative group flex-1 flex justify-center items-center h-full no-underline"
            data-name-sec={item.label}
          >
            {({ isActive }) => {
              const IconComponent = item.icon;

              return (
                <div className="relative flex items-center justify-center w-12 h-12">
                  {/* 1. Active State Background Gradient */}
                  <div
                    className={`absolute -inset-2 rounded-full blur-md transition-opacity duration-500 ease-out ${
                      isActive ? "opacity-100" : "opacity-0"
                    } ${
                      theme === "light"
                        ? "bg-gradient-to-r from-blue-400 to-purple-400"
                        : "bg-gradient-to-r from-blue-500/60 to-purple-500/60"
                    }`}
                  ></div>

                  {/* 2. Content Wrapper (Grid used to stack Icon and Text exactly on top of each other) */}
                  <div className="grid place-items-center w-full z-10">
                    {/* --- THE ICON (Fades Out & Shrinks on Hover) --- */}
                    <span
                      className={`
                        col-start-1 row-start-1
                        absolute inset-0 flex items-center justify-center
                        transition-all duration-300 ease-spring
                        transform group-hover:scale-50 group-hover:opacity-0 group-hover:-translate-y-2
                        ${
                          isActive
                            ? theme === "light"
                              ? "text-blue-600"
                              : "text-white"
                            : "text-gray-400 group-hover:text-transparent"
                        }
                      `}
                    >
                      {/* Using Lucide Icons for demo compatibility. 
                             If you use font-icons, replace <IconComponent /> with <span className={item.icon} /> */}
                      <span
                        className={`demo-icon ${item.icon} block leading-none relative z-10 transition-colors duration-300 ${
                          isActive
                            ? theme === "light"
                              ? "text-black"
                              : "text-white" // Blue in light, White in dark
                            : theme === "light"
                              ? "text-gray-500 group-hover:text-black"
                              : "text-gray-400 group-hover:text-white"
                        }`}
                      ></span>
                    </span>

                    {/* --- THE TEXT LABEL (Fades In & Grows on Hover) --- */}
                    <span
                      className={`
                        absolute inset-0 flex items-center justify-center
                        text-[10px] font-bold tracking-widest uppercase
                        transition-all duration-300 ease-spring
                        transform translate-y-3 scale-75 opacity-0
                        group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100
                        ${theme === "light" ? "text-black" : "text-white"}
                      `}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            }}
          </NavLink>
        ))}
      </div>

      {/* Grey Cursor Glow Effect */}
      {!isMobile &&  <div
        className="cursor-glow"
        style={{
          left: `${glowPosition.x}px`,
          top: `${glowPosition.y}px`,
          opacity: glowPosition.opacity,
          background:
            theme === "light"
              ? "radial-gradient(circle, rgba(0, 0, 0, 0.4) 0%, transparent 70%)" // Subtle dark glow
              : "radial-gradient(circle, rgba(169, 169, 169, 0.4) 0%, transparent 70%)", // Light glow
        }}
      ></div>
      }
     
    </div>
  );
};

export default FooterNavbar;
