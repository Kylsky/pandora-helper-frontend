import axios from 'axios';

const config = {
  apiBaseUrl: 'https://connect.yeelo.fun', // 默认值
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