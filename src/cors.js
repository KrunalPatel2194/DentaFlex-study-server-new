// cors.js
export const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    "https://dentaflex-study-app.vercel.app",
    "https://dentaflex-study-admin-portal.vercel.app",
    "http://localhost:3000",
    "http://localhost:3050"
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
};