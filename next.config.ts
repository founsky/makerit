import type { NextConfig } from 'next'
const config: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: '52mb' } },
}
export default config
