# Portfolio — priyanshusah.com

A high-performance personal portfolio built with React, Vite, and Tailwind CSS. Features cinematic looping backgrounds, an ambient lo-fi music player, a 3D interactive cube, LinkedIn-powered blog with Gemini LLM processing, and smooth page transitions — all running at 60fps.

## ✨ Features

### Pages
| Page | Description |
|---|---|
| **Home** | Animated landing with rotating background media and 3D cube |
| **About** | Personal bio and introduction |
| **Journey** | Interactive timeline of career milestones, education, and experiences |
| **Skills** | Technical skills matrix with visual indicators |
| **Services** | Consulting, prototyping, and deployment capabilities |
| **Portfolio** | Swiper.js carousel showcasing featured projects with detail views |
| **Socials** | LinkedIn blog feed with tag filtering, search, and markdown rendering |
| **Mail** | Contact form and collaboration routes |

### Interactive Elements
- **Cinematic Backgrounds** — 10 unique looping video environments with day/night modes, parallax on desktop, randomized per session
- **Lo-fi Music Player** — Ambient background music with mini player controls across all pages
- **3D Cube** — Interactive Three.js element on the home page
- **Blog System** — Posts scraped from LinkedIn, transformed via Gemini LLM, filterable by tags
- **URL Shortener** — Slugs like `/linkedin`, `/github`, `/resume-global` act as branded short links
- **Wallpaper Selector** — Choose from multiple background themes with smooth transitions
- **Dark/Light Mode** — Theme toggle with persistent preference

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (required by Vite 5)
- npm

### Installation
```bash
npm install
```

### Scripts
```bash
npm run dev       # Start dev server (http://localhost:5173, exposed to network)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run login     # One-time manual login to Playwright ScraperProfile
npm run update    # Run LinkedIn scraper (scrapes + downloads media + LLM processes)
```

## 📁 Project Structure

```
├── public/
│   ├── assets/                    # Images, videos, backgrounds
│   ├── data/
│   │   ├── blog_data.json         # LinkedIn blog posts (auto-generated)
│   │   └── media/                 # Locally downloaded LinkedIn images, GIFs, and videos
│   ├── favicons/                  # Site favicons
│   ├── fonts/                     # Custom font files
│   ├── robots.txt                 # SEO crawler config
│   └── sitemap.xml                # Sitemap for search engines
├── src/
│   ├── components/
│   │   ├── HeaderBackground.jsx   # Cinematic background media loader
│   │   ├── LofiPlayer.jsx         # Full lo-fi music player
│   │   ├── MiniPlayer.jsx         # Compact player controls
│   │   ├── Cube.jsx               # 3D interactive cube
│   │   ├── BlogHeader.jsx         # Blog section header and search
│   │   ├── FilterSidebar.jsx      # Tag filtering and sorting sidebar
│   │   ├── PostList.jsx           # Grid of blog post cards
│   │   └── DetailView.jsx         # Detailed blog reading view
│   ├── pages/
│   │   ├── home.jsx               # Hero landing page
│   │   ├── about.jsx              # About me & background
│   │   ├── journey.jsx            # Experience timeline
│   │   ├── skills.jsx             # Tech stack & expertise
│   │   └── socials.jsx            # Blog & social feeds
│   ├── styles/                    # Global & utility CSS
│   ├── App.jsx                    # Root app routing
│   └── main.jsx                   # React DOM entry point
```

## 🎬 Background Media

- Controlled via `public/assets/images/backgrounds/backgrounds.json`
- Each entry maps a still image to a looping video
- Stills load instantly → videos fade in once buffered
- Randomized per session with localStorage dedup
- 10 unique scenes, each with day and night variants


Static redirects in `public/<slug>/index.html` make the portfolio double as a branded short-link service:

`/linkedin` · `/github` · `/mail` · `/resume-global` · `/twitch` · `/spotify` · `/steam` · `/discord` · `/codolio`

## 📝 LinkedIn Blog Scraper

An automated pipeline in `scripts/linkedin-scraper/` that:
1. Scrapes posts from LinkedIn using Playwright Chromium
2. Transforms content via Gemini LLM (title, summary, markdown, curated tags)
3. Downloads all media attachments (images, GIFs, `.mp4`/`.webm` videos) to `public/data/media/`
4. Supports incremental updates — only new posts hit the LLM
5. Outputs to `public/data/blog_data.json`

See [`scripts/linkedin-scraper/README.md`](scripts/linkedin-scraper/README.md) for setup details.

## 🌐 SEO

