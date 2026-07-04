import React, { useEffect, useRef, useState } from "react";
import { NavLink, useOutletContext } from "react-router-dom";
import { useTheme } from "../components/HeaderBackground";
import "../styles/main.css";


const Home = () => {
  const { theme } = useTheme();
  const context = useOutletContext();
  const startAudioOnInteraction = context?.startAudioOnInteraction;

  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    // 1. Prevent double injection
    if (container.querySelector(".typed-text__wrapper")) {
      return;
    }

    // 2. Initialize and capture the cleanup function
    const cancelTyping = initHomeRoleTyper();


    // --- FIX: Check for existing wrapper before creating new ones ---
    return () => {
      if (cancelTyping) cancelTyping();
      // Also physically remove the injected elements to keep the DOM clean
      const wrapper = container.querySelector(".typed-text__wrapper");
      if (wrapper) wrapper.remove();
    };
    // initHomeRoleTyper();
  }, []);

  const initHomeRoleTyper = () => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const container = document.querySelector(".home__info__desc[data-roles]");

    if (!container) {
      return;
    }

    if (
      "matchMedia" in window &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const parseRoles = () => {
      const rawRoles = container.getAttribute("data-roles");

      if (!rawRoles) {
        return [];
      }

      try {
        // Try parsing as JSON first (as defined in the HTML)
        const parsed = JSON.parse(rawRoles);
        if (Array.isArray(parsed)) {
          return parsed.map((role) => String(role).trim()).filter(Boolean);
        }
      } catch (error) {
        // Fallback to pipe | separated if JSON fails
        const fallbackRoles = rawRoles
          .split("|")
          .map((role) => role.trim())
          .filter(Boolean);
        if (fallbackRoles.length > 0) {
          return fallbackRoles;
        }
      }

      return [];
    };

    const roles = parseRoles();

    if (roles.length === 0) {
      return;
    }

    const fallback = container.querySelector(".typed-text__fallback");
    const wrapper = document.createElement("span");
    wrapper.className = "typed-text__wrapper";

    const content = document.createElement("span");
    content.className = "typed-text__content";
    content.textContent = "";

    const cursor = document.createElement("span");
    cursor.className = "typed-text__cursor";
    cursor.setAttribute("aria-hidden", "true");

    wrapper.appendChild(content);
    wrapper.appendChild(cursor);

    const insertionPoint = fallback ?? null;
    container.insertBefore(wrapper, insertionPoint);

    if (fallback) {
      fallback.setAttribute("aria-hidden", "true");
    }

    container.classList.add("typed-text--ready");
    container.setAttribute("aria-live", "polite");

    let roleIndex = 0;
    let charIndex = 0;
    let typingTimeoutId = 0;
    let eraseFrameId = 0;
    let expandFallbackTimeoutId = 0;
    let expandListener = null;
    let eraseStarted = false;
    let isActive = true;

    const typeSpeed = 75; // Time in ms between characters (higher is Slower)
    const holdDelay = 750; // Time in ms to hold before starting erase
    const transitionDelay = 350; // Time in ms before starting the next type
    const expandDuration = 450; // Cursor expansion animation time
    const eraseDuration = 300; // Total time for text erase animation
    const widthBuffer = 0;

    // Initialize cursor width properties
    const computedCursor = window.getComputedStyle(cursor);
    const baseCursorWidth = Number.parseFloat(computedCursor.width) || 10;
    const cursorTransition =
      "width 0.48s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease";

    cursor.style.width = `${baseCursorWidth}px`;
    cursor.style.transition = cursorTransition;

    const schedule = (callback, delay) => {
      typingTimeoutId = window.setTimeout(() => {
        typingTimeoutId = 0;
        callback();
      }, delay);
    };

    const ensureActive = () => isActive;

    const clearAnimationFrame = () => {
      if (eraseFrameId) {
        window.cancelAnimationFrame(eraseFrameId);
        eraseFrameId = 0;
      }
    };

    const clearExpandListener = () => {
      if (expandListener) {
        cursor.removeEventListener("transitionend", expandListener);
        expandListener = null;
      }
      if (expandFallbackTimeoutId) {
        window.clearTimeout(expandFallbackTimeoutId);
        expandFallbackTimeoutId = 0;
      }
    };

    const jumpCursorToBase = () => {
      const previousTransition = cursor.style.transition;
      cursor.style.transition = "none";
      cursor.style.width = `${baseCursorWidth}px`;
      // Force reflow/repaint for instant change
      void cursor.offsetWidth;
      const restoredTransition =
        previousTransition && previousTransition !== "none"
          ? previousTransition
          : cursorTransition;
      cursor.style.transition = restoredTransition;
    };

    // Easing function for smooth erase animation
    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const finishErase = () => {
      if (!ensureActive()) {
        return;
      }

      clearAnimationFrame();
      container.classList.remove("typed-text--deleting");
      content.textContent = "";
      charIndex = 0;
      roleIndex = (roleIndex + 1) % roles.length;
      eraseStarted = false;

      jumpCursorToBase();
      schedule(typeNextChar, transitionDelay);
    };

    const startErase = (expandedWidth) => {
      if (!ensureActive()) {
        return;
      }

      const currentRole = roles[roleIndex];

      if (!currentRole) {
        finishErase();
        return;
      }

      container.classList.remove("typed-text--expanding");
      container.classList.add("typed-text--deleting");

      clearAnimationFrame();
      cursor.style.transition = "none";

      const initialLength = currentRole.length;
      const startTime = window.performance.now();
      let lastRenderedLength = charIndex;

      const animateErase = (timestamp) => {
        if (!ensureActive()) {
          return;
        }

        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / eraseDuration, 1);
        const eased = easeInOutCubic(progress);
        const targetLength = Math.max(
          Math.round(initialLength * (1 - eased)),
          0
        );

        if (targetLength !== lastRenderedLength) {
          charIndex = targetLength;
          content.textContent = currentRole.slice(0, charIndex);
          lastRenderedLength = targetLength;
        }

        const nextWidth =
          baseCursorWidth + (expandedWidth - baseCursorWidth) * (1 - eased);
        cursor.style.width = `${nextWidth}px`;

        if (progress < 1) {
          eraseFrameId = window.requestAnimationFrame(animateErase);
          return;
        }

        cursor.style.transition = cursorTransition;
        finishErase();
      };

      eraseFrameId = window.requestAnimationFrame(animateErase);
    };

    const launchErase = (expandedWidth) => {
      if (!ensureActive() || eraseStarted) {
        return;
      }

      eraseStarted = true;
      clearExpandListener();
      startErase(expandedWidth);
    };

    const startExpand = () => {
      if (!ensureActive()) {
        return;
      }

      const currentRole = roles[roleIndex];

      if (!currentRole) {
        return;
      }

      // Calculate the width of the currently typed text
      const measuredWidth = Math.ceil(content.getBoundingClientRect().width);
      const expandedWidth = Math.max(
        measuredWidth + widthBuffer,
        baseCursorWidth
      );

      container.classList.add("typed-text--expanding");
      cursor.style.transition = cursorTransition;
      cursor.style.width = `${expandedWidth}px`;

      // Use transitionend to know when the cursor expansion is finished
      expandListener = (event) => {
        if (event.propertyName !== "width") {
          return;
        }
        launchErase(expandedWidth);
      };

      cursor.addEventListener("transitionend", expandListener, { once: true });

      // Fallback timeout in case transitionend fails
      expandFallbackTimeoutId = window.setTimeout(
        () => launchErase(expandedWidth),
        expandDuration + 60
      );
    };

    function typeNextChar() {
      if (!ensureActive()) {
        return;
      }

      const currentRole = roles[roleIndex];

      if (!currentRole) {
        return;
      }

      container.classList.remove(
        "typed-text--expanding",
        "typed-text--deleting"
      );

      if (charIndex === 0) {
        jumpCursorToBase();
        content.textContent = "";
      }

      // Type the next character
      if (charIndex < currentRole.length) {
        charIndex += 1;
        content.textContent = currentRole.slice(0, charIndex);
        schedule(typeNextChar, typeSpeed);
        return;
      }

      // Finished typing, start the hold delay and then expansion
      schedule(startExpand, holdDelay);
    }

    // Initial start
    schedule(typeNextChar, transitionDelay);

    // Cleanup function
    const cancelTyping = () => {
      if (!isActive) {
        return;
      }

      isActive = false;

      if (typingTimeoutId) {
        window.clearTimeout(typingTimeoutId);
        typingTimeoutId = 0;
      }

      clearAnimationFrame();
      clearExpandListener();

      container.classList.remove(
        "typed-text--expanding",
        "typed-text--deleting"
      );
      cursor.style.transition = "none";
      cursor.style.width = "";
    };

    // Add event listeners for cleanup on navigation
    window.addEventListener("pagehide", cancelTyping, { once: true });
    window.addEventListener("beforeunload", cancelTyping, { once: true });

    return cancelTyping;
  };

  return (
    <div className="page-section">
      <section className="home" id="home" data-theme={theme}>
        <div className="container">
          <div className="row align-items-center gx-0 gy-sm-4 mx-auto text-center">
            <div className="col-md-6">
              <div className="home__img mx-auto">
                <img
                  src="/assets/images/person/man-1-min.jpg"
                  alt="Profile picture of Priyanshu Sah"
                  draggable="false"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="home__info">
                <h1 className="home__info__title text-capitalize">
                  Priyanshu Sah
                  <span></span>
                </h1>

                <p
                  ref={containerRef}
                  class="home__info__desc my-6"
                  data-roles='["AI Engineer","Full-Stack Engineer","Building AI @ Liferythem"]'
                >
                  <span class="typed-text__fallback">
                    AI Engineer
                    <br></br> Full-Stack Engineer
                    <br></br> Building AI @ Liferythem
                  </span>
                </p>
 
                <NavLink
                  id="read-more-home"
                  className="mx-auto mt-6 button-read-more button--telesto"
                  to="/about"
                  onClick={startAudioOnInteraction}
                >
                  <span><span>Read More</span></span>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
