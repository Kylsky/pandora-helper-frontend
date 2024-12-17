<template>
    <div id="reset">
        <div class="reset-container">
            <h1>重置密码</h1>
            <form @submit.prevent="resetPassword()">
                <div class="input-group">
                    <input type="text" id="username" placeholder="用户名" required>
                    <input type="password" id="oldPassword" placeholder="旧密码" required>
                    <input type="password" id="newPassword" placeholder="新密码" required>
                    <input type="password" id="confirmPassword" placeholder="再次确认新密码" required>
                </div>
                <div class="button-group">
                    <button type="submit" class="primary-button">
                        <span class="btn-text">重置</span>
                        <span class="spinner"></span>
                    </button>
                    <button type="button" class="home-button" @click="goHome()">返回主页</button>
                </div>
            </form>
            <div class="footer">
                <span>Powered by Yeelo</span>
            </div>
        </div>
    </div>
</template>

<script>
import config from '../configs/config'
import apiClient from '../configs/axios'

export default {
    name: 'ResetPage',
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
            }
        },

        async goHome() {
            this.$router.replace({ name: 'home' });
        }
    }
}
</script>

<style scoped>
#reset {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    padding: 20px;
}

.reset-container {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    padding: 40px;
    width: 100%;
    max-width: 400px;
    transition: transform 0.3s ease;
}

.reset-container:hover {
    transform: translateY(-5px);
}

h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
    font-size: 28px;
    font-weight: 600;
}

.input-group {
    margin-bottom: 20px;
}

input {
    width: 100%;
    padding: 15px;
    margin-bottom: 15px;
    border: 2px solid #eee;
    border-radius: 8px;
    box-sizing: border-box;
    font-size: 16px;
    transition: all 0.3s ease;
}

input:focus {
    border-color: #43cea2;
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 206, 162, 0.1);
}

.button-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

button {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.primary-button {
    background-color: #43cea2;
    color: white;
}

.primary-button:hover {
    background-color: #3bb592;
    transform: translateY(-2px);
}

.home-button {
    background-color: white;
    color: #2c3e50;
    border: 2px solid #eee;
}

.home-button:hover {
    background-color: #f8f9fa;
    border-color: #43cea2;
}

.footer {
    text-align: center;
    margin-top: 30px;
    color: #6c757d;
    font-size: 14px;
}

.footer span {
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.footer span:hover {
    opacity: 1;
}

.spinner {
    display: none;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

@keyframes spin {
    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

button.loading .btn-text {
    visibility: hidden;
}

button.loading .spinner {
    display: block;
}

@media (max-width: 480px) {
    .reset-container {
        padding: 30px 20px;
    }
    
    h1 {
        font-size: 24px;
    }
    
    input, button {
        padding: 12px;
    }
}
</style>
