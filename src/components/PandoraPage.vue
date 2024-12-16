<template>
    <div id="pandora">

        <div class="login-container">
            <h1 style="margin-left: 10px">Pandora<span class="toggle-icon" @click="switchToFuclaude()"><img
                        src="../assets/ph--user-switch.svg" title="切换至Panel" alt="hi"></span></h1>

            <form @submit.prevent="userlogin()">
                <input type="text" id="username" placeholder="用户名" required>
                <input type="password" id="password" placeholder="密码" required>
                <button type="submit"><span class="btn-text">登录</span><span class="spinner"></span></button>
            </form>
            <div class="divider "><span>OR</span></div>
            <div class="alternative-login">
                <div class="oauth-buttons">
                    <img src="../assets/linuxdo.webp" alt="LINUX DO" @click="initiateOAuth()">
                </div>
                <button type="button" @click="reset()">重置密码</button>
            </div>
            <div class="footer">
                Powered by Pandora
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
                const response = await apiClient.post(`${config.apiBaseUrl}/pandora/login`, {
                    username: username,
                    password: password
                })

                const status = response.data.status
                if (status) {
                    button.classList.remove('loading');
                    window.open(response.data.data);
                } else {
                    var res = response.data.message
                    button.classList.remove('loading');
                    message.error(res);
                }
            } catch (error) {
                button.classList.remove('loading');
                message.error(error)
            }

        },

        async initiateOAuth() {
            try {
                const response = await apiClient.get(`${config.apiBaseUrl}/oauth2/initiate?type=ChatGPT`)

                var data = response;
                console.log(data)
                if (data.data) {
                    window.location = data.data;  // 进行重定向
                } else {
                    console.error('No redirect URL provided');
                }
            } catch (error) {
                message.error(error)
            }

        },

        switchToFuclaude() {
            this.$router.replace({ name: 'home' });
        }
    }
}

</script>

<style scoped>
#pandora {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.login-container {
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

.oauth-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
    margin-bottom: 10px;
}

.oauth-buttons img {
    width: 30px;
    height: 30px;
    cursor: pointer;
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
}

button:hover {
    background-color: #008f5b;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    margin-left: 7px;
    margin-right: 7px;
    border-bottom: 1px solid #ccc;
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 20px 0;
}

.alternative-login {
    text-align: center;
}

.alternative-login button {
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    transition: background-color 0.3s ease;
}

.alternative-login button:hover {
    background-color: #f5f5f5;
}

.footer {
    text-align: center;
    margin-top: 20px;
    color: #888;
    font-size: 12px;
}
button[type="submit"] {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* padding: 8px 16px; */
    min-width: 100px; /* 确保按钮有最小宽度 */
    min-height: 36px; /* 确保按钮有最小高度 */
}

/* 按钮文字样式 */
.btn-text {
    display: inline-block;
}

/* Loading时隐藏文字 */
button[type="submit"].loading .btn-text {
    display: none;
}

/* Spinner样式 */
.spinner {
    display: none;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: spin 1s linear infinite;
}

/* Spinner显示状态 */
button[type="submit"].loading .spinner {
    display: block;
}

@keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.btn-text {
    visibility: visible;
}

#loginForm {
    position: fixed;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    /*border: solid white;*/
    padding: 40px;
    /* 增加填充来使弹窗更大 */
    /*box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);*/
    background: white;
    display: none;
    width: 300px;
    /* 增加宽度 */
    height: auto;
    /* 自动调整高度 */
    z-index: 1000;
    /* 确保弹窗位于最顶层 */
}

.toggle-icon {
    margin-left: 10px;
    cursor: pointer;
    /*vertical-align: super;*/
}

.toggle-icon:hover {
    opacity: 0.7;
}
</style>
