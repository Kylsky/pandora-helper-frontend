<template>
    <div class="min-h-screen flex justify-center items-center p-5 bg-gradient-to-br from-red-500 to-blue-800 font-sans">
        <div class="bg-white rounded-xl shadow-lg p-10 w-full max-w-md transform transition-transform duration-300 hover:-translate-y-2">
            <h1 class="text-center text-2xl font-semibold text-gray-800 mb-8">Fuclaude</h1>

            <form @submit.prevent="userlogin" class="space-y-4">
                <input type="text" id="username" placeholder="用户名" required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 text-base transition-all duration-300" v-model="username">
                <input type="password" id="password" placeholder="密码" required
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 text-base transition-all duration-300" v-model="password">
                <button type="submit" 
                    :class="{'loading': isLoading}"
                    class="relative w-full py-3 bg-red-500 text-white rounded-lg text-base font-medium transition-all duration-300 hover:bg-red-600 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500/50">
                    <span class="btn-text">登录</span>
                    <div class="spinner absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden">
                        <div class="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                </button>
            </form>

            <div class="relative flex items-center justify-center my-5">
                <div class="absolute w-full border-t border-gray-200"></div>
                <div class="relative px-4 bg-white text-sm text-gray-500">OR</div>
            </div>

            <div class="text-center">
                <div class="flex justify-center my-4">
                    <img src="../assets/linuxdo.webp" alt="LINUX DO" @click="initiateOAuth()" 
                        class="w-9 h-9 cursor-pointer transition-transform duration-300 hover:scale-110" loading="lazy">
                </div>
                <button type="button" @click="reset()"
                    class="w-full py-3 bg-white text-gray-800 border-2 border-gray-200 rounded-lg text-base font-medium transition-all duration-300 hover:border-red-500 hover:text-red-500 focus:outline-none">
                    重置密码
                </button>
            </div>

            <div class="text-center mt-8 text-sm text-gray-500">
                <span>Powered by Fuclaude</span>
            </div>
        </div>
    </div>
</template>

<script>
import config from '../configs/config'
import apiClient from '../configs/axios'
import message from '@/configs/message'


export default {
    name: 'ClaudePage',
    data() {
        return {
            isLoading: false,
            username: '',
            password: ''
        }
    },
    methods: {
        reset() {
            this.$emit('navigate', { name: 'reset' });
        },

        async userlogin() {
            this.isLoading = true;
            
            try {
                const response = await apiClient.post(`${config.apiBaseUrl}/fuclaude/login`, {
                    username: this.username,
                    password: this.password
                })

                const status = response.data.status
                if (status) {
                    window.open(response.data.data);
                } else {
                    var res = response.data.message
                    message.error(res)
                }
            } catch (error) {
                message.error(error)
            } finally {
                this.isLoading = false;
            }
        },

        async initiateOAuth() {
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/oauth2/initiate?type=claude`);
                var data = response;
                if (data.data) {
                    window.location = data.data;
                } else {
                    console.error('No redirect URL provided');
                }
            } catch (error) {
                console.error('Request failed with status:', error);
            }
        }
    }
}
</script>

<style scoped>
button[type="submit"].loading .spinner {
    display: block;
}

button[type="submit"].loading .btn-text {
    visibility: hidden;
}
</style>
