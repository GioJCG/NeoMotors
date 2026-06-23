const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || '/api',
  appName: 'NeoMotors',
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
  },
};

export default config;
