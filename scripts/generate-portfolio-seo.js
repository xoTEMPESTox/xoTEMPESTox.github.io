import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths
const sitemapPath = resolve(__dirname, "../public/sitemap.xml");
const blogsDataPath = resolve(__dirname, "../public/data/blog_data.json");
const portfolioDataPath = resolve(__dirname, "../src/data/portfolioData.json");
const portfolioOutputDir = resolve(__dirname, "../public/portfolio");

// Load Data
const portfolio = JSON.parse(readFileSync(portfolioDataPath, "utf8"));
let blogs = [];
if (existsSync(blogsDataPath)) {
  blogs = JSON.parse(readFileSync(blogsDataPath, "utf8"));
}

// 1. Generate Static HTML Pages for Portfolio Projects
console.log("Generating pre-rendered static HTML portfolio deep links...");
for (const p of portfolio) {
  const projectDir = join(portfolioOutputDir, p.id);
  if (!existsSync(projectDir)) {
    mkdirSync(projectDir, { recursive: true });
  }

  const title = `${p.title} — Priyanshu Sah`;
  const desc = p.tagline || p.description;
  
  // Resolve absolute image URL for preview crawlers
  const rawImg = p.image_url || p.images?.[0];
  let imageUrl = "https://priyanshusah.com/assets/images/og-default.jpg"; // default backup
  if (rawImg) {
    const normalized = rawImg.replace(/^\.\.\//, "/").replace(/^\.\//, "/");
    imageUrl = `https://priyanshusah.com${normalized}`;
  }
  const url = `https://priyanshusah.com/portfolio/${p.id}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    
    <!-- Open Graph / Facebook / LinkedIn / Slack / Discord -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${imageUrl}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${desc}">
    <meta property="twitter:image" content="${imageUrl}">

    <!-- Redirect humans to the interactive SPA portfolio with the hashed route -->
    <script>
      window.location.replace("/portfolio#" + "${p.id}");
    </script>
</head>
<body>
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center;margin-top:20vh;color:#888;">
        <h2>Redirecting to ${p.title}...</h2>
        <p>If you are not redirected automatically, <a href="/portfolio#${p.id}">click here</a>.</p>
    </div>
</body>
</html>`;

  writeFileSync(join(projectDir, "index.html"), html, "utf8");
}
console.log(`  ✓ Pre-rendered ${portfolio.length} portfolio project static pages.`);

// 2. Generate Consolidated Sitemap
console.log("Generating unified sitemap.xml...");
const staticRoutes = [
  { url: "https://priyanshusah.com/", priority: "1.0" },
  { url: "https://priyanshusah.com/about", priority: "0.8" },
  { url: "https://priyanshusah.com/home", priority: "0.7" },
  { url: "https://priyanshusah.com/journey", priority: "0.7" },
  { url: "https://priyanshusah.com/skills", priority: "0.7" },
  { url: "https://priyanshusah.com/socials", priority: "0.8" },
  { url: "https://priyanshusah.com/mail", priority: "0.3" },
  { url: "https://priyanshusah.com/linkedin", priority: "0.3" },
  { url: "https://priyanshusah.com/github", priority: "0.2" },
  { url: "https://priyanshusah.com/codolio", priority: "0.2" },
  { url: "https://priyanshusah.com/leetcode", priority: "0.2" },
  { url: "https://priyanshusah.com/portfolio", priority: "0.8" },
  { url: "https://priyanshusah.com/resume", priority: "0.2" },
  { url: "https://priyanshusah.com/resume-ai", priority: "0.2" },
  { url: "https://priyanshusah.com/resume-global", priority: "0.2" },
  { url: "https://priyanshusah.com/resume-fullstack", priority: "0.2" },
  { url: "https://priyanshusah.com/twitch", priority: "0.1" },
  { url: "https://priyanshusah.com/spotify", priority: "0.1" },
  { url: "https://priyanshusah.com/steam", priority: "0.1" },
  { url: "https://priyanshusah.com/discord", priority: "0.1" }
];

let newSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const r of staticRoutes) {
  newSitemap += `  <url>\n    <loc>${r.url}</loc>\n    <priority>${r.priority}</priority>\n  </url>\n`;
}

// Add Blogs
for (const p of blogs) {
  if (!p.slug) continue;
  const postDate = p.date ? p.date.substring(0, 10) : new Date().toISOString().substring(0, 10);
  newSitemap += `  <url>\n    <loc>https://priyanshusah.com/socials/${p.slug}</loc>\n    <lastmod>${postDate}</lastmod>\n    <priority>0.8</priority>\n  </url>\n`;
}

// Add Portfolio Projects (Deep Links)
for (const p of portfolio) {
  newSitemap += `  <url>\n    <loc>https://priyanshusah.com/portfolio/${p.id}</loc>\n    <priority>0.8</priority>\n  </url>\n`;
}

newSitemap += `</urlset>`;
writeFileSync(sitemapPath, newSitemap, "utf8");
console.log(`  ✓ sitemap.xml updated with static routes, ${blogs.length} blog posts, and ${portfolio.length} portfolio project deep links.`);
