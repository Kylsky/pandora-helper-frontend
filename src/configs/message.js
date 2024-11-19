// utils/message.js
import { Message } from 'element-ui'

const message = {
  success(text, duration = 3000) {
    Message({
      message: text,
      type: 'success',
      duration: duration,
      showClose: true
    })
  },

  error(text, duration = 3000) {
    Message({
      message: text,
      type: 'error',
      duration: duration,
      showClose: true
    })
  },

  warning(text, duration = 3000) {
    Message({
      message: text,
      type: 'warning',
      duration: duration,
      showClose: true
    })
  },

  info(text, duration = 3000) {
    Message({
      message: text,
      type: 'info',
      duration: duration,
      showClose: true
    })
  },

  // 处理后端返回的消息
  handleResponse(response, successMsg = '操作成功') {
    if (response.data.status) {
      this.success(successMsg)
      return true
    } else {
      this.error(response.data.message || '操作失败')
      return false
    }
  },

  // 处理错误
  handleError(error) {
    if (error.response) {
      // 服务器返回错误状态码
      this.error(error.response.data.message || '请求失败')
    } else if (error.request) {
      // 请求发出但没有收到响应
      this.error('网络连接失败，请检查网络')
    } else {
      // 请求配置出错
      this.error('请求配置错误')
    }
  }
}

export default message