- `robots.txt` allows major crawlers with sitemap reference
- `sitemap.xml` points to canonical URL (`https://priyanshusah.com/`)
- `index.html` includes Open Graph, Twitter Card, and Schema.org Person metadata

## 🚢 Deployment

1. `npm run build`
2. Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages)
3. Ensure `public/assets/` is included in the build output

### Links
- [Production](https://priyanshusah.com) — Vercel
- [Dev](https://dev.priyanshusah.com/) — Vercel

## Credits

- Inspiration: [James Oliver Portfolio](https://james-oliver-portfolio.netlify.app/)
- Backgrounds: Video loops sourced from Steam Wallpaper Engine Workshop — credit to the original artists
- Music: Lo-fi tracks credit to the original artists

## Roadmap

- [ ] **Phase 0: Journey Timeline Hotfix (LifeRhythm Reversion)**
  - [ ] **Revert Description**: Shorten `Liferythm Healthcare` description back to: `"Building AI doctor modules including a Follow-Up Coach, voice-based Clinical Notes assistant, and Front Desk Assistant. Working on healthcare AI workflows, MedLLMs, and production deployments."` in `src/pages/journey.jsx`.
  - [ ] **Revert Offsets**: Restore original absolute spacing percentages in `journey.jsx`:
    - TCS -> `pos: 0.28`
    - MyShadowLife -> `pos: 0.44`
    - Creo AI -> `pos: 0.60`
    - Web3Galaxy -> `pos: 0.76`
    - Chart Raiders -> `pos: 0.92`
  - [ ] **Investigate Auto-Layout**: Design a dynamic timeline offset algorithm using `getBoundingClientRect()` inside a `scroll` listener to eliminate hardcoded `pos` offsets.
  - [ ] **Card Size Matching**: Match the height/size of all description cards in the journey timeline to be uniform (same as the largest card, e.g., Liferythm description) so they don't look uneven.

- [x] **Phase 1: Fullscreen Image Gallery (Bulb View)**
  - [x] **Data Model Update**: Add optional `images: string[]` to project objects in `rawPortfolioData` inside `portfolio.jsx`.
  - [x] **Carousel Navigation**:
    - Add `currentIndex` state inside `FullscreenZoomableImage`, initialized with `image.activeImageIndex || 0`.
    - Render absolute absolute-positioned side chevron buttons (using `ChevronLeft` and `ChevronRight` from `lucide-react`) when `images.length > 1`.
    - Render dot pagination indicators below the image caption.
  - [x] **Keyboard Support**: Set up a `keydown` handler listening for `ArrowLeft` / `ArrowRight` inside `FullscreenZoomableImage`.
  - [x] **State Cleanup**: Ensure `scale` resets to `1` and `position` resets to `{x:0, y:0}` on index swap.
  - [x] **Swipe Gestures**: Track `clientX` delta in `onTouchStart`/`onTouchEnd` for swipe direction, triggering navigation if zoomed scale is `1` and distance > `50px`.

- [ ] **Phase 2: Project Detail Card Gallery**
  - [ ] **Prop Integration**: Pass `onImageOpen` (bound to `setFullscreenImage`) to `DetailCard` component.
  - [ ] **Visual Grid**: Add a flex/grid section "Architecture & Screenshots" right below the project description in `src/components/DetailedCard.jsx`.
  - [ ] **Thumbnail Interactivity**: Render thumbnails for all image items in the array (falling back to `image_url`). Clicking a thumbnail triggers `onImageOpen({ ...project, image_url: selectedUrl, activeImageIndex: index })` to launch the fullscreen zoom view directly at that specific image index.

- [x] **Phase 3: Deep Linking & History Sync**
  - [x] **Mount Parsing**: Add check in `portfolio.jsx` `useEffect` on load for search params `?project=id` or hash `#id`. If matched, open detail modal.
  - [x] **Carousel Snapping**: Set background `activeIndex` to match the data index of the deep-linked project, ensuring the background aligns behind the modal.
  - [x] **History Sync**: Add a window `hashchange` event listener in `portfolio.jsx` to dynamically close or transition detail views on browser back/forward navigation.
  - [x] **URL Updates**: Set `window.location.hash = project.id` when details open, and use `window.history.pushState` on close to clean the URL without page jumps.

- [ ] **Phase 4: Load More Project List (Blog-style view)**
  - [ ] **Roadmap Entry**: Add a "Load More" button at the bottom of the projects section.
  - [ ] **Grid UI**: When clicked, expand to display a list or grid UI of all project cards (including legacy projects) styled similarly to the blogs post card list.
