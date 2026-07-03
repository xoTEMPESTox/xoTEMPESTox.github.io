/**
 * Centralized tech icon map.
 *
 * Each key is the display name used in techStack arrays.
 * - `url`   : A fully-resolved, colorful SVG URL. Prefer the Iconify `logos/` collection
 *             (multicolor, theme-agnostic) or LobeHub for AI tools.
 * - `color` : 6-char hex used for badge background tint, border, and label text color.
 *
 * To add a new tech: add an entry here. No changes needed in portfolio data.
 */

export const TECH_ICON_MAP = {
  // ── Languages ──────────────────────────────────────────────────────────────
  Python: {
    url: "https://api.iconify.design/logos/python.svg",
    color: "3776AB",
  },
  TypeScript: {
    url: "https://api.iconify.design/logos/typescript-icon.svg",
    color: "3178C6",
  },
  JavaScript: {
    url: "https://api.iconify.design/logos/javascript.svg",
    color: "F7DF1E",
  },
  "C++": {
    url: "https://api.iconify.design/logos/c-plusplus.svg",
    color: "00599C",
  },
  Solidity: {
    // Simple-icons with an explicit violet colour readable on dark & light
    url: "https://api.iconify.design/simple-icons/solidity.svg?color=%236C7CF0",
    color: "6C7CF0",
  },

  // ── AI / ML ────────────────────────────────────────────────────────────────
  LangChain: {
    url: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/langchain-color.svg",
    color: "1C7C4E",
  },
  LangGraph: {
    url: "https://unpkg.com/@lobehub/icons-static-svg@latest/icons/langgraph-color.svg",
    color: "A855F7", // purple – distinct from LangChain green
  },
  PyTorch: {
    url: "https://api.iconify.design/logos/pytorch-icon.svg",
    color: "EE4C2C",
  },
  NumPy: {
    url: "https://api.iconify.design/logos/numpy.svg",
    color: "4DABCF",
  },
  OpenAI: {
    url: "https://api.iconify.design/simple-icons/openai.svg?color=%2310A37F",
    color: "10A37F",
  },

  // ── Backend / Infra ────────────────────────────────────────────────────────
  FastAPI: {
    url: "https://api.iconify.design/simple-icons/fastapi.svg?color=%23009688",
    color: "009688",
  },
  Firebase: {
    url: "https://api.iconify.design/vscode-icons/file-type-firebase.svg",
    color: "FFCA28", // Firebase brand yellow color
  },
  PostgreSQL: {
    url: "https://api.iconify.design/logos/postgresql.svg",
    color: "4169E1",
  },
  MongoDB: {
    url: "https://api.iconify.design/devicon/mongodb.svg",
    color: "47A248",
  },
  "Node.js": {
    url: "https://api.iconify.design/logos/nodejs-icon.svg",
    color: "339933",
  },

  // ── Frontend ───────────────────────────────────────────────────────────────
  React: {
    url: "https://api.iconify.design/logos/react.svg",
    color: "61DAFB",
  },
  Chrome: {
    url: "https://api.iconify.design/logos/chrome.svg",
    color: "4285F4",
  },

  // ── Web3 ───────────────────────────────────────────────────────────────────
  Ethereum: {
    url: "https://api.iconify.design/cryptocurrency-color/eth.svg",
    color: "627EEA",
  },

  // ── IoT / Hardware ─────────────────────────────────────────────────────────
  ESP32: {
    url: "https://api.iconify.design/simple-icons/espressif.svg?color=%23E7352C",
    color: "E7352C",
  },
  Telegram: {
    url: "https://api.iconify.design/logos/telegram.svg",
    color: "26A5E4",
  },
  Arduino: {
    url: "https://api.iconify.design/logos/arduino.svg",
    color: "00979D",
  },

  // ── Robotics / Simulation ──────────────────────────────────────────────────
  Robotics: {
    // ROS logo with a readable blue
    url: "https://api.iconify.design/simple-icons/ros.svg?color=%2322A7E5",
    color: "22A7E5",
  },
  Simulation: {
    // Nvidia Isaac Sim
    url: "https://api.iconify.design/simple-icons/nvidia.svg?color=%2376B900",
    color: "76B900",
  },
};
