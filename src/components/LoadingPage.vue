<template>
    <div id="loading">
        <div>
            <div class="loader"></div>
            <p class="message">正在授权，请稍候...</p>
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
            console.log("hi")
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
#loading,
html {
    height: 100%;
    margin-bottom: 0;
    margin: 0;
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;
    color: #333;
}

.loader {
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid #3498db;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
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
    text-align: center;
    font-size: 20px;
    margin-top: 20px;
}

body,
html,
#app {
    margin: 0;
    /* 去除默认的外边距 */
    padding: 0;
    /* 去除默认的内边距，防止有内边距 */
    height: 100%;
}
</style>