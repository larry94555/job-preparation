/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle (server.js + minimal node_modules) so the
  // production Docker image can run the app without the full monorepo /
  // node_modules tree. See web/Dockerfile. (Phase 6 hosting — deployment.)
  output: "standalone",
  // Keep nodemailer OUT of the webpack server bundle. Auth.js's Nodemailer email
  // provider (magic-link sign-in) loads it via a dynamic import that the
  // standalone tracer misses when it's bundled — so the deployed container throws
  // "Cannot find module 'nodemailer'" on send and bounces sign-up to the error
  // page. Marking it external makes the tracer copy it into standalone/node_modules
  // and require() it at runtime. web/lib/email.ts (feedback) imports it too.
  serverExternalPackages: ["nodemailer"],
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
