<template>
    <div class="fixed inset-0 w-screen h-screen m-0 p-0 flex justify-center items-center bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black text-white font-sans">
        <div class="flex flex-col items-center justify-center">
            <div class="relative w-[150px] h-[150px] md:w-[150px] md:h-[150px] sm:w-[120px] sm:h-[120px]">
                <!-- 外层加载圈 -->
                <div class="absolute inset-0 w-full h-full rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin-slow"></div>
                <!-- 内层加载圈 -->
                <div class="absolute top-[15px] left-[15px] right-[15px] bottom-[15px] rounded-full border-4 border-transparent border-t-blue-400 border-r-blue-400 animate-spin-reverse"></div>
                <!-- 光晕效果 -->
                <div class="absolute -inset-5 rounded-full bg-blue-400 bg-opacity-10 dark:bg-blue-500 dark:bg-opacity-10 blur-md"></div>
            </div>
            <p class="mt-8 text-2xl font-medium text-white text-center drop-shadow-md sm:text-xl">正在授权，请稍候...</p>
            <p class="mt-2 text-base text-white text-opacity-70 text-center sm:text-sm">Loading...</p>
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
                }else if (data.shareType === 'api') {
                    await this.startAPI(data.username, data.jmc)
                }else if (data.shareType === 'grok') {
                    await this.startGrok(data.username, data.jmc)
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

        async startGrok(username, jmc) {
            const response = await apiClient.get(`${config.apiBaseUrl}/grok/checkUser?username=${username}&jmc=${jmc}`, {
                withCredentials: true,
            });
            if (response.data.status) {
                window.open(response.data.data)
            } else {
                message.error("您的账号未激活，请联系管理员")
                // localStorage.setItem('token', response.data.data)
                this.$router.replace({ name: '' });
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


        },

        async startAPI(username, jmc) {
            const response = await apiClient.get(`${config.apiBaseUrl}/api/checkUser?username=${username}&jmc=${jmc}`, {
                withCredentials: true,
            });
            if (response.data.status && response.data.data.isShared) {
                window.open(response.data.data.chatGptUrl)
            } else {
                message.error("您的账号未激活，请联系管理员")
                // localStorage.setItem('token', response.data.data)
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

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
    .animate-spin-slow {
        animation: spin 1.5s linear infinite;
    }
    .animate-spin-reverse {
        animation: spin 1s linear infinite reverse;
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

:root {
    @apply m-0 p-0 h-full;
}

html, 
body {
    @apply m-0 p-0 h-full overflow-hidden;
}
</style>