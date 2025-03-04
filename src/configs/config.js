import axios from 'axios';

const config = {
  apiBaseUrl: '',
  mjBaseUrl: 'https://discord.com',
};

export const loadConfig = async () => {
  try {
    const response = await axios.get(config.apiBaseUrl + '/oauth2/config');
    console.log(response.data.apiUrl)

    // config.apiBaseUrl = response.data.apiUrl || config.apiBaseUrl;
    config.mjBaseUrl = response.data.mjUrl || config.mjBaseUrl;
    // console.log('Configuration loaded:', config);
  } catch (error) {
    console.error('Error loading config:', error);
  }
};

export default config;