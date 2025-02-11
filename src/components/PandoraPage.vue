<template>
    <div class="min-h-screen flex justify-center items-center p-5 bg-gradient-to-br from-[#43cea2] to-[#185a9d]">
        <div class="bg-white rounded-xl shadow-lg p-10 w-full max-w-md transform transition-transform duration-300 hover:-translate-y-2">
            <h1 class="text-center text-2xl font-semibold text-gray-800 mb-8">Pandora</h1>

            <form @submit.prevent="userlogin()" class="space-y-4">
                <input type="text" v-model="formData.username" placeholder="用户名" required
                    class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#43cea2] focus:outline-none focus:ring-2 focus:ring-[#43cea2] focus:ring-opacity-10 text-base transition duration-300">
                <input type="password" v-model="formData.password" placeholder="密码" required
                    class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#43cea2] focus:outline-none focus:ring-2 focus:ring-[#43cea2] focus:ring-opacity-10 text-base transition duration-300">
                <button type="submit"
                    class="w-full py-3 bg-[#43cea2] hover:bg-[#3bb592] text-white rounded-lg font-medium transition duration-300 hover:-translate-y-0.5 relative flex justify-center items-center">
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
                    class="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium transition duration-300 hover:border-[#43cea2] hover:text-[#43cea2]">
                    重置密码
                </button>
            </div>

            <div class="text-center mt-8">
                <a href="https://github.com/Kylsky/pandora-helper-with-linux-do-oauth" target="_blank"
                    class="text-sm text-gray-500 hover:text-[#43cea2] transition duration-300">
                    Powered by Pandora
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import config from '../configs/config'
import apiClient from '../configs/axios'
import message from '@/configs/message'

export default {
    name: 'PandoraPage',
    data() {
        return {
            loading: false,
            formData: {
                username: '',
                password: ''
            }
        }
    },
    methods: {
        reset() {
            this.$emit('navigate', { name: 'reset' });
        },

        async userlogin() {
            this.loading = true;

            try {
                const response = await apiClient.post(`${config.apiBaseUrl}/pandora/login`, {
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
                const response = await apiClient.get(`${config.apiBaseUrl}/oauth2/initiate?type=pandora`);
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
