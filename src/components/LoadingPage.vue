<template>
    <div id="loading">
        <div class="loading-container">
            <div class="loader-wrapper">
                <div class="loader"></div>
                <div class="loader-inner"></div>
            </div>
            <p class="message">正在授权，请稍候...</p>
            <p class="sub-message">Loading...</p>
        </div>
    </div>
</template>
<script>


import config from '../configs/config'
import apiClient from '../configs/axios'
import message from '@/configs/message'
export default {

    name: 'LoadingPage',
    methods: {
        async fetchToken(code, state) {
            console.log(code, state)
            const response = await apiClient.get(`${config.apiBaseUrl}/oauth2/callback?code=${code}&state=${state}`, {
                withCredentials: true,
            });
            if (response.data.status) {
                let data = JSON.parse(response.data.data);
                console.log(data.avatar_url)
                localStorage.setItem('img', data.avatar_url)
                if (data.shareType === 'ChatGPT') {
                    await this.startGPTChat(data.username, data.jmc)
                } else if (data.shareType === 'Claude') {
                    await this.startClaudeChat(data.username, data.jmc)
                } else if (data.shareType === 'panel') {
                    await this.startPanel(data.username, data.jmc)
                }else if (data.shareType === 'midjourney') {
                    await this.startMidjourney(data.username, data.jmc)
                }
            }
        },

        async startGPTChat(username, jmc) {
            const response = await apiClient.get(`${config.apiBaseUrl}/pandora/checkUser?username=${username}&jmc=${jmc}`, {
                withCredentials: true,
            });
            if (response.data.status && response.data.data.isShared) {
                window.open(response.data.data.address)
            } else {
                message.error("您的账号未激活，请联系管理员")
                // localStorage.setItem('token', response.data.data)
                this.$router.replace({ name: 'pandora' });
            }
        },

        async startClaudeChat(username, jmc) {
            const response = await apiClient.get(`${config.apiBaseUrl}/fuclaude/checkUser?username=${username}&jmc=${jmc}`, {
                withCredentials: true,
            });
            if (response.data.status) {
                window.open(response.data.data)
            } else {
                message.error("您的账号未激活，请联系管理员")
                // localStorage.setItem('token', response.data.data)
                this.$router.replace({ name: 'claude' });
            }
        },

        async startPanel(username, jmc) {
            const response = await apiClient.get(`${config.apiBaseUrl}/share/checkUser?username=${username}&jmc=${jmc}`, {
                withCredentials: true,
            });
            if (response.data.status) {
                localStorage.setItem('token', response.data.data)
                this.$router.replace({ name: 'navi' });
            } else {
                message.error(response.data.message)
                this.$router.replace({ name: '' });
            }


        },

        async startMidjourney(username, jmc) {
            const response = await apiClient.get(`${config.apiBaseUrl}/share/checkUser?username=${username}&jmc=${jmc}`, {
                withCredentials: true,
            });
            if (response.data.status) {
                localStorage.setItem('token', response.data.data)
                this.$router.replace({ name: 'draw' });
            } else {
                message.error(response.data.message)
                this.$router.replace({ name: '' });
            }


        }

    },
    mounted() {
        // 获取url参数
        const url = new URL(window.location.href);

        // 使用URLSearchParams解析查询参数
        const params = new URLSearchParams(url.search);

        // 获取指定参数
        const code = params.get('code'); // 获取"name"参数
        const state = params.get('state');   // 获取"age"参数
        if (code && state) {
            this.fetchToken(code, state);
        }
    }
}
</script>

<style scoped>
#loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    color: #fff;
    font-family: 'Arial', sans-serif;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.loader-wrapper {
    position: relative;
    width: 150px;
    height: 150px;
}

.loader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 4px solid transparent;
    border-top-color: #3498db;
    border-right-color: #3498db;
    border-radius: 50%;
    animation: spin 1.5s linear infinite;
}

.loader-inner {
    position: absolute;
    top: 15px;
    left: 15px;
    right: 15px;
    bottom: 15px;
    border: 4px solid transparent;
    border-top-color: #03a9f4;
    border-right-color: #03a9f4;
    border-radius: 50%;
    animation: spin 1s linear infinite reverse;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.message {
    margin-top: 30px;
    font-size: 24px;
    font-weight: 500;
    color: #fff;
    text-align: center;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.sub-message {
    margin-top: 10px;
    font-size: 16px;
    color: rgba(255,255,255,0.7);
    text-align: center;
}

/* 添加一些光晕效果 */
.loader::after {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    border-radius: 50%;
    background: radial-gradient(
        circle,
        rgba(3, 169, 244, 0.1) 0%,
        transparent 70%
    );
}

/* 响应式设计 */
@media (max-width: 768px) {
    .loader-wrapper {
        width: 120px;
        height: 120px;
    }

    .message {
        font-size: 20px;
    }

    .sub-message {
        font-size: 14px;
    }
}

/* 确保根元素全屏 */
:root {
    margin: 0;
    padding: 0;
    height: 100%;
}

html, 
body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
}
</style>