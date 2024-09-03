import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL, // 使用环境变量设置基础 API 地址
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 设置请求超时时间
});

export default apiClient;
