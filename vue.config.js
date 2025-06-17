const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'  // Сохраняем /api в пути
        },
        onProxyReq: (proxyReq) => {
          // Добавляем заголовок для CORS
          proxyReq.setHeader('Origin', 'http://localhost:8081');
        }
      }
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      })
    ]
  },
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'assets'
}) 