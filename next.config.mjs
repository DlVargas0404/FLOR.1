/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const remotePatterns = [];
if (supabaseUrl) {
  try {
    const u = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: u.protocol.replace(':', ''),
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: '/storage/v1/object/public/**',
    });
  } catch {
    // URL inválida: se ignora, las imágenes remotas no se optimizarán.
  }
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns,
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
