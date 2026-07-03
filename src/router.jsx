import React from "react";
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import App from "./App";

// Helper to catch dynamic chunk loading failures (e.g. after a redeployment) and reload the page
const safeLazy = (importFunc) => {
  return () =>
    importFunc()
      .then((m) => ({ Component: m.default }))
      .catch((err) => {
        console.error("Failed to fetch dynamically imported module, forcing page reload:", err);
        window.location.reload();
        return { Component: () => null };
      });
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        lazy: safeLazy(() => import("./pages/home")),
      },
      {
        path: "/about",
        lazy: safeLazy(() => import("./pages/about")),
      },
      {
        path: "/journey",
        lazy: safeLazy(() => import("./pages/journey")),
      },
      {
        path: "/portfolio",
        lazy: safeLazy(() => import("./pages/portfolio")),
      },
      {
        path: "/services",
        lazy: safeLazy(() => import("./pages/services")),
      },
      {
        path: "/skills",
        lazy: safeLazy(() => import("./pages/skills")),
      },
      {
        path: "/socials",
        lazy: safeLazy(() => import("./pages/socials")),
      },
      {
        path: "/mail",
        lazy: safeLazy(() => import("./pages/mail")),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default appRouter;
