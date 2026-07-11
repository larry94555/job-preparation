/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle (server.js + minimal node_modules) so the
  // production Docker image can run the app without the full monorepo /
  // node_modules tree. See web/Dockerfile. (Phase 6 hosting — deployment.)
  output: "standalone",
  // Compile the raw-TS ESM workspace packages (they ship .ts, no build step).
  transpilePackages: [
    "@job-prep/schema",
    "@job-prep/engine",
    "@job-prep/lesson",
    "@job-prep/evaluator",
    "@job-prep/sandbox",
    "@job-prep/store",
  ],
  webpack: (config) => {
    // The workspace packages ship raw .ts but import each other with explicit
    // ".js" specifiers (NodeNext style). tsx/TS Bundler resolution rewrites
    // those to ".ts"; teach webpack the same mapping so the imports resolve.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
