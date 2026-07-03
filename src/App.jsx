import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import HeaderBackground, {
  ThemeProvider,
  ThemeControls,
  useTheme,
  ThemePlayer,
} from "./components/HeaderBackground";
import FooterNavbar from "./components/FooterNavbar";
import AnimatedOutlet from "./AnimatedOutlet";
import { MiniPlayer } from "./components/MiniPlayer";
import { LoFiPlayer } from "./components/LofiPlayer";
import SvgLoaderLeftToRight from "./components/SvgLoaderLeftToRight";
import { motion, AnimatePresence } from "framer-motion";
import SocialBar from "./components/SocialBar";

const customStyles = `
/* Custom Tailwind Configuration (replicated here for self-containment) */
.lo-fi-config {
    --lo-fi-bg: #f8f4ff;
    --lo-fi-ui: #e5d4f9;
    --lo-fi-accent: #c6aee3;
    --lo-fi-dark: #white;
    --player-bg: #000000;
}

.icon-btn {
    /* Base padding is now handled via utility classes in JSX for responsiveness */
    border-radius: 0.75rem; /* rounded-xl */
    transition: all 150ms ease-in-out;
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); /* shadow-inner */
}

/* Base styles for the player states, sizing is handled by Tailwind utility classes */
.minimized {
    /* Use custom rounding for the mobile top-right bar shape */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    border: 3px solid transparent;
    background-color: var(--player-bg);
}

.expanded {
    height: auto;
    padding: 0rem;
    border-radius: 2.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
    background-color:#000000;
}

/* Styles for rotated text/elements in the vertical bar */
/* We remove the rotation properties here so we can control them via Tailwind utilities (lg:...) */
.rotated-text-container { 
    white-space: nowrap;
    line-height: 1;
}

/* Utility classes for Desktop (lg:) breakpoint, applied via JSX */
.lg\:vertical-rl {
    writing-mode: vertical-rl; /* Rotate text 90 degrees clockwise */
}

.lg\:rotate-180 {
    transform: rotate(180deg); /* Flip it to read bottom-to-top */
}


/* Transition class for the elastic effect */
.elastic-in {
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Specific style for the menu overlay */
.menu-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(5px);
    z-index: 10;
}
`;

const musicAPI = [
  {
    index: 1,
    title: "Daylight Remix",
    artist: "X.S Music",
    songSrc: "../assets/songs/Daylight.mp3",
    img: "../assets/images/music/Daylight.jpeg",
    duration: 176.27,
  },
  {
    index: 2,
    title: "Resonance",
    artist: "Home",
    songSrc: "../assets/songs/Resonance.mp3",
    img: "../assets/images/music/Resonance.jpeg",
    duration: 212.74,
  },
  {
    index: 3,
    title: "Von (Terror in Resonance)",
    artist: "Kayou. Beats",
    songSrc: "../assets/songs/Terror in Resonance.mp3",
    img: "../assets/images/music/Terror in Resonance.jpeg",
    duration: 171.12,
  },
  {
    index: 4,
    title: "Comedy (SPY X FAMILY)",
    artist: "Kayuo. Beats",
    songSrc: "../assets/songs/Comedy.mp3",
    img: "../assets/images/music/Comedy.jpeg",
    duration: 166.34,
  },
];

