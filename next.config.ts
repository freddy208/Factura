/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['https://factura-cm.vercel.app/s','192.168.1.125', '192.168.217.172', 'localhost', '127.0.0.1'],
  turbopack: {},
}

// PWA seulement en production
if (process.env.NODE_ENV === 'production') {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
  })
  module.exports = withPWA(nextConfig)
} else {
  module.exports = nextConfig
}