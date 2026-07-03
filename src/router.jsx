import React, { lazy } from "react";
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import App from "./App";

// Helper to catch dynamic chunk loading failures (e.g. after a redeployment) and reload the page
const safeLazy = (importFunc) => {
  return lazy(() =>
    importFunc().catch((err) => {
      console.error("Failed to fetch dynamically imported module, forcing page reload:", err);
      window.location.reload();
      return { default: () => null };
    })
  );
};

const Home = safeLazy(() => import("./pages/home"));
const About = safeLazy(() => import("./pages/about"));
const Journey = safeLazy(() => import("./pages/journey"));
const Projects = safeLazy(() => import("./pages/projects"));
const Services = safeLazy(() => import("./pages/services"));
const Skills = safeLazy(() => import("./pages/skills"));
const Socials = safeLazy(() => import("./pages/socials"));
const MailPage = safeLazy(() => import("./pages/mail"));

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/journey",
        element: <Journey />,
      },
      {
        path: "/projects",
        element: <Projects />,
      },
      {
        path: "/services",
        element: <Services />,
      },
      {
        path: "/skills",
        element: <Skills />,
      },
      {
        path: "/socials",
        element: <Socials />,
      },
      {
        path: "/mail",
        element: <MailPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default appRouter;
