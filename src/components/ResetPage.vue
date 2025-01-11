<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#43cea2] to-[#185a9d] p-5">
        <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 transform transition-transform duration-300 hover:-translate-y-1">
            <h1 class="text-2xl md:text-3xl font-semibold text-gray-800 text-center mb-8">重置密码</h1>
            <form @submit.prevent="resetPassword()">
                <div class="space-y-4 mb-6">
                    <input 
                        type="text" 
                        id="username" 
                        placeholder="用户名" 
                        required
                        :disabled="isLoading"
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#43cea2] focus:outline-none focus:ring-2 focus:ring-[#43cea2] focus:ring-opacity-10 transition-all duration-300 disabled:opacity-50"
                    >
                    <input 
                        type="password" 
                        id="oldPassword" 
                        placeholder="旧密码" 
                        required
                        :disabled="isLoading"
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#43cea2] focus:outline-none focus:ring-2 focus:ring-[#43cea2] focus:ring-opacity-10 transition-all duration-300 disabled:opacity-50"
                    >
                    <input 
                        type="password" 
                        id="newPassword" 
                        placeholder="新密码" 
                        required
                        :disabled="isLoading"
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#43cea2] focus:outline-none focus:ring-2 focus:ring-[#43cea2] focus:ring-opacity-10 transition-all duration-300 disabled:opacity-50"
                    >
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        placeholder="再次确认新密码" 
                        required
                        :disabled="isLoading"
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#43cea2] focus:outline-none focus:ring-2 focus:ring-[#43cea2] focus:ring-opacity-10 transition-all duration-300 disabled:opacity-50"
                    >
                </div>
                <div class="space-y-3">
                    <button 
                        type="submit" 
                        :disabled="isLoading"
                        class="w-full bg-[#43cea2] hover:bg-[#3bb592] text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:-translate-y-0.5 relative disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        <span :class="{'invisible': isLoading}">重置</span>
                        <span class="absolute inset-0 flex items-center justify-center" :class="{'hidden': !isLoading}">
                            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </span>
                    </button>
                    <button 
                        type="button" 
                        @click="goHome()" 
                        :disabled="isLoading"
                        class="w-full bg-white text-gray-700 font-medium py-3 px-4 rounded-lg border-2 border-gray-200 hover:border-[#43cea2] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200"
                    >
                        返回主页
                    </button>
                </div>
            </form>
            <div class="text-center mt-8">
                <span class="text-gray-500 text-sm opacity-80 hover:opacity-100 transition-opacity duration-300">
                    Powered by Yeelo
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import config from '../configs/config'
import apiClient from '../configs/axios'

export default {
    name: 'ResetPage',
    data() {
        return {
            isLoading: false
        }
    },
    methods: {
        async resetPassword() {
            var username = document.getElementById('username').value;
            var oldPassword = document.getElementById('oldPassword').value;
            var newPassword = document.getElementById('newPassword').value;
            var confirmPassword = document.getElementById('confirmPassword').value;
            // 新密码和旧密码不等相同
            if (oldPassword === newPassword) {
                alert('新密码不能和旧密码相同，请重新输入。');
                return false; // 阻止表单提交
            }
            // newPassword 长度必须超过8位
            if (newPassword.length < 8) {
                alert('密码长度必须超过大于等于8位，请重新输入。');
                return false; // 阻止表单提交
            }
            if (newPassword !== confirmPassword) {
                alert('两次输入的密码不一致，请重新输入。');
                return false; // 阻止表单提交
            }

            this.isLoading = true;
            try {
                const response = await apiClient.post(`${config.apiBaseUrl}/pandora/reset`, {
                    username: username,
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                    confirmPassword: confirmPassword
                });

                const status = response.data.status;
                if (status) {
                    alert('密码重置成功！');
                    this.$router.replace({ name: 'home' });
                } else {
                    alert(response.data.message);
                }
            } catch (error) {
                alert(error);
            } finally {
                this.isLoading = false;
            }
        },

        async goHome() {
            this.$router.replace({ name: 'home' });
        }
    }
}
</script>
