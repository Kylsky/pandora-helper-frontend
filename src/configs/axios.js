import axios from 'axios';
import router from '@/router';
import config from '../configs/config'
import message from './message';


const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL, // 使用环境变量设置基础 API 地址
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 设置请求超时时间
});


apiClient.interceptors.response.use(
  (response) => {
    // 如果响应是 200，直接返回响应数据
    return response;
  },
  (error) => {
    // 检查错误响应状态码
    const { response } = error;
    console.log(error)
    if (response) {
      // 如果状态码是 302，手动处理重定向
      if (response.status === 302) {
        const redirectUrl = response.headers['location'];
        if (redirectUrl) {
          window.location.href = redirectUrl;  // 手动重定向到登录页面或目标地址
        }
      }

      // 如果状态码是 401，且不等于config.apiBaseUrl，跳转到登录页面
      console.log(response.config.url)
      if (response.status === 401 && response.config.url.startsWith(config.apiBaseUrl)) {
        router.push({ path: '/' });
      }else if (response.status === 401) {
        message.error('您没有权限访问该功能')
      }

    }

    // 返回错误信息给调用方
    return Promise.reject(error);
  }
);


export default apiClient;
