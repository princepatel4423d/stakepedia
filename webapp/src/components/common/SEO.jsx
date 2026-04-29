import { Helmet } from "react-helmet-async";

/**
 * SEO Component
 *
 * Props:
 * @param {string}  title           - Page title (shown in browser tab & search results)
 * @param {string}  description     - Meta description (shown in search snippets)
 * @param {string}  [keywords]      - Comma-separated keywords
 * @param {string}  [canonicalUrl]  - Canonical URL for this page
 * @param {string}  [ogImage]       - Open Graph image URL (for social sharing)
 * @param {string}  [ogType]        - Open Graph type (default: "website")
 * @param {string}  [twitterCard]   - Twitter card type (default: "summary_large_image")
 * @param {string}  [author]        - Author name
 * @param {string}  [robots]        - Robots directive (default: "index, follow")
 * @param {boolean} [noIndex]       - If true, sets robots to "noindex, nofollow"
 */
const SEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  author,
  robots,
  noIndex = false,
}) => {
  const robotsContent = noIndex
    ? "noindex, nofollow"
    : robots ?? "index, follow";

  return (
    <Helmet>
      {/* ── Primary ── */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robotsContent} />

      {/* ── Canonical ── */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* ── Open Graph ── */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:type" content={ogType} />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content={twitterCard} />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

export default SEO;

/**
 *  SETUP — wrap your app root once:
 *
 *  import { HelmetProvider } from "react-helmet-async";
 *  import App from "./App";
 *
 *  const Root = () => (
 *    <HelmetProvider>
 *      <App />
 *    </HelmetProvider>
 *  );
 *
 *  USAGE — drop <SEO /> into any page:
 *
 *  import SEO from "../components/SEO";
 *
 *  // Minimal
 *  const HomePage = () => (
 *    <>
 *      <SEO
 *        title="Home | My App"
 *        description="Welcome to My App — the best place to do things."
 *      />
 *      <main>...</main>
 *    </>
 *  );
 *
 *  // Full
 *  const BlogPost = () => (
 *    <>
 *      <SEO
 *        title="My Blog Post | My App"
 *        description="A deep dive into something interesting."
 *        keywords="blog, react, seo"
 *        canonicalUrl="https://myapp.com/blog/my-post"
 *        ogImage="https://myapp.com/images/my-post.jpg"
 *        ogType="article"
 *        author="Jane Doe"
 *      />
 *      <article>...</article>
 *    </>
 *  );
 *
 *  // Prevent indexing (e.g. admin pages)
 *  const AdminPage = () => (
 *    <>
 *      <SEO title="Admin | My App" description="Admin panel." noIndex />
 *      <main>...</main>
 *    </>
 *  );
 *
 *  Install react-helmet-async:
 *  npm install react-helmet-async
 */