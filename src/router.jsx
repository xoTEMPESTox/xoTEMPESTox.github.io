import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import App from "./App";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        lazy: () => import("./pages/home").then(m => ({ Component: m.default })),
      },
      {
        path: "/about",
        lazy: () => import("./pages/about").then(m => ({ Component: m.default })),
      },
      {
        path: "/journey",
        lazy: () => import("./pages/journey").then(m => ({ Component: m.default })),
      },
      {
        path: "/portfolio",
        lazy: () => import("./pages/portfolio").then(m => ({ Component: m.default })),
      },
      {
        path: "/services",
        lazy: () => import("./pages/services").then(m => ({ Component: m.default })),
      },
      {
        path: "/skills",
        lazy: () => import("./pages/skills").then(m => ({ Component: m.default })),
      },
      {
        path: "/socials",
        lazy: () => import("./pages/socials").then(m => ({ Component: m.default })),
      },
      {
        path: "/mail",
        lazy: () => import("./pages/mail").then(m => ({ Component: m.default })),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default appRouter;
