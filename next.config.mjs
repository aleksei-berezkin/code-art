import bundleAnalyzer from '@next/bundle-analyzer'
import fs from 'node:fs'

const packageJson = JSON.parse(String(fs.readFileSync('package.json')))

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    webpack: (
      config,
      { webpack }
    ) => {
      config.plugins.push(
        new webpack.DefinePlugin({
          'codeArtDeps': JSON.stringify(
            [
              ...Object.keys(packageJson.dependencies),
              ...Object.keys(packageJson.devDependencies)
            ].sort()
          ),
          'codeArtVersion': JSON.stringify(packageJson.version),
        })
      )
      config.module.rules.push(
        {
          test: /\.shader/,
          type: 'asset/source',
        }
      )
      return config
    }
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
