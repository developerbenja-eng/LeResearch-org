import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * IA reframe redirects (April 2026 — see research-notes/ux-rethink/).
   * Old substrate-mixed URLs → new artifact-type URLs.
   * 308 = permanent + preserves request method; #anchors are preserved automatically.
   */
  async redirects() {
    return [
      // /philosophy → split into /thesis (the spine), /cases, /threads
      { source: '/philosophy/cases',         destination: '/cases',         permanent: true },
      { source: '/philosophy/cases/:slug*',  destination: '/cases/:slug*',  permanent: true },
      { source: '/philosophy/threads',       destination: '/threads',       permanent: true },
      { source: '/philosophy/threads/:slug*', destination: '/threads/:slug*', permanent: true },
      { source: '/philosophy',               destination: '/thesis',        permanent: true },
      { source: '/philosophy/:slug*',        destination: '/thesis/:slug*', permanent: true },

      // /ai → /investigations/ai-discourse (lifted under the new "investigations" axis)
      { source: '/ai',                       destination: '/investigations/ai-discourse',         permanent: true },
      { source: '/ai/:slug*',                destination: '/investigations/ai-discourse/:slug*',  permanent: true },

      // /rethinking → /initiatives/rethinking
      { source: '/rethinking',               destination: '/initiatives/rethinking',         permanent: true },
      { source: '/rethinking/:slug*',        destination: '/initiatives/rethinking/:slug*',  permanent: true },
    ];
  },
};

export default nextConfig;
