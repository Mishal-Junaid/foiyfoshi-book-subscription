// Use http-proxy-middleware to handle proxying in development
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // API proxy
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests for debugging
        console.log('Proxying API request to:', req.method, req.path);
      }
    })
  );
  
  // Uploads proxy (for backend-uploaded images)
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/uploads': '/uploads' // Ensure the path is preserved
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests for debugging
        console.log('Proxying uploads request to:', req.path);
      },
      onError: (err, req, res) => {
        console.log(`Error proxying upload ${req.path}:`, err.message);
        res.status(404).send('Image not found');
      }
    })
  );
  
  // Images proxy (for public images)
  app.use(
    '/images',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: { '^/images': '/images' },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests for debugging
        console.log('Proxying request to:', req.path);
      },
      onError: (err, req, res) => {
        // Redirect to local placeholder image on error
        const imageName = req.path.split('/').pop();
        console.log(`Error proxying image ${imageName}:`, err.message);
        res.redirect(`/images/placeholder.jpg`);
      }
    })
  );
};
