<template>
    <div class="min-h-screen flex justify-center items-center p-5 bg-gradient-to-br from-[#E6DADA] to-[#274046]">
        <div class="bg-white rounded-xl shadow-lg p-10 w-full max-w-md transform transition-transform duration-300 hover:-translate-y-2">
            <h1 class="text-center text-2xl font-semibold text-gray-800 mb-8">A P I</h1>

            <form @submit.prevent="userlogin()" class="space-y-4">
                <input type="text" v-model="formData.username" placeholder="用户名" required
                    class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#5D7B8A] focus:outline-none focus:ring-2 focus:ring-[#5D7B8A] focus:ring-opacity-10 text-base transition duration-300 text-gray-800">
                <input type="password" v-model="formData.password" placeholder="密码" required
                    class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#5D7B8A] focus:outline-none focus:ring-2 focus:ring-[#5D7B8A] focus:ring-opacity-10 text-base transition duration-300 text-gray-800">
                <button type="submit"
                    class="w-full py-3 bg-gradient-to-r from-[#5D7B8A] to-[#274046] hover:from-[#536e7c] hover:to-[#1e3238] text-white rounded-lg font-medium transition duration-300 hover:-translate-y-0.5 relative flex justify-center items-center">
                    <span :class="{ 'invisible': loading }">登录</span>
                    <span v-if="loading"
                        class="absolute w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin">
                    </span>
                </button>
            </form>

            <div class="relative flex items-center justify-center my-6">
                <div class="absolute w-full border-t border-gray-200"></div>
                <span class="relative px-4 bg-white text-gray-500">OR</span>
            </div>

            <div class="text-center">
                <div class="flex justify-center my-4">
                    <img src="../assets/linuxdo.webp" alt="LINUX DO" @click="initiateOAuth()"
                        class="w-9 h-9 cursor-pointer transition-transform duration-300 hover:scale-110" loading="lazy">
                </div>
                <button type="button" @click="reset()"
                    class="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium transition duration-300 hover:border-[#5D7B8A] hover:text-[#5D7B8A]">
                    重置密码
                </button>
            </div>

            <div class="mt-6 text-center">
                <div class="flex items-center justify-center gap-1.5 flex-wrap">
                    <a 
                        href="https://github.com/Kylsky/pandora-helper-with-linux-do-oauth" 
                        target="_blank"
                        class="text-xs text-gray-600 hover:text-[#5D7B8A] transition duration-300 flex items-center"
                    >
                        <svg class="w-3.5 h-3.5 mr-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                        Powered by Yeelo
                    </a>
                    <a 
                        href="https://github.com/Kylsky/pandora-helper-with-linux-do-oauth/stargazers" 
                        target="_blank"
                        class="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-xs font-medium text-gray-800 hover:from-yellow-100 hover:to-yellow-200 transition duration-300 border border-gray-200 shadow-sm"
                    >
                        <svg class="w-3 h-3 text-yellow-500 mr-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                        <span class="mr-0.5 text-xs">Stars</span>
                        <span class="bg-white px-1.5 py-0.5 rounded-full text-xs font-bold text-gray-700 min-w-[18px] inline-block">
                            <template v-if="isLoadingStars">
                                <svg class="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </template>
                            <template v-else-if="loadStarsFailed">
                                <span class="text-red-500" title="请切换网络重试">😅</span>
                            </template>
                            <template v-else>
                                {{ starCount }}
                            </template>
                        </span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import config from '../configs/config'
import apiClient from '../configs/axios'
import message from '@/configs/message'

export default {
    name: 'ApiPage',
    data() {
        return {
            loading: false,
            formData: {
                username: '',
                password: ''
            },
            starCount: 0,
            isLoadingStars: true,
            loadStarsFailed: false
        }
    },

    mounted() {
        this.fetchGitHubStars();
    },
    methods: {
        reset() {
            this.$emit('navigate', { name: 'reset' });
        },

        async fetchGitHubStars() {
            this.isLoadingStars = true;
            this.loadStarsFailed = false;
            try {
                const response = await fetch('https://api.github.com/repos/Kylsky/pandora-helper-with-linux-do-oauth');
                if (!response.ok) {
                    // 处理非200响应，包括403
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                this.starCount = data.stargazers_count;
            } catch (error) {
                console.error('Failed to fetch GitHub stars:', error);
                this.loadStarsFailed = true;
            } finally {
                this.isLoadingStars = false;
            }
        },

        async userlogin() {
            this.loading = true;

            try {
                const response = await apiClient.post(`${config.apiBaseUrl}/api/login`, {
                    username: this.formData.username,
                    password: this.formData.password
                })

                const status = response.data.status
                if (status) {
                    window.open(response.data.data);
                } else {
                    var res = response.data.message
                    message.error(res);
                }
            } catch (error) {
                message.error(error)
            } finally {
                this.loading = false;
            }
        },

        async initiateOAuth() {
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/oauth2/initiate?type=api`);
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

<style>
button[type="submit"].loading .spinner {
    display: block;
}

button[type="submit"].loading .btn-text {
    visibility: hidden;
}
</style> 