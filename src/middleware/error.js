// src/middleware/error.js
export class AuthError extends Error {
    constructor(message) {
      super(message);
      this.name = 'AuthError';
      this.statusCode = 401;
    }
  }
  
  export const errorHandler = (err, req, res, next) => {
    console.error('Error details:', err);
  
    if (err instanceof AuthError) {
      return res.status(err.statusCode).json({
        status: 'error',
        message: err.message
      });
    }
  
    // Handle other types of errors
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  };