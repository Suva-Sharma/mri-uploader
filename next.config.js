/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone", //makes a smaller, cleaner production runtime for Docker
    poweredByHeader: false,
  };
  
  module.exports = nextConfig;