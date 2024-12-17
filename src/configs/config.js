import axios from 'axios';

const config = {
  apiBaseUrl: 'http://127.0.0.1:8080', // 默认值
};

export const loadConfig = async () => {
  try {
    const response = await axios.get('/oauth2/config');
    console.log(response.data)
    config.apiBaseUrl = response.data || config.apiBaseUrl;
    // console.log('Configuration loaded:', config);
  } catch (error) {
    console.error('Error loading config:', error);
  }
};

export default config;