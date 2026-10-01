import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/graphics-library",
        destination: "/graphics-drive",
        permanent: true,
      },
      {
        source: "/graphics-library-v2",
        destination: "/graphics-drive",
        permanent: true,
      },
      {
        source: "/graphics-repository",
        destination: "/graphics-drive",
        permanent: true,
      },
      {
        source: "/graphics-library-v2/saved-prompts-notes",
        destination: "/graphics-drive/saved-prompts-notes",
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
