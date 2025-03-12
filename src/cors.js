// middleware/cors-middleware.js
const allowedOrigins = [
    'https://dentaflex-study-admin-portal.vercel.app',
    'https://dentaflex-study-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:3050'
  ];
  
  export const corsMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    
    // Only set CORS headers if the origin is in our allowed list
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    next();
  };