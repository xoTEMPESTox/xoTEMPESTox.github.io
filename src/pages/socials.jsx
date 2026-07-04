import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import BlogHeader from "../components/BlogHeader";
import FilterSidebar from "../components/FilterSidebar";
import PostList from "../components/PostList";
import DetailView from "../components/DetailView";
import "../styles/main.css";
import { useTheme } from "../components/HeaderBackground";
import { NavLink, useOutletContext } from "react-router-dom";
import FullscreenZoomableImage from "../components/FullscreenZoomableImage";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import ReactDOM from "react-dom";
import { ChevronUp, ChevronDown } from "lucide-react";
import Fuse from "fuse.js";



// --- COOKIE UTILITIES ---
const LIKED_POSTS_COOKIE = "likedBlogPosts";

const getLikedPostsFromCookie = () => {
  const cookies = document.cookie.split(";");
  const likedCookie = cookies.find((c) =>
    c.trim().startsWith(`${LIKED_POSTS_COOKIE}=`),
  );
  if (likedCookie) {
    try {
      const value = likedCookie.split("=")[1];
      return JSON.parse(decodeURIComponent(value));
    } catch (e) {
      return [];
    }
  }
  return [];
};

const Socials = () => {
  const context = useOutletContext();
  const setIsBlogDetailOpen = context?.setIsBlogDetailOpen;

  const [currentPage, setCurrentPage] = useState("list"); // 'list' or 'detail'

  useEffect(() => {
    if (setIsBlogDetailOpen) {
      setIsBlogDetailOpen(currentPage === "detail");
    }
    return () => {
      if (setIsBlogDetailOpen) {
        setIsBlogDetailOpen(false);
      }
    };
  }, [currentPage, setIsBlogDetailOpen]);

  const [activeTab, setActiveTab] = useState("blogs"); // 'blogs' or 'linkedin'
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [search, setSearch] = useState("");
  const { theme } = useTheme();

  // Gallery Modal State
  const [galleryImages, setGalleryImages] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    tags: [],
    sortBy: "date", // 'date', 'likes', 'views'
    sortDir: "desc",
    showOnlyLiked: false,
  });

  const [visibleCount, setVisibleCount] = useState(4);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  // Check screen size for desktop animations
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch blog posts from JSON file
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/data/blog_data.json");
        if (!response.ok) {
          throw new Error("Failed to fetch blog posts");
        }
        const data = await response.json();
        setPosts(data);

        // Check deep-linking query parameter (?post=slug)
        const params = new URLSearchParams(window.location.search);
        const postSlug = params.get("post");
        if (postSlug) {
          const matchedPost = data.find((p) => p.slug === postSlug);
          if (matchedPost) {
            setSelectedPostId(matchedPost.id);
            setCurrentPage("detail");
          }
        }
      } catch (error) {
        console.error("Error loading blog posts:", error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Reset pagination when search or filters change
  useEffect(() => {
    setVisibleCount(4);
  }, [search, filters]);

  const allTags = useMemo(() => {
    const tags = posts.flatMap((post) => post.tags || []);
    return [...new Set(tags)].sort();
  }, [posts]);

  // Update Filtering Logic
  const filteredPosts = useMemo(() => {
    let currentPosts = [...posts];

    // 1. Filter by Liked Posts (if enabled)
    if (filters.showOnlyLiked) {
      const likedPostIds = getLikedPostsFromCookie();
      currentPosts = currentPosts.filter((post) =>
        likedPostIds.includes(post.id),
      );
    }

    // 1. Filtering by Tags
    if (filters.tags.length > 0) {
      currentPosts = currentPosts.filter((post) =>
        filters.tags.some((tag) => post.tags.includes(tag)),
      );
    }

    // 2. Search
    const searchLower = search.toLowerCase().trim();
    if (searchLower) {
      const fuse = new Fuse(currentPosts, {
        keys: ["title", "excerpt", "tags"],
        threshold: 0.3, // Adjust this value to control "fuzziness" (0.0 = exact, 1.0 = matches everything)
        ignoreLocation: true,
      });

      const results = fuse.search(searchLower);
      currentPosts = results.map((result) => result.item);
    }

    // 3. Sorting
    currentPosts.sort((a, b) => {
      let valA, valB;

      if (filters.sortBy === "date") {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else if (filters.sortBy === "likes") {
        valA = a.metrics?.likes || 0;
        valB = b.metrics?.likes || 0;
      } else if (filters.sortBy === "views") {
        valA = a.metrics?.views || 0;
        valB = b.metrics?.views || 0;
      }

      return filters.sortDir === "desc" ? valB - valA : valA - valB;
    });

    return currentPosts;
  }, [posts, search, filters.tags, filters.sortBy, filters.sortDir, filters.showOnlyLiked]);

  const paginatedPosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  // Navigation Handlers
  const handlePostClick = useCallback((postId) => {
    setSelectedPostId(postId);
    setCurrentPage("detail");
    const container = document.querySelector(".blog-scroll-container");
    if (container) {
      container.scrollTop = 0;
    }
  }, []);

  const handleBack = useCallback(() => {
    setCurrentPage("list");
    setSelectedPostId(null);
    const container = document.querySelector(".blog-scroll-container");
    if (container) {
      container.scrollTop = 0;
    }
  }, []);

  // Find selected post
  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedPostId),
    [posts, selectedPostId],
  );

  // Gallery Handlers
  const handleGalleryOpen = useCallback((images, index) => {
    setGalleryImages(images);
    setGalleryIndex(index);
  }, []);

  const handleGalleryClose = useCallback(() => {
    setGalleryImages(null);
    setGalleryIndex(0);
  }, []);



  return (
    <div className="page-section" data-theme={theme}>
      <div
        className={`max-w-[95%] md:max-w-[85%] lg:max-w-[95rem] mx-auto p-6 md:p-12 rounded-[2.5rem] transition-all duration-500 border h-[calc(100vh-16rem)] flex flex-col overflow-hidden ${theme === "dark"
          ? "bg-zinc-950/70 backdrop-blur-sm border-zinc-800 shadow-[0_0_20px_rgba(255,255,255,0.02)]"
          : "bg-white/60 backdrop-blur-sm border-slate-200 shadow-[0_0_20px_rgba(0,0,0,0.02)]"
          }`}
      >
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide blog-scroll-container">
        {/* Toggle Switch - Only show on list page */}
        {/* {currentPage === "list" && (
          <div className="flex justify-center mb-8">
            <div
              className={`relative flex items-center p-1 rounded-2xl w-[20rem] h-12 ${theme === "dark" ? "bg-zinc-900/50" : "bg-slate-200/50"
                }`}
            >
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl shadow-sm transition-all duration-300 ease-in-out ${theme === "dark" ? "bg-zinc-700" : "bg-white"
                  } ${activeTab === "linkedin" ? "translate-x-[100%] left-[2px]" : "translate-x-0 left-1"}`}
              />

              <button
                onClick={() => setActiveTab("blogs")}
                className={`relative z-10 w-1/2 h-full text-sm font-semibold transition-colors duration-200 ${activeTab === "blogs"
                  ? theme === "dark"
                    ? "text-white"
                    : "text-slate-900"
                  : theme === "dark"
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Blogs
              </button>
              <button
                onClick={() => setActiveTab("linkedin")}
                className={`relative z-10 w-1/2 h-full text-sm font-semibold transition-colors duration-200 ${activeTab === "linkedin"
                  ? theme === "dark"
                    ? "text-white"
                    : "text-slate-900"
                  : theme === "dark"
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                LinkedIn Posts
              </button>
            </div>
          </div>
        )} */}

        {/* LIST VIEW */}
        {currentPage === "list" && (
          <>
            {/* BLOGS TAB CONTENT */}
            {activeTab === "blogs" && (
              <div className="animate-in fade-in zoom-in duration-300">
                {isLoading ? (
                  <div className="flex justify-center items-center min-h-[400px]">
                    <div
                      className={`text-lg ${theme === "dark" ? "text-zinc-400" : "text-slate-600"}`}
                    >
                      Loading posts...
                    </div>
                  </div>
                ) : (
                  <>
                    <BlogHeader
                      search={search}
                      setSearch={setSearch}
                      setFilters={setFilters}
                    />

                    <main className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-8">
                      <div className="lg:col-span-2">
                        <PostList
                          filteredPosts={paginatedPosts}
                          onPostClick={handlePostClick}
                        />

                        {visibleCount < filteredPosts.length && (
                          <div className="flex justify-center mt-12 pb-8">
                            <button
                              onClick={() => {
                                if (visibleCount === 4) {
                                  setVisibleCount(8);
                                } else {
                                  setVisibleCount(filteredPosts.length);
                                }
                              }}
                              className={isDesktop ? "button--bestia group relative" : `px-10 py-4 rounded-2xl font-bold uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-lg border backdrop-blur-sm ${theme === "dark"
                                ? "bg-zinc-900/40 hover:bg-zinc-800/60 border-zinc-800/50 hover:border-zinc-600 text-white"
                                : "bg-white/10 hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900 shadow-slate-200/80"
                                }`}
                              style={isDesktop ? {
                                "--btn-bg": theme === "dark" ? "rgba(24, 24, 27, 0.4)" : "rgba(255, 255, 255, 0.4)",
                                "--btn-fill": theme === "dark" ? "rgba(39, 39, 42, 0.9)" : "#f8fafc",
                                "--btn-text": "#ffffff",
                                fontSize: "0.875rem",
                                fontWeight: "bold",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase"
                              } : {}}
                            >
                              {isDesktop && <div className="button__bg" style={{ border: theme === "dark" ? "1px solid rgba(63, 63, 70, 0.4)" : "1px solid #e2e8f0" }}></div>}
                              <span className={isDesktop ? "" : undefined}>
                                {visibleCount === 4 ? "Load More Posts" : "Show All Posts"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                      <aside className="lg:col-span-1">
                        <FilterSidebar
                          filters={filters}
                          setFilters={setFilters}
                          allTags={allTags}
                        />
                      </aside>
                    </main>
                  </>
                )}
              </div>
            )}

            {/* LINKEDIN TAB CONTENT */}
            {/* {activeTab === "linkedin" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 w-full min-h-[500px] flex justify-center p-8 bg-[#f9fafb] rounded-3xl ">
                <iframe
                  src="https://widgets.sociablekit.com/linkedin-profile-posts/iframe/25647450"
                  frameBorder="0"
                  width="100%"
                  height="1000"
                  style={{
                    borderRadius: "12px",
                    maxWidth: "1200px",
                  }}
                  title="LinkedIn Profile Posts"
                ></iframe>
              </div>
            )} */}
          </>
        )}

        {/* DETAIL VIEW */}
        {currentPage === "detail" && selectedPost && (
          <div className="animate-in fade-in duration-500">
            <DetailView
              post={selectedPost}
              onBack={handleBack}
              onGalleryImageClick={handleGalleryOpen}
            />
          </div>
        )}

        {/* IMAGE GALLERY MODAL - Portal to document.body to escape transform stacking context */}
        {galleryImages &&
          ReactDOM.createPortal(
            <FullscreenZoomableImage
              images={galleryImages}
              initialIndex={galleryIndex}
              title={selectedPost?.title}
              onClose={handleGalleryClose}
              theme={theme}
            />,
            document.body
          )}
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .sk-header-button { background-color: #FFFF00 !important}
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default Socials;
