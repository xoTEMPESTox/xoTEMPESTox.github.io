import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import appRouter from "./router";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Handle Vite dynamic import / chunk preload failures (e.g. after a redeployment)
window.addEventListener("vite:preloadError", (event) => {
  console.warn("Vite preload error detected, reloading page...", event);
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={appRouter} />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
);
