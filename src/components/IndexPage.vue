<template>
    <div id="app">
        <div class="login-container">
            <h1 style="margin-left: 10px">
                Panel
                <span class="toggle-icon-container" @mouseenter="showExtraIcons = true"
                    @mouseleave="showExtraIcons = false">
                    <img src="../assets/ph--user-switch.svg" alt="switch" @click="switchToIndex()" loading="lazy">
                    <transition name="fade">
                        <div v-if="showExtraIcons" class="extra-icons">
                            <img src="../assets/chatgpt.svg" alt="Icon 2" @click="navigateTo('pandora')" loading="lazy">
                            <img src="../assets/claude.svg" alt="Icon 1" @click="navigateTo('claude')" loading="lazy">
                        </div>
                    </transition>
                </span>
            </h1>
            <form @submit.prevent="userlogin()">
                <input type="text" id="username" placeholder="用户名" required>
                <input type="password" id="password" placeholder="密码" required>
                <button type="submit"><span class="btn-text">登录</span><span class="spinner"></span></button>
            </form>
            <div class="divider "><span>OR</span></div>
            <div class="alternative-login">
                <div class="oauth-buttons">
                    <img src="../assets/linuxdo.webp" alt="LINUX DO" @click="initiateOAuth()" loading="lazy">
                </div>
                <button type="button" @click="reset()">重置密码</button>
            </div>
            <div class="footer" @click="index()">
                <a href="https://github.com/Kylsky/pandora-helper-with-linux-do-oauth" target="_blank">Powered by Yeelo</a>
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

#app {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: linear-gradient(135deg, #ffffff 0%, #185a9d 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    padding: 20px;
}

.login-container {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    padding: 40px;
    width: 100%;
    max-width: 400px;
    transition: transform 0.3s ease;
}

.login-container:hover {
    transform: translateY(-5px);
}

h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
    font-size: 28px;
    font-weight: 600;
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

.oauth-buttons {
    display: flex;
    justify-content: center;
    margin: 15px 0;
}

.oauth-buttons img {
    width: 35px;
    height: 35px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.oauth-buttons img:hover {
    transform: scale(1.1);
}

button {
    width: 100%;
    padding: 15px;
    background-color: #f0ad5e;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
}

button:hover {
    background-color: #3bb592;
    transform: translateY(-2px);
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 20px 0;
    color: #6c757d;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    border-bottom: 2px solid #eee;
    margin: 0 15px;
}

.alternative-login {
    text-align: center;
}

.alternative-login button {
    background-color: white;
    color: #2c3e50;
    border: 2px solid #eee;
    margin-top: 10px;
}

.alternative-login button:hover {
    border-color: #43cea2;
    color: #43cea2;
    background-color: white;
}

.footer {
    text-align: center;
    margin-top: 30px;
}

.footer a {
    color: #6c757d;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
}

.footer a:hover {
    color: #43cea2;
}

.toggle-icon-container {
    position: relative;
    display: inline-block;
    cursor: pointer;
    margin-left: 10px;
}

.extra-icons {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 15px;
    z-index: 10;
}

.extra-icons img {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
}

.extra-icons img:hover {
    transform: scale(1.2);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}

button[type="submit"] {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
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
}

button[type="submit"].loading .spinner {
    display: block;
}

button[type="submit"].loading .btn-text {
    visibility: hidden;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

</style>