function ThemeControlsWrapper({ shouldHideUI }) {
  const {
    theme,
    handleThemeChange,
    allWallpapers,
    currentAsset,
    handleWallpaperSelect,
  } = useTheme();

  return (
    <ThemePlayer
      theme={theme}
      onThemeChange={handleThemeChange}
      wallpapers={allWallpapers}
      currentWallpaper={currentAsset}
      onWallpaperSelect={handleWallpaperSelect}
      shouldHideUI={shouldHideUI}
    />
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isElastic, setIsElastic] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { theme } = useTheme();
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0); // Current time in seconds
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0-100% for slider
  const [duration, setDuration] = useState(NaN); // Total duration in seconds
  const [prevVolume, setPrevVolume] = useState(0.15);
  const [volume, setVolume] = useState(0.15); // 15% volume
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const hasInteracted = useRef(false);
  const currentAudio = useRef(null);
  const location = useLocation();
  const shouldHidePlayer =
    location.pathname === "/socials" || location.pathname === "/";
  const shouldHideUI = shouldHidePlayer || isScrollingDown;
  const socials = location.pathname === "/socials";
  const journey = location.pathname === "/journey";
  const skills = location.pathname === "/skills";
  const about = location.pathname === "/about";
  const topContentCutOff = skills || about;

  // ... inside your component
  const [isMobileForContent, setIsMobileForContent] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileForContent(window.innerWidth < 900);
    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Preload all dynamic route chunks in the background once the loading screen is dismissed
  useEffect(() => {
    if (!loading) {
      const preloadChunks = () => {
        const chunks = [
          () => import("./pages/home"),
          () => import("./pages/about"),
          () => import("./pages/journey"),
          () => import("./pages/portfolio"),
          () => import("./pages/services"),
          () => import("./pages/skills"),
          () => import("./pages/socials"),
          () => import("./pages/mail"),
        ];

        // Use requestIdleCallback if available, otherwise setTimeout
        const scheduler = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));

        scheduler(() => {
          chunks.forEach((preload) => {
            preload().catch(() => {}); // Catch failures silently during preloading
          });
        });
      };

      preloadChunks();
    }
  }, [loading]);

  // Logic for the height
  const getMinHeight = () => {
    if (socials) return "calc(100vh - 16rem)";
    if (journey && isMobileForContent) return "calc(100vh - 14rem)";
    if (journey) return "calc(100vh - 8rem)";
    if (skills && isMobileForContent) return "calc(100vh - 12rem)";
    if (about && isMobileForContent) return "calc(100vh - 12rem)";
    return "100vh";
  };

  // --- DYNAMIC TITLE HANDLER ---
  useEffect(() => {
    const titleMap = {
      "/": "Priyanshu Sah | AI ML Engineer & Full Stack Developer",
      "/about": "About Me | Priyanshu Sah",
      "/journey": "My Journey | Priyanshu Sah",
      "/portfolio": "Portfolio | Priyanshu Sah",
      "/services": "Services | Priyanshu Sah",
      "/skills": "Skills | Priyanshu Sah",
      "/socials": "Blog & Socials | Priyanshu Sah",
      "/mail": "Mail | Priyanshu Sah",
    };

    document.title =
      titleMap[location.pathname] ||
      "Priyanshu Sah | AI ML Engineer & Full Stack Developer";
  }, [location]);

  useEffect(() => {
    if (shouldHidePlayer) {
      setIsExpanded(false);
    }
  }, [location.pathname, shouldHidePlayer]);

  // --- AUDIO HANDLERS ---

  const ensureUnmute = () => {
    if (isMuted && currentAudio.current) {
      // Restore to the previous volume level
      currentAudio.current.volume = prevVolume;
      setVolume(prevVolume);
      setIsMuted(false);
    }
  };

  // Update current time and progress when the audio element fires timeupdate
  const handleAudioUpdate = () => {
    if (!currentAudio.current || isNaN(currentAudio.current.duration)) return;

    // 1. Update current playback time (seconds)
    setCurrentTime(currentAudio.current.currentTime);

    // 2. Update progress percentage (0-100) for the slider
    const progress =
      (currentAudio.current.currentTime / currentAudio.current.duration) * 100;
    setPlaybackProgress(progress);
  };

  const handleNextSong = () => {
    const nextIndex = (trackIndex + 1) % musicAPI.length;
    updateTrack(nextIndex);
  };

  const handlePrevSong = () => {
    const prevIndex = (trackIndex - 1 + musicAPI.length) % musicAPI.length;
    updateTrack(prevIndex);
  };

  const updateTrack = (newIndex) => {
    setTrackIndex(newIndex);
    // UNMUTE HERE
    ensureUnmute();
    if (currentAudio.current) {
      currentAudio.current.src = musicAPI[newIndex].songSrc;
      currentAudio.current.load(); // Ensure the new track is loaded

      // **CRITICAL: REMOVE ALL if (isPlaying) { ... } ELSE { ... } LOGIC.**
      // Only reset the time:
      setCurrentTime(0);
      setPlaybackProgress(0);
    }
    // Note: If you have a separate check for updating the duration from musicAPI, keep it.
    // e.g. setDuration(musicAPI[newIndex].duration);
  };
  // Toggle Play/Pause Audio Function
  const handleAudioPlay = () => {
    if (!currentAudio.current) return;

    if (currentAudio.current.paused) {
      // UNMUTE HERE
      ensureUnmute();
      currentAudio.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          // CRITICAL: Log error if autoplay is blocked
          console.error(
            "Playback failed (Autoplay blocked? Browser requires user interaction to start audio).",
            error,
          );
          setIsPlaying(false); // Ensure state is correct if play fails
        });
    } else {
      currentAudio.current.pause();
      setIsPlaying(false);
    }
  };

  // Handler for scrubbing the music bar
  const handleMusicProgressBar = (e) => {
    const newProgress = parseFloat(e.target.value); // New progress (0-100)
    setPlaybackProgress(newProgress); // Update slider for immediate UI feedback

    if (currentAudio.current && !isNaN(currentAudio.current.duration)) {
      const newTime = (newProgress * currentAudio.current.duration) / 100;
      currentAudio.current.currentTime = newTime;
      setCurrentTime(newTime); // Update time state
    }
  };

  // Handler for volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (currentAudio.current) {
      currentAudio.current.volume = newVolume;
    }
  };

  // --- EFFECTS ---

  // --- REVISED EFFECT FOR TRACK CHANGE, DURATION, AND AUTOPLAY ---
  useEffect(() => {
    if (currentAudio.current) {
      // 1. UPDATE SOURCE AND LOAD (from the old updateTrack logic)
      currentAudio.current.src = musicAPI[trackIndex].songSrc;
      currentAudio.current.load();

      // 2. DEFINE EVENT HANDLERS

      // A. Duration Handler: Sets the total length of the track
      const handleLoadedMetadata = () => {
        setDuration(currentAudio.current.duration);
        console.log(
          "Metadata loaded. Duration set:",
          currentAudio.current.duration,
        );
      };

      // B. Autoplay Handler: Starts playback when the track is ready
      const handleCanPlayThrough = () => {
        currentAudio.current
          .play()
          .then(() => {
            setIsPlaying(true);
            // handleMuteToggle();
            console.log("Track is ready and playing.");
          })
          .catch((error) => {
            console.error("Autoplay blocked by browser policy:", error);
            setIsPlaying(false);
          });
      };

      // 3. ATTACH LISTENERS
      currentAudio.current.addEventListener(
        "loadedmetadata",
        handleLoadedMetadata,
      );
      currentAudio.current.addEventListener(
        "canplaythrough",
        handleCanPlayThrough,
      );

      // 4. CLEANUP
      // Crucial: Remove listeners when the trackIndex changes or component unmounts
      return () => {
        currentAudio.current?.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata,
        );
        currentAudio.current?.removeEventListener(
          "canplaythrough",
          handleCanPlayThrough,
        );
      };
    }
  }, [trackIndex]); // Dependency array: Runs whenever trackIndex changes

  // 2. Control Audio Volume
  useEffect(() => {
    if (currentAudio.current) {
      currentAudio.current.volume = volume;
    }
  }, [volume]);

  // 3. Pause/Resume audio when tab visibility changes (tab switch, browser minimize)
  const wasPlayingBeforeHidden = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!currentAudio.current) return;

      if (document.visibilityState === "hidden") {
        // Store whether audio was playing before hiding
        wasPlayingBeforeHidden.current = !currentAudio.current.paused;
        if (wasPlayingBeforeHidden.current) {
          currentAudio.current.pause();
          setIsPlaying(false);
        }
      } else if (document.visibilityState === "visible") {
        // Only resume if it was playing before the tab was hidden
        if (wasPlayingBeforeHidden.current) {
          currentAudio.current
            .play()
            .then(() => setIsPlaying(true))
            .catch((err) => console.error("Auto-resume failed:", err));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Get the currently selected track details
  const currentTrack = useMemo(() => musicAPI[trackIndex], [trackIndex]);

  const handleTrackSelect = (index) => {
    updateTrack(index); // Just update the index and source
    setDuration(musicAPI[index].duration); // Assuming duration is from musicAPI now
    setIsMenuOpen(false); // Close menu
    // We will set setIsPlaying(true) in the new useEffect
  };

  const handleMuteToggle = () => {
    if (!currentAudio.current) return;

    if (isMuted) {
      // UNMUTE: Restore volume to the previously saved level (prevVolume).
      // Since we are ignoring external volume changes,
      // we assume prevVolume is the safe value to restore.

      currentAudio.current.volume = prevVolume;
      setVolume(prevVolume); // Update volume state for UI consistency
      setIsMuted(false); // Set mute state to false
    } else {
      // MUTE: Store the current volume (before it goes to 0).
      // Then set audio volume and state to 0 and mute.

      setPrevVolume(volume); // Store current volume level
      currentAudio.current.volume = 0;
      setVolume(0); // Update volume state to 0
      setIsMuted(true); // Set mute state to true
    }
  };
  // Menu Handlers
  const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);
  // Handler for the elastic/transition effect
  const handleToggle = (expand) => {
    setIsElastic(true);
    setIsExpanded(expand);
    if (!expand) {
      setIsMenuOpen(false); // Close menu when minimizing
    }

    // Remove the elastic class after the animation finishes
    setTimeout(() => {
      setIsElastic(false);
    }, TRANSITION_DURATION);
  };
  const startAudioOnInteraction = () => {
    // If we've already handled the first interaction, do nothing
    if (hasInteracted.current) return;

    if (currentAudio.current) {
      currentAudio.current.currentTime = 0; // Restart from beginning
      currentAudio.current.muted = false;
      currentAudio.current.volume = volume;

      currentAudio.current
        .play()
        .then(() => {
          setIsMuted(false);
          setIsPlaying(true);
          // Mark as interacted so this block never runs again
          hasInteracted.current = true;
          console.log("Audio initialized once.");
        })
        .catch((err) => {
          console.error("Playback failed:", err);
          // We don't set hasInteracted to true here so it can try again on next click if it failed
        });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive values for noise
  const darkNoiseFreq = isMobile ? "0.25" : "0.15";
  const lightNoiseFreq = isMobile ? "0.15" : "0.1";

  // Responsive Positioning Classes
  let positionClasses;

  if (isExpanded) {
    // Mobile/Tablet: Centered horizontally, 10rem from the bottom
    positionClasses =
      "fixed bottom-40 left-1/2 -translate-x-1/2 w-[90%] max-w-sm";

    // Desktop (lg): Fixed on the RIGHT side
    positionClasses +=
      " lg:right-10 lg:left-auto lg:w-1/5 lg:max-w-sm lg:translate-x-0 lg:translate-y-0";
  } else {
    // Mobile/Tablet: Top-right corner, compact horizontal bar
    positionClasses = "fixed -top-[3px] -right-[3px] w-58 h-14";

    // Desktop (lg): Right-center, narrow/tall vertical bar
    positionClasses +=
      " lg:top-1/2 lg:-translate-y-1/2 lg:right-10 lg:w-20 lg:h-126";
  }

  const playerThemeStyle = {
    "--player-bg": theme === "dark" ? "#000000" : "#FFFFFF",
  };

  // Combining static, state, and responsive classes
  const containerClasses = [
    "transition-all duration-500",
    isExpanded
      ? "expanded lg:overflow-y-auto"
      : "minimized rounded-bl-[2.5rem] lg:rounded-bl-[1.4rem] lg:rounded-[1.4rem]", // Apply large rounded-bottom-left for the top-right tab look on mobile, and standard rounded-xl on desktop.
    isElastic ? "elastic-in" : "ease-in-out",
  ].join(" ");
  return (
    <ThemeProvider>
      <>
        <style>{customStyles}</style>
        <audio
          ref={currentAudio}
          onTimeUpdate={handleAudioUpdate}
          onEnded={handleNextSong} // Auto-pl2.5remay next track when current one ends
          muted={isMuted} // This will be true initially
          playsInline
        />
        <div
          className="App"
          style={{ position: "relative", minHeight: "100vh" }}
          data-theme={theme}
        >
          {/* 1. Background is ALWAYS mounted so the video can load */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              pointerEvents: "none", // so loader still reacts normally
            }}
          >
            <HeaderBackground loading={loading} />
          </div>

          {/* 2. Loader overlays everything until animation completes */}
          {loading && (
            <div
              className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-white z-[9999]
      transition-opacity duration-700 ease-in-out
      ${fadeOut ? "opacity-0" : "opacity-100"}`}
              onTransitionEnd={() => {
                if (fadeOut) setLoading(false);
              }}
            >
              <SvgLoaderLeftToRight
                onFinish={() => {
                  setFadeOut(true);
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("hasLoadedBefore", "true");
                  }
                  // handleAudioPlay();
                }}
              />
            </div>
          )}

          {/* 3. Main content shows only after loading */}
          {!loading && (
            <>
              <div
                className={`
    ${positionClasses} 
    ${containerClasses} 

    z-1200
    lg:transition-all lg:duration-500
    transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) 
    ${
      shouldHideUI
        ? "opacity-0 pointer-events-none translate-x-[250%]"
        : "opacity-100 pointer-events-auto "
    }

    
  `}
                style={{
                  // If hidden, force X to -250% (slide far left).
                  // If visible, set to undefined (let Tailwind classes controls it).
                  "--tw-translate-x": shouldHideUI ? "250%" : undefined,
                }}
              >
                {isExpanded ? (
                  <LoFiPlayer
                    isExpanded={isExpanded}
                    onCollapse={() => handleToggle(false)}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    onPlayPause={handleAudioPlay}
                    onNext={handleNextSong}
                    onPrev={handlePrevSong}
                    // Menu Props
                    isMenuOpen={isMenuOpen}
                    onMenuToggle={handleMenuToggle}
                    onTrackSelect={handleTrackSelect}
                    tracks={musicAPI}
                    trackIndex={trackIndex}
                    // Volume Props - FIXED HERE
                    volume={volume}
                    onVolumeChange={handleVolumeChange}
                  />
                ) : (
                  <div
                    className={`mini-player h-[100%] w-[100%] rounded-bl-[2.5rem] lg:rounded-[1.4rem]`}
                  >
                    <MiniPlayer
                      onExpand={() => handleToggle(true)}
                      currentTrack={currentTrack}
                      isPlaying={isPlaying}
                      isMuted={isMuted}
                      setIsMuted={setIsMuted}
                      handleMuteToggle={handleMuteToggle}
                      handleAudioPlay={handleAudioPlay}
                      onNext={handleNextSong}
                      onPrev={handlePrevSong}
                    />
                  </div>
                )}
              </div>
              <ThemeControlsWrapper shouldHideUI={shouldHideUI} />
              <div
                className="page-overlay"
                style={{
                  position: "relative",
                  width: "100%",
                  minHeight: getMinHeight(),
                  zIndex: 10,
                  top: topContentCutOff ? "4rem" : socials ? "8rem" : "0rem",
                }}
              >
                <AnimatedOutlet
                  context={{ startAudioOnInteraction, setIsScrollingDown }}
                />
              </div>
              {socials && <SocialBar />}
              <FooterNavbar onNavigate={startAudioOnInteraction} />
            </>
          )}
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:svgjs="http://svgjs.dev/svgjs"
          opacity="1"
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            pointerEvents: "none",
            visibility: "hidden",
          }}
        >
          <defs>
            <filter
              id="nnnoise-filter"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              filterUnits="objectBoundingBox"
              primitiveUnits="userSpaceOnUse"
              color-interpolation-filters="linearRGB"
            >
              <feTurbulence
                type="turbulence"
                baseFrequency={darkNoiseFreq}
                numOctaves="4"
                seed="15"
                stitchTiles="stitch"
                x="0%"
                y="0%"
                width="100%"
                height="100%"
                result="turbulence"
              ></feTurbulence>
              <feSpecularLighting
                surfaceScale="19"
                specularConstant="1.4"
                specularExponent="20"
                lighting-color="#ffffff"
                x="0%"
                y="0%"
                width="100%"
                height="100%"
                in="turbulence"
                result="specularLighting"
              >
                <feDistantLight azimuth="3" elevation="104"></feDistantLight>
              </feSpecularLighting>
            </filter>
          </defs>
          <rect width="700" height="700" fill="#000000ff"></rect>
          <rect
            width="700"
            height="700"
            fill="#ffffff"
            filter="url(#nnnoise-filter)"
          ></rect>
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:svgjs="http://svgjs.dev/svgjs"
          opacity="1"
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            pointerEvents: "none",
            visibility: "hidden",
          }}
        >
          <defs>
            <filter
              id="nnnoise-filter-black"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              filterUnits="objectBoundingBox"
              primitiveUnits="userSpaceOnUse"
              color-interpolation-filters="linearRGB"
            >
              <feTurbulence
                type="turbulence"
                baseFrequency={lightNoiseFreq}
                numOctaves="4"
                seed="15"
                stitchTiles="stitch"
                x="0%"
                y="0%"
                width="100%"
                height="100%"
                result="turbulence"
              ></feTurbulence>
              <feSpecularLighting
                surfaceScale="19"
                specularConstant="1.4"
                specularExponent="20"
                lighting-color="#ffffff"
                x="0%"
                y="0%"
                width="100%"
                height="100%"
                in="turbulence"
                result="specularLighting"
              >
                <feDistantLight azimuth="3" elevation="104"></feDistantLight>
              </feSpecularLighting>
              <feComponentTransfer in="specularLighting">
                <feFuncR type="table" tableValues="1 0" />
                <feFuncG type="table" tableValues="1 0" />
                <feFuncB type="table" tableValues="1 0" />
              </feComponentTransfer>
            </filter>
          </defs>
          <rect width="700" height="700" fill="#ffffffff"></rect>
          <rect
            width="700"
            height="700"
            fill="#9013fe"
            filter="url(#nnnoise-filter-black)"
          ></rect>
        </svg>
      </>
    </ThemeProvider>
  );
}

export default App;
