// Keep production output separate from the existing development cache.
// next build and next start both use NODE_ENV=production.
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? (process.env.ORGANSYNC_BROWSER_TEST_HOST === "true" ? ".next-phase3g" : ".next") : ".next-build",
};
export default nextConfig;
