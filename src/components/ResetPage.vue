<template>
    <div id="reset">
        <div class="reset-container">
            <h1>重置密码</h1>
            <form @submit.prevent="resetPassword()">
                <input type="text" id="username" placeholder="用户名" required>
                <input type="password" id="oldPassword" placeholder="旧密码" required>
                <input type="password" id="newPassword" placeholder="新密码" required>
                <input type="password" id="confirmPassword" placeholder="再次确认新密码" required>
                <button type="submit">重置</button>
                <button type="button" class="home-button" @click="goHome()">返回主页</button>
            </form>
            <div class="footer">
                Powered by Yeelo
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
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.reset-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 40px;
    width: 300px;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
}

input {
    width: 100%;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #00a86b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
    margin-top: 10px;
}

button:hover {
    background-color: #008f5b;
}

.home-button {
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    transition: background-color 0.3s ease;
}

.home-button:hover {
    background-color: #f5f5f5;
}

.footer {
    text-align: center;
    margin-top: 20px;
    color: #888;
    font-size: 12px;
}
</style>
