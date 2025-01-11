<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-700 p-5">
        <div class="w-full max-w-md bg-white rounded-xl shadow-2xl p-10 transform transition-transform duration-300 hover:-translate-y-2">
            <h1 class="text-2xl font-semibold text-gray-800 text-center mb-8 flex items-center justify-center">
                Panel
                <!-- <span class="relative ml-3 cursor-pointer" @mouseenter="showExtraIcons = true" @mouseleave="showExtraIcons = true">
                    <img src="../assets/ph--user-switch.svg" alt="switch" @click="switchToIndex()" class="w-5 h-5 transition-transform duration-300 hover:scale-110" loading="lazy">
                    <transition name="fade">
                        <div v-if="showExtraIcons" class="absolute left-full top-1/2 -translate-y-1/2 flex flex-col gap-3 pl-4">
                            <img src="../assets/chatgpt.svg" alt="Icon 2" @click="navigateTo('pandora')" class="w-5 h-5 transition-transform duration-300 hover:scale-110" loading="lazy">
                            <img src="../assets/claude.svg" alt="Icon 1" @click="navigateTo('claude')" class="w-5 h-5 transition-transform duration-300 hover:scale-110" loading="lazy">
                        </div>
                    </transition>
                </span> -->
            </h1>
            
            <form @submit.prevent="userlogin()" class="space-y-4">
                <input 
                    type="text" 
                    id="username" 
                    placeholder="用户名" 
                    required
                    class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition duration-300 text-base"
                >
                <input 
                    type="password" 
                    id="password" 
                    placeholder="密码" 
                    required
                    class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition duration-300 text-base"
                >
                <button 
                    type="submit"
                    class="w-full bg-orange-400 hover:bg-green-500 text-white py-3 px-4 rounded-lg transition duration-300 transform hover:-translate-y-0.5 relative"
                >
                    <span class="btn-text inline-block">登录</span>
                    <span class="spinner absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                </button>
            </form>

            <div class="relative flex items-center justify-center my-6">
                <div class="absolute w-full border-t border-gray-200"></div>
                <div class="relative bg-white px-4 text-sm text-gray-500">OR</div>
            </div>

            <div class="text-center space-y-4">
                <div class="flex justify-center">
                    <img 
                        src="../assets/linuxdo.webp" 
                        alt="LINUX DO" 
                        @click="initiateOAuth()" 
                        class="w-9 h-9 cursor-pointer transition-transform duration-300 hover:scale-110"
                        loading="lazy"
                    >
                </div>
                <button 
                    type="button" 
                    @click="reset()"
                    class="w-full bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400 hover:text-green-500 py-3 px-4 rounded-lg transition duration-300"
                >
                    重置密码
                </button>
            </div>

            <div class="mt-8 text-center">
                <a 
                    href="https://github.com/Kylsky/pandora-helper-with-linux-do-oauth" 
                    target="_blank"
                    class="text-sm text-gray-500 hover:text-green-500 transition duration-300"
                    @click="index()"
                >
                    Powered by Yeelo
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import config from '../configs/config'
import apiClient from '../configs/axios'
import message from '@/configs/message';

export default {
    name: 'IndexPage',
    props: {

    },
    data() {
        return {
            showExtraIcons: false
        };
    },
    methods: {

        reset() {
            this.$router.replace({ name: 'reset' });
        },

        async userlogin() {
            const button = document.querySelector('button[type="submit"]');
            button.classList.add('loading');
            
            var username = document.getElementById('username').value;
            var password = document.getElementById('password').value;

            try {
                const response = await apiClient.post(`${config.apiBaseUrl}/user/login`, {
                    username: username,
                    password: password,
                });

                this.loading = false;
                const status = response.data.status;
                if (!status) {
                    message.error(response.data.message);
                    button.classList.remove('loading');
                    return false;
                }
                const user = response.data;
                const token = user.data.jwt;
                const avatar = user.data.avatarUrl;
                localStorage.setItem("token", token)
                if (avatar) {
                    localStorage.setItem("img", avatar)
                }
                button.classList.remove('loading');

                this.$router.replace({ name: 'navi' });
            } catch (error) {
                button.classList.remove('loading');

                var response = response
                message.error(response);
            }
        },

        async initiateOAuth() {
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/oauth2/initiate?type=panel`);

                var data = response;
                console.log(data)
                if (data.data) {
                    window.location = data.data;  // 进行重定向
                } else {
                    console.error('No redirect URL provided');
                }
            } catch (error) {
                console.error('Request failed with status:', error);
            }
        },

        switchToIndex() {
            // this.$router.replace({ name: 'pandora' });
        },
        navigateTo(pageName) {
            this.$router.replace({ name: pageName });
        }
    }


}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}

button[type="submit"].loading .spinner {
    display: block;
}

button[type="submit"].loading .btn-text {
    visibility: hidden;
}

@keyframes spin {
    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

.spinner {
    animation: spin 1s linear infinite;
}
</style>