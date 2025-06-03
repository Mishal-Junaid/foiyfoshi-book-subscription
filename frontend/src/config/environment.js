const config = {
  development: {
    API_URL: 'http://localhost:5000',
    NODE_ENV: 'development'
  },
  production: {
    API_URL: 'https://foiyfoshi-backend.onrender.com',
    NODE_ENV: 'production'
  }
};

const environment = process.env.NODE_ENV || 'development';

export default config[environment]; 