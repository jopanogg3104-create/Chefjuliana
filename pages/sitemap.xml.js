export default function Sitemap() {
  return null;
}
export function getServerSideProps({ res }) {
  const url =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL
      : null);
  if (!url) {
    res.statusCode = 404;
    res.end();
    return { props: {} };
  }
  res.setHeader("Content-Type", "application/xml");
  res.end(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${new URL("/", url).href.replace(/&/g, "&amp;")}</loc></url></urlset>`,
  );
  return { props: {} };
}
